import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import prisma from '../config/database';
import { JwtPayload, AuthenticatedRequest, Role } from '../types';

const generateToken = (user: Express.User): string => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role as Role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleCallback = [
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req: Request, res: Response) => {
    const token = generateToken((req as AuthenticatedRequest).user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
];

export const githubAuth = passport.authenticate('github', { scope: ['user:email'] });

export const githubCallback = [
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req: Request, res: Response) => {
    const token = generateToken((req as AuthenticatedRequest).user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
];

export const microsoftAuth = passport.authenticate('microsoft', { scope: ['user.read'] });

export const microsoftCallback = [
  passport.authenticate('microsoft', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req: Request, res: Response) => {
    const token = generateToken((req as AuthenticatedRequest).user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
];

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  const { authenticateToken } = await import('../middleware/auth.middleware');
  
  try {
    authenticateToken(req, res, () => {
      res.json({
        valid: true,
        user: (req as AuthenticatedRequest).user
      });
    });
  } catch {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
};

export const getOAuthConfig = (_req: Request, res: Response): void => {
  res.json({
    google: { enabled: !!process.env.GOOGLE_CLIENT_ID },
    github: { enabled: !!process.env.GITHUB_CLIENT_ID },
    microsoft: { enabled: !!process.env.MICROSOFT_CLIENT_ID }
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, tenantId } = req.body;

    if (!name || !email || !password || !tenantId) {
      res.status(400).json({ error: 'Name, email, password, and tenantId are required' });
      return;
    }

    const validRoles = ['EMPLOYEE', 'CLIENT'];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ error: 'Role must be EMPLOYEE or CLIENT' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userRole = role || 'EMPLOYEE';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        tenantId
      }
    });

    if (userRole === 'CLIENT') {
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const existingContact = await prisma.contact.findUnique({ where: { email } });
      if (!existingContact) {
        await prisma.contact.create({
          data: {
            firstName,
            lastName,
            email,
            tenantId: tenantId as string,
            ownerId: user.id,
            status: 'ACTIVE' as const,
          },
        });
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role as Role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        tenantId: user.tenantId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

export const tenantRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, name, email, password } = req.body;

    if (!companyName || !name || !email || !password) {
      res.status(400).json({ error: 'Company name, name, email, and password are required' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { companyName }
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          tenantId: tenant.id
        }
      });

      return { user, tenant };
    });

    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email, role: result.user.role as Role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        tenantId: result.user.tenantId,
        companyName: result.tenant.companyName
      }
    });
  } catch (error) {
    console.error('Tenant registration error:', error);
    res.status(500).json({ error: 'Failed to create tenant account' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account has been deactivated' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role as Role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
};
