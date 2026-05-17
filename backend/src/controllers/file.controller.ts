import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
  fileFilter
});

export const getAllFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', category } = req.query;

    const where: Record<string, unknown> = {};
    if (category) where.category = category;

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true } },
          project: { select: { id: true, name: true } }
        }
      }),
      prisma.file.count({ where })
    ]);

    res.json({
      files,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

export const getFileById = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id as string },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        project: { select: { id: true, name: true } }
      }
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    res.json(file);
  } catch {
    res.status(500).json({ error: 'Failed to fetch file' });
  }
};

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { category, contactId, projectId } = req.body;

    const file = await prisma.file.create({
      data: {
        name: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        category: category || null,
        contactId: contactId || null,
        projectId: projectId || null
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        project: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(file);
  } catch {
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id as string } });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    if (!fs.existsSync(file.path)) {
      res.status(404).json({ error: 'File not found on disk' });
      return;
    }

    res.download(file.path, file.originalName);
  } catch {
    res.status(500).json({ error: 'Failed to download file' });
  }
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id as string } });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await prisma.file.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'File deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

export const getContactFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = await prisma.file.findMany({
      where: { contactId: req.params.contactId as string },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ files });
  } catch {
    res.status(500).json({ error: 'Failed to fetch contact files' });
  }
};

export const getProjectFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = await prisma.file.findMany({
      where: { projectId: req.params.projectId as string },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ files });
  } catch {
    res.status(500).json({ error: 'Failed to fetch project files' });
  }
};
