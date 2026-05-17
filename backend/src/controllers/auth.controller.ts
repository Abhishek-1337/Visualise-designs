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
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
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

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE'
      }
    });

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
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
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
