import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { page = '1', limit = '20', unreadOnly } = req.query;

    const where: any = { userId: authReq.user.id, tenantId: authReq.user.tenantId };
    if (unreadOnly === 'true') where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: authReq.user.id, tenantId: authReq.user.tenantId, isRead: false },
      }),
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    await prisma.notification.updateMany({
      where: { id: req.params.id as string, userId: authReq.user.id, tenantId: authReq.user.tenantId },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    await prisma.notification.updateMany({
      where: { userId: authReq.user.id, tenantId: authReq.user.tenantId, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    await prisma.notification.deleteMany({
      where: { id: req.params.id as string, userId: authReq.user.id, tenantId: authReq.user.tenantId },
    });
    res.json({ message: 'Notification deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const count = await prisma.notification.count({
      where: { userId: authReq.user.id, tenantId: authReq.user.tenantId, isRead: false },
    });
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};
