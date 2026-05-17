import { Request, Response } from 'express';
import prisma from '../config/database';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasksWhere = authReq.user.role === 'EMPLOYEE'
      ? { assignedToId: authReq.user.id }
      : {};

    const contactsWhere = authReq.user.role === 'EMPLOYEE'
      ? { ownerId: authReq.user.id, isArchived: false }
      : { isArchived: false };

    const [
      todaysTasks,
      taskStats,
      dealStats,
      invoiceStats,
      recentActivities,
      contactCount
    ] = await Promise.all([
      prisma.task.findMany({
        where: {
          ...tasksWhere,
          status: { not: 'COMPLETED' },
          dueDate: { gte: today, lt: tomorrow }
        },
        orderBy: { priority: 'asc' },
        take: 10,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true } }
        }
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: tasksWhere,
        _count: true
      }),
      prisma.deal.aggregate({
        _sum: { value: true },
        _count: true,
        where: { status: 'OPEN' }
      }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: { in: ['PENDING', 'OVERDUE'] } }
      }),
      prisma.activity.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          deal: { select: { id: true, title: true } }
        }
      }),
      prisma.contact.count({ where: contactsWhere })
    ]);

    res.json({
      todaysTasks,
      taskStats,
      dealStats: {
        totalOpen: dealStats._count,
        totalValue: dealStats._sum.value || 0
      },
      invoiceStats: {
        pendingAmount: invoiceStats._sum.total || 0
      },
      recentActivities,
      contactCount
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

export const getFinancialOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const where = authReq.user.role === 'EMPLOYEE'
      ? { createdById: authReq.user.id }
      : {};

    const [totalRevenue, pending, overdue, recentTransactions] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { ...where, status: 'PAID' }
      }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { ...where, status: 'PENDING' }
      }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { ...where, status: 'OVERDUE' }
      }),
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true } }
        }
      })
    ]);

    res.json({
      totalRevenue: totalRevenue._sum.total || 0,
      pending: pending._sum.total || 0,
      overdue: overdue._sum.total || 0,
      recentTransactions
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch financial overview' });
  }
};

export const getTodaysTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: authReq.user.id,
        status: { not: 'COMPLETED' },
        dueDate: { gte: today, lt: tomorrow }
      },
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        project: { select: { id: true, name: true } }
      }
    });

    res.json({ tasks });
  } catch {
    res.status(500).json({ error: 'Failed to fetch today\'s tasks' });
  }
};

export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const where = authReq.user.role === 'EMPLOYEE'
      ? { userId: authReq.user.id }
      : {};

    const activities = await prisma.activity.findMany({
      where,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        deal: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } }
      }
    });

    res.json({ activities });
  } catch {
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};
