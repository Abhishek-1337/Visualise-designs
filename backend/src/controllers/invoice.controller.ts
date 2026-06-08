import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { status, contactId, page = '1', limit = '20' } = req.query;
    const where: any = { tenantId: authReq.user.tenantId };
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;

    if (authReq.user.role === 'CLIENT') {
      const contact = await prisma.contact.findFirst({
        where: { email: authReq.user.email, tenantId: authReq.user.tenantId },
      });
      where.contactId = contact?.id || 'none';
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true } },
          payments: { orderBy: { createdAt: 'desc' } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      invoices,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true, company: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
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
    const authReq = req as AuthenticatedRequest;
    if (authReq.user.role === 'CLIENT') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const { amount, dueDate, description, notes, contactId } = req.body;

    const count = await prisma.invoice.count({ where: { tenantId: authReq.user.tenantId } });
    const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        description,
        notes,
        contactId,
        tenantId: authReq.user.tenantId,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    res.status(201).json(invoice);
  } catch {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
    });
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const updated = await prisma.invoice.update({
      where: { id: req.params.id as string },
      data: {
        ...req.body,
        amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    await prisma.invoice.deleteMany({
      where: { id: req.params.id as string, tenantId: authReq.user.tenantId },
    });
    res.json({ message: 'Invoice deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

export const getInvoiceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const where = { tenantId: authReq.user.tenantId };

    const [totalInvoices, paidInvoices, overdueInvoices, totalRevenue] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.aggregate({ _sum: { amount: true }, where: { ...where, status: 'PAID' } }),
      prisma.invoice.count({ where: { ...where, status: 'OVERDUE' } }),
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { ...where, status: { in: ['PAID', 'SENT'] } },
      }),
    ]);

    res.json({
      totalInvoices,
      paidAmount: paidInvoices._sum.amount || 0,
      overdueCount: overdueInvoices,
      pendingRevenue: totalRevenue._sum.amount || 0,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch invoice stats' });
  }
};
