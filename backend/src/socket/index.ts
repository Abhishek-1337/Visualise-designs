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

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const tenantId = socket.tenantId!;

    socket.join(userId);

    socket.on('send:message', async (data: { receiverId: string; content: string }, ack) => {
      try {
        if (!data.receiverId || !data.content?.trim()) {
          if (ack) ack({ error: 'receiverId and content are required' });
          return;
        }

        const message = await prisma.message.create({
          data: {
            content: data.content.trim(),
            senderId: userId,
            receiverId: data.receiverId,
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

        const messagePayload = {
          id: message.id,
          content: message.content,
          sender: 'me' as const,
          senderId: message.senderId,
          receiverId: message.receiverId,
          timestamp: message.createdAt,
        };

        io.to(data.receiverId).emit('new:message', messagePayload);
        socket.emit('new:message', messagePayload);

        if (ack) ack({ success: true, message: messagePayload });
      } catch (error) {
        console.error('Socket send:message error:', error);
        if (ack) ack({ error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      socket.leave(userId);
    });
  });

  return io;
}
