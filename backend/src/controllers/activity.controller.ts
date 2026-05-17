import { Request, Response } from 'express';
import prisma from '../config/database';

export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { page = '1', limit = '50', type, userId } = req.query;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          deal: { select: { id: true, title: true } },
          project: { select: { id: true, name: true } }
        }
      }),
      prisma.activity.count({ where })
    ]);

    res.json({
      activities,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

export const getRecentActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const where = authReq.user.role === 'EMPLOYEE'
      ? { userId: authReq.user.id }
      : {};

    const activities = await prisma.activity.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        deal: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } }
      }
    });

    res.json({ activities });
  } catch {
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
};

export const createActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { type, description, dealId, projectId, metadata } = req.body;

    const activity = await prisma.activity.create({
      data: {
        type,
        description,
        userId: authReq.user.id,
        dealId: dealId || null,
        projectId: projectId || null,
        metadata: metadata || {}
      }
    });

    res.status(201).json(activity);
  } catch {
    res.status(500).json({ error: 'Failed to create activity' });
  }
};
