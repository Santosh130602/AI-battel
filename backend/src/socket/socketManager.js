const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

// Map: roomId → Set of socket IDs
const roomSockets = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // ── Auth middleware on every socket connection ──
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userName} (${socket.id})`);

    // Client tells us which room to join
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      if (!roomSockets.has(roomId)) roomSockets.set(roomId, new Set());
      roomSockets.get(roomId).add(socket.id);
      console.log(`📥 ${socket.userName} joined socket room: ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      if (roomSockets.has(roomId)) roomSockets.get(roomId).delete(socket.id);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.userName}`);
      // Clean up from all rooms
      roomSockets.forEach((sockets, roomId) => {
        sockets.delete(socket.id);
      });
    });

    // Ping/pong for keep-alive
    socket.on('ping', () => socket.emit('pong'));
  });

  console.log('📡 Socket.io initialized');
  return io;
}

function broadcastToRoom(roomId, data) {
  if (!io) {
    console.warn('Socket.io not initialized yet');
    return;
  }
  io.to(roomId.toString()).emit('room_event', data);
  console.log(`📢 Broadcast to room ${roomId}:`, data.event);
}

function getIO() {
  return io;
}

module.exports = { initSocket, broadcastToRoom, getIO };
