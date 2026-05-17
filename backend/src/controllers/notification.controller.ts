import { Request, Response } from 'express';
import prisma from '../config/database';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { page = '1', limit = '20', isRead } = req.query;

    const where: Record<string, unknown> = { userId: authReq.user.id };
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      notifications,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const count = await prisma.notification.count({
      where: { userId: authReq.user.id, isRead: false }
    });

    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id as string }
    });

    if (!notification || notification.userId !== authReq.user.id) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id as string },
      data: { isRead: true }
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    await prisma.notification.updateMany({
      where: { userId: authReq.user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch {
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id as string }
    });

    if (!notification || notification.userId !== authReq.user.id) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    await prisma.notification.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Notification deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};
