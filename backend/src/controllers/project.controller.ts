import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { page = '1', limit = '20', status, contactId } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;

    if (authReq.user.role === 'EMPLOYEE') {
      where.members = { some: { id: authReq.user.id } };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true } },
          members: { select: { id: true, name: true, avatar: true } },
          _count: { select: { milestones: true, tasks: true, files: true } }
        }
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      projects,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const where = authReq.user.role === 'EMPLOYEE'
      ? { members: { some: { id: authReq.user.id } } }
      : {};

    const [total, active, completed, overdue] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.project.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.project.count({ where: { ...where, status: 'ACTIVE', endDate: { lt: new Date() } } })
    ]);

    res.json({ total, active, completed, overdue });
  } catch {
    res.status(500).json({ error: 'Failed to fetch project stats' });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id as string },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true } },
        members: { select: { id: true, name: true, email: true, avatar: true } },
        milestones: { orderBy: { dueDate: 'asc' } },
        tasks: { orderBy: { createdAt: 'desc' }, take: 20 },
        files: { orderBy: { createdAt: 'desc' }, take: 20 }
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
    const authReq = req as Express.Request & { user: Express.User };
    const { name, description, status, startDate, endDate, budget, contactId, memberIds } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'PLANNING',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? parseFloat(budget) : null,
        contactId,
        members: memberIds ? { connect: memberIds.map((id: string) => ({ id })) } : undefined
      }
    });

    await prisma.activity.create({
      data: {
        type: 'project_created',
        description: `New project created: ${name}`,
        userId: authReq.user.id,
        projectId: project.id,
        metadata: { projectId: project.id, projectName: name }
      }
    });

    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, status, startDate, endDate, budget, progress } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
        ...(progress !== undefined && { progress })
      }
    });

    res.json(project);
  } catch {
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id as string } });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.project.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Project deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

export const createMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate } = req.body;

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.id as string
      }
    });

    res.status(201).json(milestone);
  } catch {
    res.status(500).json({ error: 'Failed to create milestone' });
  }
};

export const updateMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, dueDate } = req.body;

    const milestone = await prisma.milestone.update({
      where: { id: req.params.milestoneId as string },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) })
      }
    });

    res.json(milestone);
  } catch {
    res.status(500).json({ error: 'Failed to update milestone' });
  }
};

export const completeMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const milestone = await prisma.milestone.update({
      where: { id: req.params.milestoneId as string },
      data: { isCompleted: true, completedAt: new Date() }
    });

    res.json(milestone);
  } catch {
    res.status(500).json({ error: 'Failed to complete milestone' });
  }
};

export const deleteMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.milestone.delete({ where: { id: req.params.milestoneId as string } });
    res.json({ message: 'Milestone deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
};

export const addMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data: { members: { connect: { id: userId } } },
      include: { members: { select: { id: true, name: true, avatar: true } } }
    });

    res.json(project);
  } catch {
    res.status(500).json({ error: 'Failed to add member' });
  }
};

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data: { members: { disconnect: { id: req.params.userId as string } } },
      include: { members: { select: { id: true, name: true, avatar: true } } }
    });

    res.json(project);
  } catch {
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
