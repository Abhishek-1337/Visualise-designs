import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';
import { can, canActOnRecord } from '../services/permission.service';

/**
 * CONTACTS
 */

export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user.role === 'CLIENT') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const { page = '1', limit = '20', status, country, search } = req.query;

    const where: any = { isArchived: false, tenantId: authReq.user.tenantId };
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

    if (!(await can(authReq.user, 'contact.view_all'))) {
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
    const authReq = req as AuthenticatedRequest;
    if (authReq.user.role === 'CLIENT') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
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

    if (!(await can(authReq.user, 'contact.view_all')) && contact.ownerId !== authReq.user.id) {
      res.status(403).json({ error: 'Not authorized to view this contact' });
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
    if (!(await can(authReq.user, 'contact.create'))) {
      res.status(403).json({ error: 'Not authorized to create contacts' });
      return;
    }
    const { firstName, lastName, email, phone, company, jobTitle, status, country, notes, value } = req.body;

    const contact = await prisma.contact.create({
      data: {
        firstName, lastName, email, phone, company, jobTitle,
        status: status || 'LEAD',
        country, notes,
        value: value ? parseFloat(value) : undefined,
        ownerId: authReq.user.id,
        tenantId: authReq.user.tenantId
      }
    });

    await prisma.activity.create({
      data: {
        type: 'contact_created',
        description: `New contact created: ${firstName} ${lastName}`,
        userId: authReq.user.id,
        contactId: contact.id,
        tenantId: authReq.user.tenantId,
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
    const contact = await prisma.contact.findFirst({ 
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId } 
    });

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }
    const isOwner = contact.ownerId === authReq.user.id;
    if (!(await canActOnRecord(authReq.user, 'contact.update_any', 'contact.update_own', isOwner))) {
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
    const authReq = req as AuthenticatedRequest;
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId }
    });
    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }
    const isOwner = contact.ownerId === authReq.user.id;
    if (!(await canActOnRecord(authReq.user, 'contact.delete_any', 'contact.delete_own', isOwner))) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }
    await prisma.contact.update({
      where: { id: contact.id },
      data: { isArchived: true }
    });
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
    const authReq = req as AuthenticatedRequest;
    const { page = '1', limit = '20', status, stage, assignedTo, contactId } = req.query;
    const where: any = { tenantId: authReq.user.tenantId };
    if (status) where.status = status;
    if (stage) where.stage = stage;
    if (assignedTo) where.assignedToId = assignedTo;
    if (contactId) where.contactId = contactId;

    if (authReq.user.role === 'CLIENT') {
      const contact = await prisma.contact.findFirst({
        where: { email: authReq.user.email, tenantId: authReq.user.tenantId }
      });
      where.contactId = contact?.id || 'none';
      // Clients should not see DRAFT deals
      if (where.status === 'DRAFT') {
        where.status = 'none';
      } else if (!where.status) {
        where.status = { not: 'DRAFT' };
      }
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true } },
          assignedTo: { select: { id: true, name: true, avatar: true } },
          project: { select: { id: true, name: true } }
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
    const authReq = req as AuthenticatedRequest;
    const deal = await prisma.deal.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true, company: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { id: true, name: true } } } }
      }
    });
    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    if (authReq.user.role === 'CLIENT' && deal.contact.email !== authReq.user.email) {
      res.status(403).json({ error: 'Not authorized to view this deal' });
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
    if (!(await can(authReq.user, 'deal.create'))) {
      res.status(403).json({ error: 'Not authorized to create deals' });
      return;
    }
    const { title, description, value, stage, contactId, assignedToId } = req.body;

    const deal = await prisma.deal.create({
      data: {
        title, description,
        value: parseFloat(value),
        stage: stage || 'NEW_LEAD',
        contactId, assignedToId,
        tenantId: authReq.user.tenantId
      }
    });

    await prisma.activity.create({
      data: {
        type: 'deal_created',
        description: `New deal: ${title}`,
        userId: authReq.user.id,
        dealId: deal.id,
        contactId,
        tenantId: authReq.user.tenantId
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
    const { stage, status } = req.body;
    
    const deal = await prisma.deal.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
      include: { contact: { select: { email: true } } }
    });

    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    const data: any = { ...req.body };
    if (data.value) data.value = parseFloat(data.value);

    if (authReq.user.role === 'CLIENT') {
      if (deal.contact.email !== authReq.user.email) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
      // Clients can only update status to ACCEPTED or CHANGES_REQUESTED
      const allowedStatuses = ['ACCEPTED', 'CHANGES_REQUESTED'];
      if (status && !allowedStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status update for client' });
        return;
      }
      // Restrict fields for clients
      delete data.value;
      delete data.stage;
      delete data.title;
      delete data.assignedToId;
      delete data.contactId;
    } else {
      const isAssigned = deal.assignedToId === authReq.user.id;
      if (!(await canActOnRecord(authReq.user, 'deal.update_any', 'deal.update_assigned', isAssigned))) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
    }

    const updated = await prisma.deal.update({
      where: { id: req.params.id as string },
      data
    });

    if (stage || status) {
      let desc = `Deal ${status ? 'status' : 'stage'} changed to ${status || stage}`;
      if (status === 'CHANGES_REQUESTED' && data.changeRequestNotes) {
        desc = `Client requested changes: ${data.changeRequestNotes}`;
      }
      await prisma.activity.create({
        data: {
          type: status ? 'deal_status_changed' : 'deal_stage_changed',
          description: desc,
          userId: authReq.user.id,
          dealId: req.params.id as string,
          tenantId: authReq.user.tenantId
        }
      });
    }

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update deal' });
  }
};

