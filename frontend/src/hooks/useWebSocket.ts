import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRoomStore } from '../store/roomStore';
import { RoomEvent } from '../types';

const SOCKET_URL = 'http://localhost:4000';

let globalSocket: Socket | null = null;

export function useWebSocket(roomId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const { handleSocketEvent } = useRoomStore();

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token || !roomId) return;

    // Reuse existing socket if already connected
    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      globalSocket.emit('join_room', roomId);
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('🟢 Socket connected:', socket.id);
      socket.emit('join_room', roomId);
    });

    socket.on('room_event', (data: RoomEvent) => {
      console.log('📨 Socket event:', data.event);
      handleSocketEvent(data);
    });

    socket.on('disconnect', (reason) => {
      console.warn('🔴 Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Keep-alive ping every 25s
    const pingInterval = setInterval(() => {
      if (socket.connected) socket.emit('ping');
    }, 25_000);

    socket.on('disconnect', () => clearInterval(pingInterval));

    globalSocket = socket;
    socketRef.current = socket;
  }, [roomId, handleSocketEvent]);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current && roomId) {
        socketRef.current.emit('leave_room', roomId);
      }
    };
  }, [connect, roomId]);

  return socketRef.current;
}

export function disconnectSocket() {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
}
