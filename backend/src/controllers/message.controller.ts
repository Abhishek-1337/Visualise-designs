import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user.tenantId;
    const userId = authReq.user.id;
    const userRole = authReq.user.role;

    // If team member, find clients. If client, find team members.
    const targetRoles = userRole === 'CLIENT' ? ['ADMIN', 'MANAGER', 'EMPLOYEE'] : ['CLIENT'];

    const targetUsers = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: targetRoles as any },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });

    const lastMessages = await prisma.message.findMany({
      where: {
        tenantId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        receiverId: true,
        isRead: true,
      },
    });

    const lastMessageByOther: Record<string, typeof lastMessages[0]> = {};
    const unreadCountByOther: Record<string, number> = {};

    for (const msg of lastMessages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!lastMessageByOther[otherId]) {
        lastMessageByOther[otherId] = msg;
      }
      if (msg.receiverId === userId && !msg.isRead) {
        unreadCountByOther[otherId] = (unreadCountByOther[otherId] || 0) + 1;
      }
    }

    const conversations = targetUsers
      .map((u) => {
        const lastMsg = lastMessageByOther[u.id];
        return {
          client: {
            id: u.id,
            name: u.name,
            avatar: u.avatar || undefined,
            email: u.email,
            role: u.role,
            status: 'offline' as const,
          },
          lastMessage: lastMsg
            ? {
                content: lastMsg.content,
                timestamp: lastMsg.createdAt,
                unread: unreadCountByOther[u.id] > 0,
                unreadCount: unreadCountByOther[u.id] || 0,
              }
            : undefined,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastMessage?.timestamp.getTime() || 0;
        const bTime = b.lastMessage?.timestamp.getTime() || 0;
        return bTime - aTime;
      });

    res.json({ conversations });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user.tenantId;
    const userId = authReq.user.id;
    const otherUserId = req.params.userId as string;

    const messages = await prisma.message.findMany({
      where: {
        tenantId,
        projectId: null, // Only fetch direct messages
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        senderId: true,
        createdAt: true,
        isRead: true,
      },
    });

    const messagesFormatted = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.senderId === userId ? ('me' as const) : ('client' as const),
      timestamp: msg.createdAt,
      isRead: msg.isRead,
    }));

    res.json({ messages: messagesFormatted });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const getProjectMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user.tenantId;
    const userId = authReq.user.id;
    const projectId = req.params.projectId as string;

    // Verify access
    if (authReq.user.role === 'CLIENT') {
      const project = await prisma.project.findFirst({
        where: { id: projectId, tenantId, contact: { email: authReq.user.email } }
      });
      if (!project) {
        res.status(403).json({ error: 'Access denied to project chat' });
        return;
      }
    } else if (authReq.user.role === 'EMPLOYEE') {
      const project = await prisma.project.findFirst({
        where: { id: projectId, tenantId, members: { some: { id: userId } } }
      });
      if (!project) {
        res.status(403).json({ error: 'Access denied to project chat' });
        return;
      }
    }

    const messages = await prisma.message.findMany({
      where: {
        tenantId,
        projectId,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    const messagesFormatted = messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.senderId === userId ? ('me' as const) : (msg.sender.role === 'CLIENT' ? 'client' as const : 'team' as const),
      timestamp: msg.createdAt,
      senderName: msg.sender.name,
      senderAvatar: msg.sender.avatar,
    }));

    res.json({ messages: messagesFormatted });
  } catch (error) {
    console.error('Failed to fetch project messages:', error);
    res.status(500).json({ error: 'Failed to fetch project messages' });
  }
};

export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user.tenantId;
    const userId = authReq.user.id;
    const { senderId, projectId } = req.body;

    await prisma.message.updateMany({
      where: {
        tenantId,
        senderId: senderId || undefined,
        projectId: projectId || undefined,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user.tenantId;
    const senderId = authReq.user.id;
    const { receiverId, content, projectId } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: 'content is required' });
      return;
    }

    if (!receiverId && !projectId) {
      res.status(400).json({ error: 'receiverId or projectId is required' });
      return;
    }

    if (projectId) {
      if (authReq.user.role === 'CLIENT') {
        const project = await prisma.project.findFirst({
          where: { id: projectId, tenantId, contact: { email: authReq.user.email } }
        });
        if (!project) {
          res.status(403).json({ error: 'Access denied to project chat' });
          return;
        }
      } else if (authReq.user.role === 'EMPLOYEE') {
        const project = await prisma.project.findFirst({
          where: { id: projectId, tenantId, members: { some: { id: senderId } } }
        });
        if (!project) {
          res.status(403).json({ error: 'Access denied to project chat' });
          return;
        }
      }
    }

    // If projectId is provided, we might need a receiverId if it's a 1-on-1 within a project context, 
    // or we could broadcast to all project members. 
    // For now, let's assume projectId messages still need a receiverId or are handled specifically.
    // In a real project chat, it might be broadcast to all members.
    // Let's simplify: if projectId is present, we might be messaging the project owner or client.

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId,
        receiverId: receiverId || '', // In a group chat, this might be different
        tenantId,
        projectId: projectId || null,
      },
      include: {
        sender: {
          select: {
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      message: {
        id: message.id,
        content: message.content,
        sender: 'me' as const,
        timestamp: message.createdAt,
        isRead: false,
        senderName: message.sender.name,
        senderAvatar: message.sender.avatar,
      },
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
