import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';
import { can, canActOnRecord } from '../services/permission.service';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

/** Resolves the Contact record linked to a CLIENT user's own email, if any. */
async function getClientContactId(tenantId: string, email: string): Promise<string | undefined> {
  const contact = await prisma.contact.findFirst({ where: { email, tenantId } });
  return contact?.id;
}

/** Whether a CLIENT (identified by their own contact id) may see/download a given file. */
async function isFileVisibleToClient(
  tenantId: string,
  clientContactId: string | undefined,
  file: { contactId: string | null; projectId: string | null }
): Promise<boolean> {
  if (!clientContactId) return false;
  if (file.contactId === clientContactId) return true;
  if (file.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: file.projectId, tenantId, contactId: clientContactId },
      select: { id: true },
    });
    return !!project;
  }
  return false;
}

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    if (!(await can(authReq.user, 'file.upload'))) {
      res.status(403).json({ error: 'Not authorized to upload files' });
      return;
    }

    const { contactId, projectId, description } = req.body;

    // If a CLIENT is granted upload access, they may only attach files to their own contact/project.
    if (authReq.user.role === 'CLIENT') {
      const clientContactId = await getClientContactId(authReq.user.tenantId, authReq.user.email);
      const visible = await isFileVisibleToClient(authReq.user.tenantId, clientContactId, {
        contactId: contactId || null,
        projectId: projectId || null,
      });
      if (!visible) {
        res.status(403).json({ error: 'Not authorized to upload to this contact/project' });
        return;
      }
    }

    const key = `${uuidv4()}-${file.originalname}`;
    const destPath = path.join(UPLOAD_DIR, key);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.renameSync(file.path, destPath);

    const record = await prisma.file.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        key,
        url: `/uploads/${key}`,
        description: description || null,
        contactId: contactId || null,
        projectId: projectId || null,
        uploadedById: authReq.user.id,
        tenantId: authReq.user.tenantId,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    await prisma.activity.create({
      data: {
        type: 'file_uploaded',
        description: `File uploaded: ${file.originalname}`,
        userId: authReq.user.id,
        contactId: contactId || null,
        projectId: projectId || null,
        tenantId: authReq.user.tenantId,
        metadata: { fileId: record.id, fileName: file.originalname, size: file.size },
      },
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const getAllFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { contactId, projectId, page = '1', limit = '20' } = req.query;

    const where: any = { tenantId: authReq.user.tenantId };
    if (contactId) where.contactId = contactId;
    if (projectId) where.projectId = projectId;

    if (authReq.user.role === 'CLIENT') {
      const clientContactId = await getClientContactId(authReq.user.tenantId, authReq.user.email);
      where.OR = [
        { contactId: clientContactId || 'none' },
        { projectId: { not: null, project: { contactId: clientContactId || 'none' } } },
      ];
    }

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.file.count({ where }),
    ]);

    res.json({
      files,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

export const getFileById = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const file = await prisma.file.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    if (authReq.user.role === 'CLIENT') {
      const clientContactId = await getClientContactId(authReq.user.tenantId, authReq.user.email);
      if (!(await isFileVisibleToClient(authReq.user.tenantId, clientContactId, file))) {
        res.status(403).json({ error: 'Not authorized to view this file' });
        return;
      }
    }

    res.json(file);
  } catch {
    res.status(500).json({ error: 'Failed to fetch file' });
  }
};

export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const file = await prisma.file.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    if (authReq.user.role === 'CLIENT') {
      const clientContactId = await getClientContactId(authReq.user.tenantId, authReq.user.email);
      if (!(await isFileVisibleToClient(authReq.user.tenantId, clientContactId, file))) {
        res.status(403).json({ error: 'Not authorized to download this file' });
        return;
      }
    }

    const filePath = path.join(UPLOAD_DIR, file.key);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found on disk' });
      return;
    }

    res.download(filePath, file.originalName);
  } catch {
    res.status(500).json({ error: 'Failed to download file' });
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const file = await prisma.file.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const isOwnUpload = file.uploadedById === authReq.user.id;
    if (!(await canActOnRecord(authReq.user, 'file.delete_any', 'file.delete_own', isOwnUpload))) {
      res.status(403).json({ error: 'Not authorized to delete this file' });
      return;
    }

    const filePath = path.join(UPLOAD_DIR, file.key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.file.delete({ where: { id: file.id } });

    res.json({ message: 'File deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete file' });
  }
};
