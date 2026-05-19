import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

/**
 * CONTACTS
 */

export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { page = '1', limit = '20', status, country, search } = req.query;

    const where: any = { isArchived: false };
    if (status) where.status = status;
    if (country) where.country = country;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (authReq.user.role === 'EMPLOYEE') {
      where.ownerId = authReq.user.id;
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, avatar: true } },
          _count: { select: { deals: true, projects: true, tasks: true } }
        }
      }),
      prisma.contact.count({ where })
    ]);

    res.json({
      contacts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

export const getContactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id as string },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        deals: { orderBy: { createdAt: 'desc' }, take: 10 },
        projects: { orderBy: { createdAt: 'desc' }, take: 10 },
        tasks: { where: { status: { not: 'COMPLETED' } }, orderBy: { dueDate: 'asc' } },
        activities: { orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { id: true, name: true, avatar: true } } } }
      }
    });

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json(contact);
  } catch {
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
};

export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { firstName, lastName, email, phone, company, jobTitle, status, country, notes, value } = req.body;

    const contact = await prisma.contact.create({
      data: {
        firstName, lastName, email, phone, company, jobTitle,
        status: status || 'LEAD',
        country, notes,
        value: value ? parseFloat(value) : undefined,
        ownerId: authReq.user.id
      }
    });

    await prisma.activity.create({
      data: {
        type: 'contact_created',
        description: `New contact created: ${firstName} ${lastName}`,
        userId: authReq.user.id,
        contactId: contact.id,
        metadata: { contactId: contact.id }
      }
    });

    res.status(201).json(contact);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Contact with this email already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const contact = await prisma.contact.findUnique({ where: { id: req.params.id as string } });

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }
    if (authReq.user.role === 'EMPLOYEE' && contact.ownerId !== authReq.user.id) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updated = await prisma.contact.update({
      where: { id: req.params.id as string },
      data: req.body
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.contact.update({ where: { id: req.params.id as string }, data: { isArchived: true } });
    res.json({ message: 'Contact archived' });
  } catch {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};


/**
 * DEALS
 */

export const getAllDeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', status, stage, assignedTo } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (stage) where.stage = stage;
    if (assignedTo) where.assignedToId = assignedTo;

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true } },
          assignedTo: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.deal.count({ where })
    ]);

    res.json({ deals, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
};

export const getDealById = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id as string },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { id: true, name: true } } } }
      }
    });
    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    res.json(deal);
  } catch {
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
};

export const createDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { title, description, value, stage, contactId, assignedToId } = req.body;

    const deal = await prisma.deal.create({
      data: {
        title, description,
        value: parseFloat(value),
        stage: stage || 'NEW_LEAD',
        contactId, assignedToId
      }
    });

    await prisma.activity.create({
      data: {
        type: 'deal_created',
        description: `New deal: ${title}`,
        userId: authReq.user.id,
        dealId: deal.id,
        contactId
      }
    });

    res.status(201).json(deal);
  } catch {
    res.status(500).json({ error: 'Failed to create deal' });
  }
};

export const updateDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { stage } = req.body;
    
    const updated = await prisma.deal.update({
      where: { id: req.params.id as string },
      data: {
        ...req.body,
        value: req.body.value ? parseFloat(req.body.value) : undefined
      }
    });

    if (stage && stage !== updated.stage) {
      await prisma.activity.create({
        data: {
          type: 'deal_stage_changed',
          description: `Deal moved to ${stage}`,
          userId: authReq.user.id,
          dealId: updated.id,
          contactId: updated.contactId
        }
      });
    }

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update deal' });
  }
};

export const deleteDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.deal.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Deal deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete deal' });
  }
};


/**
 * PROJECTS
 */

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { page = '1', limit = '20', status, contactId } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;
    if (authReq.user.role === 'EMPLOYEE') where.members = { some: { id: authReq.user.id } };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true } },
          members: { select: { id: true, name: true, avatar: true } },
          _count: { select: { tasks: true } }
        }
      }),
      prisma.project.count({ where })
    ]);

    res.json({ projects, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id as string },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        members: { select: { id: true, name: true, avatar: true } },
        tasks: { orderBy: { createdAt: 'desc' }, take: 10 },
        activities: { orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { id: true, name: true } } } }
      }
    });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { name, description, status, budget, contactId, memberIds } = req.body;

    const project = await prisma.project.create({
      data: {
        name, description,
        status: status || 'PLANNING',
        budget: budget ? parseFloat(budget) : null,
        contactId,
        members: memberIds ? { connect: memberIds.map((id: string) => ({ id })) } : undefined
      }
    });

    await prisma.activity.create({
      data: {
        type: 'project_created',
        description: `New project: ${name}`,
        userId: authReq.user.id,
        projectId: project.id,
        contactId
      }
    });

    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await prisma.project.update({
      where: { id: req.params.id as string },
      data: {
        ...req.body,
        budget: req.body.budget ? parseFloat(req.body.budget) : undefined
      }
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.project.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Project deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

/**
 * TASKS
 */

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { status, priority, assignedTo, projectId, contactId } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;
    if (projectId) where.projectId = projectId;
    if (contactId) where.contactId = contactId;
    if (authReq.user.role === 'EMPLOYEE' && !assignedTo) where.assignedToId = authReq.user.id;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        assignedTo: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } }
      }
    });
    res.json({ tasks });
  } catch {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { title, description, priority, dueDate, contactId, projectId, assignedToId } = req.body;
    const task = await prisma.task.create({
      data: {
        title, description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        contactId, projectId,
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
    const updated = await prisma.task.update({
      where: { id: req.params.id as string },
      data: {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
      }
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.task.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Task deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

/**
 * ACTIVITIES
 */

export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, contactId, dealId, projectId } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (projectId) where.projectId = projectId;

    const activities = await prisma.activity.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });
    res.json({ activities });
  } catch {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

export const getCRMStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [contacts, deals, projects, tasks] = await Promise.all([
      prisma.contact.count({ where: { isArchived: false } }),
      prisma.deal.count({ where: { status: 'OPEN' } }),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.task.count({ where: { status: 'TODO' } })
    ]);

    const dealValue = await prisma.deal.aggregate({
      _sum: { value: true },
      where: { status: 'OPEN' }
    });

    res.json({
      contacts,
      activeDeals: deals,
      pipelineValue: dealValue._sum.value || 0,
      activeProjects: projects,
      pendingTasks: tasks
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todaysTasks, recentActivities, stats] = await Promise.all([
      prisma.task.findMany({
        where: {
          assignedToId: authReq.user.id,
          status: { not: 'COMPLETED' },
          dueDate: { gte: today, lt: tomorrow }
        },
        include: { contact: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { priority: 'asc' },
        take: 5
      }),
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } }
      }),
      prisma.deal.aggregate({
        _sum: { value: true },
        _count: true,
        where: { status: 'OPEN' }
      })
    ]);

    res.json({
      todaysTasks,
      recentActivities,
      stats: {
        openDeals: stats._count,
        pipelineValue: stats._sum.value || 0
      }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};