export const convertDealToProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;

    const deal = await prisma.deal.findFirst({
      where: { id, tenantId: authReq.user.tenantId },
      include: { contact: true }
    });

    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    if (!(await can(authReq.user, 'project.create'))) {
      res.status(403).json({ error: 'Not authorized to convert deals to projects' });
      return;
    }

    if (deal.status !== 'ACCEPTED') {
      res.status(400).json({ error: 'Only accepted deals can be converted to projects' });
      return;
    }

    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name: deal.title,
          description: deal.description,
          budget: deal.value,
          contactId: deal.contactId,
          tenantId: deal.tenantId,
          dealId: deal.id,
          status: 'PLANNING'
        }
      });

      await tx.deal.update({
        where: { id: deal.id },
        data: { status: 'CONVERTED_TO_PROJECT' }
      });

      await tx.activity.create({
        data: {
          type: 'deal_converted',
          description: `Deal "${deal.title}" converted to project`,
          userId: authReq.user.id,
          dealId: deal.id,
          projectId: newProject.id,
          tenantId: deal.tenantId
        }
      });

      return newProject;
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Convert deal error:', error);
    res.status(500).json({ error: 'Failed to convert deal to project' });
  }
};

export const deleteDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!(await can(authReq.user, 'deal.delete_any'))) {
      res.status(403).json({ error: 'Not authorized to delete deals' });
      return;
    }
    await prisma.deal.deleteMany({ where: { id: req.params.id as string, tenantId: authReq.user.tenantId } });
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
    const where: any = { tenantId: authReq.user.tenantId };
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;
    if (authReq.user.role === 'EMPLOYEE') where.members = { some: { id: authReq.user.id } };
    if (authReq.user.role === 'CLIENT') {
      const contact = await prisma.contact.findFirst({
        where: { email: authReq.user.email, tenantId: authReq.user.tenantId }
      });
      where.contactId = contact?.id || 'none';
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, email: true, company: true } },
          members: { select: { id: true, name: true, avatar: true } },
          deal: { select: { id: true, title: true, value: true, status: true } },
          tasks: { include: { assignedTo: { select: { id: true, name: true, avatar: true } } } },
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
    const authReq = req as AuthenticatedRequest;
    const project = await prisma.project.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true, company: true } },
        deal: { select: { id: true, title: true, value: true, status: true } },
        members: { select: { id: true, name: true, avatar: true } },
        tasks: { orderBy: { createdAt: 'desc' }, take: 10, include: { assignedTo: { select: { id: true, name: true, avatar: true } } } },
        activities: { orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { id: true, name: true } } } }
      }
    });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (authReq.user.role === 'CLIENT' && project.contact.email !== authReq.user.email) {
      res.status(403).json({ error: 'Not authorized to view this project' });
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
    if (!(await can(authReq.user, 'project.create'))) {
      res.status(403).json({ error: 'You do not have permission to create projects' });
      return;
    }
    const { name, description, status, budget, contactId, memberIds, startDate, endDate, dealId } = req.body;

    if (dealId) {
      const deal = await prisma.deal.findFirst({
        where: { id: dealId, tenantId: authReq.user.tenantId },
        include: { project: { select: { id: true } } }
      });

      if (!deal) {
        res.status(400).json({ error: 'Selected deal was not found' });
        return;
      }

      if (deal.contactId !== contactId) {
        res.status(400).json({ error: 'Selected deal belongs to a different client' });
        return;
      }

      if (deal.project) {
        res.status(400).json({ error: 'Selected deal is already linked to a project' });
        return;
      }
    }

    const project = await prisma.project.create({
      data: {
        name, description,
        status: status || 'PLANNING',
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        contactId,
        dealId: dealId || null,
        tenantId: authReq.user.tenantId,
        members: memberIds ? { connect: memberIds.map((id: string) => ({ id })) } : undefined
      }
    });

    await prisma.activity.create({
      data: {
        type: 'project_created',
        description: `New project: ${name}`,
        userId: authReq.user.id,
        projectId: project.id,
        contactId,
        dealId: dealId || undefined,
        tenantId: authReq.user.tenantId
      }
    });

    res.status(201).json(project);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Selected deal is already linked to a project' });
      return;
    }
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const project = await prisma.project.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
      select: { id: true, members: { select: { id: true } } }
    });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const isMember = project.members.some((m) => m.id === authReq.user.id);
    if (!(await canActOnRecord(authReq.user, 'project.update_any', 'project.update_member', isMember))) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.project.update({
      where: { id: project.id },
      data: {
        ...req.body,
        budget: req.body.budget ? parseFloat(req.body.budget) : undefined
      }
    });
    res.json({ message: 'Project updated' });
  } catch {
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!(await can(authReq.user, 'project.delete_any'))) {
      res.status(403).json({ error: 'Not authorized to delete projects' });
      return;
    }
    await prisma.project.deleteMany({ where: { id: req.params.id as string, tenantId: authReq.user.tenantId } });
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
    const where: any = { tenantId: authReq.user.tenantId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;
    if (projectId) where.projectId = projectId;
    if (contactId) where.contactId = contactId;
    if (authReq.user.role === 'EMPLOYEE' && !assignedTo) where.assignedToId = authReq.user.id;
    if (authReq.user.role === 'CLIENT') {
      const contact = await prisma.contact.findFirst({
        where: { email: authReq.user.email, tenantId: authReq.user.tenantId }
      });
      where.contactId = contact?.id || 'none';
    }

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
    if (!(await can(authReq.user, 'task.create'))) {
      res.status(403).json({ error: 'Not authorized to create tasks' });
      return;
    }
    const { title, description, priority, dueDate, contactId, projectId, assignedToId } = req.body;

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, tenantId: authReq.user.tenantId },
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
    }

    const task = await prisma.task.create({
      data: {
        title, description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        contactId, projectId,
        assignedToId,
        createdById: authReq.user.id,
        tenantId: authReq.user.tenantId
      }
    });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const task = await prisma.task.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId }
    });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    const isAssigned = task.assignedToId === authReq.user.id;
    if (!(await canActOnRecord(authReq.user, 'task.update_any', 'task.update_assigned', isAssigned))) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { title, description, priority, status, dueDate, assignedToId, contactId, projectId } = req.body;
    await prisma.task.updateMany({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(contactId !== undefined && { contactId }),
        ...(projectId !== undefined && { projectId }),
      }
    });
    res.json({ message: 'Task updated' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!(await can(authReq.user, 'task.delete_any'))) {
      res.status(403).json({ error: 'Not authorized to delete tasks' });
      return;
    }
    await prisma.task.deleteMany({ where: { id: req.params.id as string, tenantId: authReq.user.tenantId } });
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
    const authReq = req as AuthenticatedRequest;
    const { type, contactId, dealId, projectId } = req.query;
    const where: any = { tenantId: authReq.user.tenantId };
    if (type) where.type = type;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (projectId) where.projectId = projectId;

    if (contactId && !(await can(authReq.user, 'contact.view_all'))) {
      const contact = await prisma.contact.findFirst({
        where: { id: contactId as string, tenantId: authReq.user.tenantId, ownerId: authReq.user.id },
        select: { id: true }
      });
      if (!contact) {
        res.status(403).json({ error: 'Not authorized to view activities for this contact' });
        return;
      }
    }

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
    const authReq = req as AuthenticatedRequest;
    if (authReq.user.role === 'CLIENT') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const where = { tenantId: authReq.user.tenantId };
    const activeStatuses: any[] = ['DRAFT', 'SENT', 'CHANGES_REQUESTED', 'ACCEPTED'];

    const contactWhere: any = { ...where, isArchived: false };
    if (!(await can(authReq.user, 'contact.view_all'))) {
      contactWhere.ownerId = authReq.user.id;
    }

    const [contacts, deals, projects, tasks] = await Promise.all([
      prisma.contact.count({ where: contactWhere }),
      prisma.deal.count({ where: { ...where, status: { in: activeStatuses } } }),
      prisma.project.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.task.count({ where: { ...where, status: 'TODO' } })
    ]);

    const dealValue = await prisma.deal.aggregate({
      _sum: { value: true },
      where: { ...where, status: { in: activeStatuses } }
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
    if (authReq.user.role === 'CLIENT') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = { tenantId: authReq.user.tenantId };
    const isAdminOrManager = authReq.user.role === 'ADMIN' || authReq.user.role === 'MANAGER';

    const taskWhere: any = {
      ...where,
      status: { not: 'COMPLETED' },
      OR: [
        { dueDate: { gte: today, lt: tomorrow } },
        { dueDate: null }
      ]
    };

    // Employees see only their own tasks; Admin/Manager see all team tasks
    if (!isAdminOrManager) {
      taskWhere.assignedToId = authReq.user.id;
    }

    const [todaysTasks, recentActivities, stats] = await Promise.all([
      prisma.task.findMany({
        where: taskWhere,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true } },
          assignedTo: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { priority: 'asc' },
        take: isAdminOrManager ? 20 : 5
      }),
      prisma.activity.findMany({
        where,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } }
      }),
      prisma.deal.aggregate({
        _sum: { value: true },
        _count: true,
        where: { ...where, status: { in: ['DRAFT', 'SENT', 'CHANGES_REQUESTED', 'ACCEPTED'] } }
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

export const getTaskSummaries = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user.role === 'CLIENT') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isAdminOrManager = authReq.user.role === 'ADMIN' || authReq.user.role === 'MANAGER';

    // Get tasks completed today
    const completedTodayWhere: any = {
      tenantId: authReq.user.tenantId,
      status: 'COMPLETED',
      completedAt: { gte: today, lt: tomorrow }
    };

    // Get tasks due today OR tasks without a due date (still active)
    const dueTodayWhere: any = {
      tenantId: authReq.user.tenantId,
      status: { not: 'COMPLETED' },
      OR: [
        { dueDate: { gte: today, lt: tomorrow } },
        { dueDate: null }
      ]
    };

    // Employees only see their own summaries
    if (!isAdminOrManager) {
      completedTodayWhere.assignedToId = authReq.user.id;
      dueTodayWhere.assignedToId = authReq.user.id;
    }

    const [completedTasks, dueTasks, allTeamMembers] = await Promise.all([
      prisma.task.findMany({
        where: completedTodayWhere,
        include: {
          assignedTo: { select: { id: true, name: true, avatar: true } },
          contact: { select: { id: true, firstName: true, lastName: true, company: true } }
        }
      }),
      prisma.task.findMany({
        where: dueTodayWhere,
        include: {
          assignedTo: { select: { id: true, name: true, avatar: true } },
          contact: { select: { id: true, firstName: true, lastName: true, company: true } }
        }
      }),
      isAdminOrManager ? prisma.user.findMany({
        where: { tenantId: authReq.user.tenantId, isActive: true },
        select: { id: true, name: true, avatar: true }
      }) : []
    ]);

    // Group by user
    const userMap = new Map<string, {
      user: { id: string; name: string; avatar?: string };
      completedTasks: any[];
      pendingTasks: any[];
      totalCompleted: number;
      totalPending: number;
    }>();

    // Initialize all team members for admin/manager view
    if (isAdminOrManager) {
      allTeamMembers.forEach(member => {
        userMap.set(member.id, {
          user: member,
          completedTasks: [],
          pendingTasks: [],
          totalCompleted: 0,
          totalPending: 0
        });
      });
    }

    completedTasks.forEach(task => {
      const userId = task.assignedToId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: task.assignedTo,
          completedTasks: [],
          pendingTasks: [],
          totalCompleted: 0,
          totalPending: 0
        });
      }
      const entry = userMap.get(userId)!;
      entry.completedTasks.push(task);
      entry.totalCompleted++;
    });

    dueTasks.forEach(task => {
      const userId = task.assignedToId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: task.assignedTo,
          completedTasks: [],
          pendingTasks: [],
          totalCompleted: 0,
          totalPending: 0
        });
      }
      const entry = userMap.get(userId)!;
      entry.pendingTasks.push(task);
      entry.totalPending++;
    });

    const dailyReport = Array.from(userMap.values()).filter(
      entry => entry.totalCompleted > 0 || entry.totalPending > 0
    );

    res.json({ dailyReport });
  } catch {
    res.status(500).json({ error: 'Failed to fetch task summaries' });
  }
};
