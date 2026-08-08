import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthenticatedRequest, JwtPayload, Role } from '../types';
import { can } from '../services/permission.service';

type RoleType = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CLIENT';

const INVITE_EXPIRY_DAYS = 7;

export const createInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!(await can(authReq.user, 'contact.create'))) {
      res.status(403).json({ error: 'Not authorized to invite team members' });
      return;
    }

    const { email, role } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const validRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT'];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ error: 'Role must be ADMIN, MANAGER, EMPLOYEE, or CLIENT' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'A user with this email already exists in the system' });
      return;
    }

    const existingInvite = await prisma.invitation.findFirst({
      where: { email, status: 'PENDING' }
    });
    if (existingInvite) {
      res.status(409).json({ error: 'An active invitation already exists for this email' });
      return;
    }

    const inviter = await prisma.user.findUnique({
      where: { id: authReq.user.id },
      select: { id: true, tenantId: true }
    });
    if (!inviter) {
      res.status(404).json({ error: 'Inviter not found' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const invite = await prisma.invitation.create({
      data: {
        email,
        role: role || 'EMPLOYEE',
        token,
        expiresAt,
        tenantId: inviter.tenantId,
        invitedById: inviter.id
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteUrl = `${frontendUrl}/accept-invite?token=${token}`;

    res.status(201).json({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt,
      inviteUrl,
      createdAt: invite.createdAt
    });
  } catch (error) {
    console.error('Create invite error:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
};

export const getInvites = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;

    const inviter = await prisma.user.findUnique({
      where: { id: authReq.user.id },
      select: { tenantId: true }
    });
    if (!inviter) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const invites = await prisma.invitation.findMany({
      where: { tenantId: inviter.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        invitedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ invites });
  } catch (error) {
    console.error('Get invites error:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
};

export const getInviteByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;

    const invite = await prisma.invitation.findUnique({
      where: { token },
      include: {
        tenant: { select: { companyName: true } }
      }
    }) as unknown as { id: string; email: string; role: string; status: string; expiresAt: Date; tenant: { companyName: string } } | null;

    if (!invite) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    if (invite.status !== 'PENDING') {
      res.status(410).json({ error: `Invitation has been ${invite.status.toLowerCase()}` });
      return;
    }

    if (new Date() > invite.expiresAt) {
      await prisma.invitation.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' }
      });
      res.status(410).json({ error: 'Invitation has expired' });
      return;
    }

    res.json({
      email: invite.email,
      role: invite.role,
      companyName: invite.tenant.companyName
    });
  } catch (error) {
    console.error('Get invite by token error:', error);
    res.status(500).json({ error: 'Failed to fetch invitation' });
  }
};

export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;
    const { name, password } = req.body;

    if (!name || !password) {
      res.status(400).json({ error: 'Name and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const invite = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invite) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    if (invite.status !== 'PENDING') {
      res.status(410).json({ error: `Invitation has been ${invite.status.toLowerCase()}` });
      return;
    }

    if (new Date() > invite.expiresAt) {
      await prisma.invitation.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' }
      });
      res.status(410).json({ error: 'Invitation has expired' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email: invite.email } });
    if (existing) {
      res.status(409).json({ error: 'A user with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: invite.email,
          password: hashedPassword,
          role: invite.role as Role,
          tenantId: invite.tenantId
        }
      });

      if (invite.role === 'CLIENT') {
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        await tx.contact.create({
          data: {
            firstName,
            lastName,
            email: invite.email,
            tenantId: invite.tenantId,
            ownerId: invite.invitedById,
            status: 'ACTIVE'
          }
        });
      }

      await tx.invitation.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' }
      });

      return user;
    });

    const token_jwt = jwt.sign(
      { userId: result.id, email: result.email, role: result.role as Role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(201).json({
      token: token_jwt,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        avatar: result.avatar,
        isActive: result.isActive,
        tenantId: result.tenantId
      }
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
};

export const cancelInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;

    const invite = await prisma.invitation.findUnique({ where: { id } });
    if (!invite) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id },
      select: { tenantId: true }
    });
    if (!user || user.tenantId !== invite.tenantId) {
      res.status(403).json({ error: 'Not authorized to cancel this invitation' });
      return;
    }

    if (invite.status !== 'PENDING') {
      res.status(400).json({ error: `Cannot cancel invitation that is ${invite.status.toLowerCase()}` });
      return;
    }

    await prisma.invitation.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    console.error('Cancel invite error:', error);
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
};
