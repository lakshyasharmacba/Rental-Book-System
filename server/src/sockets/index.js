import { Server } from 'socket.io';
import { handleDisputeSockets } from './dispute.socket.js';
import jwt from 'jsonwebtoken';

let io;

export const initSockets = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} (Socket ID: ${socket.id})`);

    // Register modular socket handlers
    handleDisputeSockets(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id} (Socket ID: ${socket.id})`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
