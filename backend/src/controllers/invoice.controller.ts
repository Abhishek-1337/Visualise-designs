import { Request, Response } from 'express';
import prisma from '../config/database';

const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { issueDate: { gte: new Date(year, 0, 1) } }
  });
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { page = '1', limit = '20', status, contactId } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;

    if (authReq.user.role === 'EMPLOYEE') {
      where.createdById = authReq.user.id;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true } },
          createdBy: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.invoice.count({ where })
    ]);

    res.json({
      invoices,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoiceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const where = authReq.user.role === 'EMPLOYEE' ? { createdById: authReq.user.id } : {};

    const [total, pending, paid, overdue, totalAmount, paidAmount] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.count({ where: { ...where, status: 'PENDING' } }),
      prisma.invoice.count({ where: { ...where, status: 'PAID' } }),
      prisma.invoice.count({ where: { ...where, status: 'OVERDUE' } }),
      prisma.invoice.aggregate({ _sum: { total: true }, where }),
      prisma.invoice.aggregate({ _sum: { total: true }, where: { ...where, status: 'PAID' } })
    ]);

    res.json({
      total,
      pending,
      paid,
      overdue,
      totalAmount: totalAmount._sum.total || 0,
      paidAmount: paidAmount._sum.total || 0
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch invoice stats' });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id as string },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true, phone: true, address: true } },
        createdBy: { select: { id: true, name: true, avatar: true } }
      }
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    res.json(invoice);
  } catch {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { description, amount, tax, dueDate, contactId, notes } = req.body;

    const invoiceNumber = await generateInvoiceNumber();
    const taxAmount = tax || 0;
    const total = parseFloat(amount) + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        description,
        amount: parseFloat(amount),
        tax: taxAmount,
        total,
        dueDate: new Date(dueDate),
        contactId,
        createdById: authReq.user.id,
        notes
      }
    });

    res.status(201).json(invoice);
  } catch {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, amount, tax, dueDate, notes } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(tax !== undefined && { tax: tax || 0 }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(notes !== undefined && { notes }),
        ...(amount !== undefined && { total: parseFloat(amount) + (tax || 0) })
      }
    });

    res.json(invoice);
  } catch {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid invoice status' });
      return;
    }

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: {
        status,
        paidDate: status === 'PAID' ? new Date() : undefined
      }
    });

    res.json(invoice);
  } catch {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id as string } });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    await prisma.invoice.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Invoice deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

export const getContactInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { contactId: req.params.contactId as string },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.json({ invoices });
  } catch {
    res.status(500).json({ error: 'Failed to fetch contact invoices' });
  }
};
