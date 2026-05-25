import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../types';

export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user.tenantId;
    const userId = authReq.user.id;

    const clients = await prisma.user.findMany({
      where: { tenantId, role: 'CLIENT', isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      orderBy: { name: 'asc' },
    });

    let lastMessages: Array<{ id: string; content: string; createdAt: Date; senderId: string; receiverId: string }> = [];
    try {
      lastMessages = await prisma.message.findMany({
        where: {
          tenantId,
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          senderId: true,
          receiverId: true,
        },
      });
    } catch {
      // messages table may not exist yet
    }

    const lastMessageByOther: Record<string, typeof lastMessages[0]> = {};
    for (const msg of lastMessages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!lastMessageByOther[otherId]) {
        lastMessageByOther[otherId] = msg;
      }
    }

    const conversations = clients.map((client) => {
      const lastMsg = lastMessageByOther[client.id];
      return {
        client: {
          id: client.id,
          name: client.name,
          avatar: client.avatar || undefined,
          email: client.email,
          status: 'offline' as const,
        },
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              timestamp: lastMsg.createdAt,
              unread: lastMsg.senderId !== userId,
            }
          : undefined,
      };
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
      },
    });

    const messagesFormatted = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.senderId === userId ? 'me' as const : 'client' as const,
      timestamp: msg.createdAt,
    }));

    res.json({ messages: messagesFormatted });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user.tenantId;
    const senderId = authReq.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content?.trim()) {
      res.status(400).json({ error: 'receiverId and content are required' });
      return;
    }

    const receiver = await prisma.user.findFirst({
      where: { id: receiverId, tenantId },
    });

    if (!receiver) {
      res.status(404).json({ error: 'Receiver not found' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId,
        receiverId,
        tenantId,
      },
      select: {
        id: true,
        content: true,
        senderId: true,
        receiverId: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: {
        id: message.id,
        content: message.content,
        sender: 'me' as const,
        timestamp: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
