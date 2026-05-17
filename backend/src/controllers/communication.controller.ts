import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllCommunications = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { page = '1', limit = '20', type, contactId } = req.query;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (contactId) where.contactId = contactId;

    if (authReq.user.role === 'EMPLOYEE') {
      where.userId = authReq.user.id;
    }

    const [communications, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true } },
          user: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.communication.count({ where })
    ]);

    res.json({
      communications,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
};

export const getCommunicationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const where = authReq.user.role === 'EMPLOYEE' ? { userId: authReq.user.id } : {};

    const [total, byType, thisMonth] = await Promise.all([
      prisma.communication.count({ where }),
      prisma.communication.groupBy({ by: ['type'], where, _count: true }),
      prisma.communication.count({
        where: {
          ...where,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      })
    ]);

    res.json({ total, byType, thisMonth });
  } catch {
    res.status(500).json({ error: 'Failed to fetch communication stats' });
  }
};

export const getCommunicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const communication = await prisma.communication.findUnique({
      where: { id: req.params.id as string },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true } },
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    if (!communication) {
      res.status(404).json({ error: 'Communication not found' });
      return;
    }

    res.json(communication);
  } catch {
    res.status(500).json({ error: 'Failed to fetch communication' });
  }
};

export const createCommunication = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { type, subject, content, direction, duration, outcome, notes, scheduledAt, contactId } = req.body;

    const communication = await prisma.communication.create({
      data: {
        type,
        subject,
        content,
        direction: direction || 'outbound',
        duration: duration ? parseInt(duration) : null,
        outcome,
        notes,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        contactId,
        userId: authReq.user.id
      }
    });

    res.status(201).json(communication);
  } catch {
    res.status(500).json({ error: 'Failed to create communication' });
  }
};

export const updateCommunication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, subject, content, direction, duration, outcome, notes, scheduledAt } = req.body;

    const communication = await prisma.communication.update({
      where: { id: req.params.id as string },
      data: {
        ...(type && { type }),
        ...(subject !== undefined && { subject }),
        ...(content !== undefined && { content }),
        ...(direction && { direction }),
        ...(duration !== undefined && { duration: duration ? parseInt(duration) : null }),
        ...(outcome !== undefined && { outcome }),
        ...(notes !== undefined && { notes }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null })
      }
    });

    res.json(communication);
  } catch {
    res.status(500).json({ error: 'Failed to update communication' });
  }
};

export const deleteCommunication = async (req: Request, res: Response): Promise<void> => {
  try {
    const communication = await prisma.communication.findUnique({ where: { id: req.params.id as string } });

    if (!communication) {
      res.status(404).json({ error: 'Communication not found' });
      return;
    }

    await prisma.communication.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Communication deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete communication' });
  }
};

export const getContactCommunications = async (req: Request, res: Response): Promise<void> => {
  try {
    const communications = await prisma.communication.findMany({
      where: { contactId: req.params.contactId as string },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.json({ communications });
  } catch {
    res.status(500).json({ error: 'Failed to fetch contact communications' });
  }
};
