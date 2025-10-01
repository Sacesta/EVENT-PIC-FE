import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

export const useSocket = () => {
  const { user } = useAuth();
  const [socketState, setSocketState] = useState<SocketState>({
    socket: null,
    isConnected: false,
    error: null
  });
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    console.log("user",user);
    
    if (!user || !token) {
      // Disconnect if no user or token
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketState({
          socket: null,
          isConnected: false,
          error: null
        });
      }
      return;
    }

    // Create socket connection
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const socket = io(backendUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      setSocketState({
        socket,
        isConnected: true,
        error: null
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket server:', reason);
      setSocketState(prev => ({
        ...prev,
        isConnected: false
      }));
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        error: error.message
      }));
    });

    socket.on('error', (error) => {
      console.error('🔌 WebSocket error:', error);
      setSocketState(prev => ({
        ...prev,
        error: error.message || 'WebSocket error occurred'
      }));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return socketState;
};
