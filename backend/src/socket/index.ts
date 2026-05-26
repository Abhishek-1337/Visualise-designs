import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { JwtPayload } from '../types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  tenantId?: string;
}

export function createSocketServer(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token as string, process.env.JWT_SECRET || '') as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, tenantId: true, isActive: true },
      });
      if (!user || !user.isActive) {
        return next(new Error('Invalid or inactive user'));
      }
      socket.userId = user.id;
      socket.tenantId = user.tenantId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  const onlineUsers = new Set<string>();

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const tenantId = socket.tenantId!;

    socket.join(userId);
    onlineUsers.add(userId);
    io.emit('user:status', { userId, status: 'online' });

    socket.on('get:online-users', () => {
      socket.emit('online-users', Array.from(onlineUsers));
    });

    socket.on('join:project', (data: { projectId: string }) => {
      socket.join(`project:${data.projectId}`);
    });

    socket.on('leave:project', (data: { projectId: string }) => {
      socket.leave(`project:${data.projectId}`);
    });

    socket.on('send:message', async (data: { receiverId?: string; content: string; projectId?: string }, ack) => {
      try {
        if (!data.content?.trim()) {
          if (ack) ack({ error: 'content is required' });
          return;
        }

        const message = await prisma.message.create({
          data: {
            content: data.content.trim(),
            senderId: userId,
            receiverId: data.receiverId || '',
            tenantId,
            projectId: data.projectId || null,
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

        const messagePayload = {
          id: message.id,
          content: message.content,
          sender: 'me' as const,
          senderId: message.senderId,
          receiverId: message.receiverId,
          projectId: message.projectId,
          timestamp: message.createdAt,
          isRead: false,
          senderName: message.sender.name,
          senderAvatar: message.sender.avatar,
        };

        if (data.projectId) {
          const projectPayload = {
            ...messagePayload,
            sender: message.senderId === userId ? 'me' as const : (message.sender.role === 'CLIENT' ? 'client' as const : 'team' as const),
          };
          io.to(`project:${data.projectId}`).emit('new:project-message', projectPayload);
        } else if (data.receiverId) {
          io.to(data.receiverId).emit('new:message', messagePayload);
          socket.emit('new:message', messagePayload);
        }

        if (ack) ack({ success: true, message: messagePayload });
      } catch (error) {
        console.error('Socket send:message error:', error);
        if (ack) ack({ error: 'Failed to send message' });
      }
    });

    socket.on('mark:read', async (data: { senderId: string }) => {
      try {
        await prisma.message.updateMany({
          where: {
            tenantId,
            senderId: data.senderId,
            receiverId: userId,
            isRead: false,
          },
          data: {
            isRead: true,
          },
        });
        io.to(data.senderId).emit('messages:read', { readerId: userId });
      } catch (error) {
        console.error('Socket mark:read error:', error);
      }
    });

    socket.on('typing:start', (data: { receiverId: string }) => {
      io.to(data.receiverId).emit('typing:start', { senderId: userId });
    });

    socket.on('typing:stop', (data: { receiverId: string }) => {
      io.to(data.receiverId).emit('typing:stop', { senderId: userId });
    });

    socket.on('disconnect', () => {
      socket.leave(userId);
      // Check if user has other tabs open
      const connectedSockets = io.sockets.adapter.rooms.get(userId);
      if (!connectedSockets || connectedSockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit('user:status', { userId, status: 'offline' });
      }
    });
  });

  return io;
}
