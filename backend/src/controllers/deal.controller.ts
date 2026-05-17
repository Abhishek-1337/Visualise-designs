import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllDeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', status, stage, assignedTo } = req.query;

    const where: Record<string, unknown> = {};
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
          contact: {
            select: { id: true, firstName: true, lastName: true, company: true, email: true }
          },
          assignedTo: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.deal.count({ where })
    ]);

    res.json({
      deals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
};

export const getPipelineView = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pipeline = await prisma.deal.groupBy({
      by: ['stage'],
      _count: true,
      _sum: { value: true },
      orderBy: { stage: 'asc' }
    });

    const stages = ['NEW_LEAD', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

    const pipelineData = stages.map(stage => {
      const found = pipeline.find((p: { stage: string }) => p.stage === stage);
      return {
        stage,
        count: found?._count || 0,
        totalValue: found?._sum?.value || 0
      };
    });

    res.json({ pipeline: pipelineData });
  } catch {
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
};

export const getDealStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalDeals, wonDeals, openDeals, totalValue, wonValue, avgDealSize] = await Promise.all([
      prisma.deal.count(),
      prisma.deal.count({ where: { status: 'WON' } }),
      prisma.deal.count({ where: { status: 'OPEN' } }),
      prisma.deal.aggregate({ _sum: { value: true } }),
      prisma.deal.aggregate({ _sum: { value: true }, where: { status: 'WON' } }),
      prisma.deal.aggregate({ _avg: { value: true } })
    ]);

    const winRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

    res.json({
      totalDeals,
      wonDeals,
      openDeals,
      totalValue: totalValue._sum.value || 0,
      wonValue: wonValue._sum.value || 0,
      avgDealSize: avgDealSize._avg.value || 0,
      winRate: winRate.toFixed(2)
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch deal stats' });
  }
};

export const getDealById = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id as string },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true, phone: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { user: { select: { id: true, name: true, avatar: true } } }
        }
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
    const authReq = req as Express.Request & { user: Express.User };
    const { title, description, value, probability, stage, expectedCloseDate, contactId, assignedToId } = req.body;

    const deal = await prisma.deal.create({
      data: {
        title,
        description,
        value: parseFloat(value),
        probability: probability || 0,
        stage: stage || 'NEW_LEAD',
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        contactId,
        assignedToId
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } }
      }
    });

    await prisma.activity.create({
      data: {
        type: 'deal_created',
        description: `New deal created: ${title}`,
        userId: authReq.user.id,
        dealId: deal.id,
        metadata: { dealId: deal.id, dealTitle: title, value }
      }
    });

    res.status(201).json(deal);
  } catch {
    res.status(500).json({ error: 'Failed to create deal' });
  }
};

export const updateDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await prisma.deal.findUnique({ where: { id: req.params.id as string } });

    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    const updated = await prisma.deal.update({
      where: { id: req.params.id as string },
      data: {
        ...req.body,
        value: req.body.value ? parseFloat(req.body.value) : undefined,
        expectedCloseDate: req.body.expectedCloseDate ? new Date(req.body.expectedCloseDate) : undefined
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } }
      }
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update deal' });
  }
};

export const updateDealStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as Express.Request & { user: Express.User };
    const { stage, status } = req.body;

    const validStages = ['NEW_LEAD', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
    if (!validStages.includes(stage)) {
      res.status(400).json({ error: 'Invalid pipeline stage' });
      return;
    }

    const dealStatus = stage === 'CLOSED_WON' ? 'WON' : stage === 'CLOSED_LOST' ? 'LOST' : 'OPEN';

    const deal = await prisma.deal.update({
      where: { id: req.params.id as string },
      data: {
        stage,
        status: status || dealStatus,
        closedDate: (stage === 'CLOSED_WON' || stage === 'CLOSED_LOST') ? new Date() : undefined
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, company: true } }
      }
    });

    await prisma.activity.create({
      data: {
        type: 'deal_stage_changed',
        description: `Deal "${deal.title}" moved to ${stage}`,
        userId: authReq.user.id,
        dealId: deal.id,
        metadata: { dealId: deal.id, stage, status: deal.status }
      }
    });

    res.json(deal);
  } catch {
    res.status(500).json({ error: 'Failed to update deal stage' });
  }
};

export const deleteDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await prisma.deal.findUnique({ where: { id: req.params.id as string } });

    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    await prisma.deal.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Deal deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete deal' });
  }
};
