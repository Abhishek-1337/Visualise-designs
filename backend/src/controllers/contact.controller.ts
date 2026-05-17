import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { page = '1', limit = '20', status, source, country, search } = req.query;

    const where: Record<string, unknown> = { isArchived: false };
    
    if (status) where.status = status;
    if (source) where.source = source;
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
          owner: {
            select: { id: true, name: true, avatar: true }
          },
          _count: {
            select: {
              deals: true,
              projects: true,
              communications: true,
              invoices: true
            }
          }
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

export const getContactStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const where = authReq.user.role === 'EMPLOYEE' 
      ? { ownerId: authReq.user.id, isArchived: false }
      : { isArchived: false };

    const [total, byStatus, byCountry] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.contact.groupBy({
        by: ['country'],
        where,
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 10
      })
    ]);

    res.json({ total, byStatus, byCountry });
  } catch {
    res.status(500).json({ error: 'Failed to fetch contact stats' });
  }
};

export const getContactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id as string },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        deals: { orderBy: { createdAt: 'desc' }, take: 10 },
        projects: { orderBy: { createdAt: 'desc' }, take: 10 },
        communications: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        files: { orderBy: { createdAt: 'desc' }, take: 20 },
        tasks: {
          where: { status: { not: 'COMPLETED' } },
          orderBy: { dueDate: 'asc' }
        }
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
    const {
      firstName, lastName, email, phone, company, jobTitle,
      status, source, website, address, city, state, country,
      postalCode, notes, value
    } = req.body;

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        status: status || 'LEAD',
        source,
        website,
        address,
        city,
        state,
        country,
        postalCode,
        notes,
        value: value ? parseFloat(value) : undefined,
        ownerId: authReq.user.id
      }
    });

    await prisma.activity.create({
      data: {
        type: 'contact_created',
        description: `New contact created: ${firstName} ${lastName}`,
        userId: authReq.user.id,
        metadata: { contactId: contact.id, contactName: `${firstName} ${lastName}` }
      }
    });

    res.status(201).json(contact);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      res.status(400).json({ error: 'Contact with this email already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id as string }
    });

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    if (authReq.user.role === 'EMPLOYEE' && contact.ownerId !== authReq.user.id) {
      res.status(403).json({ error: 'Not authorized to update this contact' });
      return;
    }

    const updated = await prisma.contact.update({
      where: { id: req.params.id as string },
      data: req.body
    });

    res.json(updated);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      res.status(400).json({ error: 'Contact with this email already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id as string }
    });

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    await prisma.contact.update({
      where: { id: req.params.id as string },
      data: { isArchived: true }
    });

    res.json({ message: 'Contact archived successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};

export const searchContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { q } = req.query;

    if (!q || (q as string).length < 2) {
      res.json({ contacts: [] });
      return;
    }

    const where: Record<string, unknown> = {
      isArchived: false,
      OR: [
        { firstName: { contains: q as string, mode: 'insensitive' } },
        { lastName: { contains: q as string, mode: 'insensitive' } },
        { email: { contains: q as string, mode: 'insensitive' } },
        { company: { contains: q as string, mode: 'insensitive' } }
      ]
    };

    if (authReq.user.role === 'EMPLOYEE') {
      where.ownerId = authReq.user.id;
    }

    const contacts = await prisma.contact.findMany({
      where,
      take: 20,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        status: true,
        avatar: true
      }
    });

    res.json({ contacts });
  } catch {
    res.status(500).json({ error: 'Failed to search contacts' });
  }
};

export const exportContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const where = authReq.user.role === 'EMPLOYEE'
      ? { ownerId: authReq.user.id, isArchived: false }
      : { isArchived: false };

    const contacts = await prisma.contact.findMany({
      where,
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true,
        jobTitle: true,
        status: true,
        country: true,
        createdAt: true
      }
    });

    const headers = 'First Name,Last Name,Email,Phone,Company,Job Title,Status,Country,Created At\n';
    const rows = contacts.map((c: Record<string, unknown>) => 
      `${c.firstName},${c.lastName},${c.email},${c.phone || ''},${c.company || ''},${c.jobTitle || ''},${c.status},${c.country || ''},${c.createdAt}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(headers + rows);
  } catch {
    res.status(500).json({ error: 'Failed to export contacts' });
  }
};
