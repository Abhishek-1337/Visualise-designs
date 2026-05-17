import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { page = '1', limit = '20', status, priority, assignedTo, projectId, contactId } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;
    if (projectId) where.projectId = projectId;
    if (contactId) where.contactId = contactId;

    if (authReq.user.role === 'EMPLOYEE' && !assignedTo) {
      where.assignedToId = authReq.user.id;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { dueDate: 'asc' },
        include: {
          assignedTo: { select: { id: true, name: true, avatar: true } },
          contact: { select: { id: true, firstName: true, lastName: true, company: true } },
          project: { select: { id: true, name: true } }
        }
      }),
      prisma.task.count({ where })
    ]);

    res.json({
      tasks,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTaskStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const where = authReq.user.role === 'EMPLOYEE'
      ? { assignedToId: authReq.user.id }
      : {};

    const [total, byStatus, byPriority, overdue] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.groupBy({ by: ['status'], where, _count: true }),
      prisma.task.groupBy({ by: ['priority'], where, _count: true }),
      prisma.task.count({ where: { ...where, status: { not: 'COMPLETED' }, dueDate: { lt: new Date() } } })
    ]);

    res.json({ total, byStatus, byPriority, overdue });
  } catch {
    res.status(500).json({ error: 'Failed to fetch task stats' });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id as string },
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        project: { select: { id: true, name: true, status: true } }
      }
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json(task);
  } catch {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { title, description, priority, dueDate, contactId, projectId, assignedToId } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        contactId: contactId || null,
        projectId: projectId || null,
        assignedToId: assignedToId || authReq.user.id,
        createdById: authReq.user.id
      }
    });

    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, priority, dueDate, contactId, projectId, assignedToId } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id as string },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(contactId !== undefined && { contactId: contactId || null }),
        ...(projectId !== undefined && { projectId: projectId || null }),
        ...(assignedToId && { assignedToId })
      }
    });

    res.json(task);
  } catch {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid task status' });
      return;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id as string },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : undefined
      }
    });

    res.json(task);
  } catch {
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id as string } });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await prisma.task.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Task deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const getMyTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { status } = req.query;

    const where: Record<string, unknown> = { assignedToId: authReq.user.id };
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        project: { select: { id: true, name: true } }
      }
    });

    res.json({ tasks });
  } catch {
    res.status(500).json({ error: 'Failed to fetch my tasks' });
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
      orderBy: [{ priority: 'asc' }, { title: 'asc' }],
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
