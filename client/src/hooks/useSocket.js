import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '@/lib/auth';

export const useSocket = (namespace = '') => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = getAccessToken();
    const url = `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${namespace}`;
    
    socketRef.current = io(url, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));

    setSocket(socketRef.current);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [namespace]);

  return { socket, isConnected };
};
