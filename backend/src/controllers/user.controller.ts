import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { name, phone, timezone, language, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: authReq.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(timezone && { timezone }),
        ...(language && { language }),
        ...(avatar !== undefined && { avatar })
      }
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', role, isActive } = req.query;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        phone: true,
        timezone: true,
        language: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    const validRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT'];

    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { role }
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { isActive: false }
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

export const activateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { isActive: true }
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to activate user' });
  }
};
