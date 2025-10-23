import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export const useSocket = () => {
  const { user } = useAuth();
  const [socketState, setSocketState] = useState<SocketState>({
    socket: null,
    isConnected: false,
    error: null,
    reconnect: () => {}
  });
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Manual reconnect function
  const reconnect = () => {
    console.log('🔄 Manual reconnection requested');

    // Clear any pending reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Disconnect existing socket if any
    if (socketRef.current) {
      console.log('🔌 Disconnecting existing socket');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const token = localStorage.getItem('token');
    if (!user || !token) {
      console.error('❌ Cannot reconnect: No user or token');
      setSocketState(prev => ({
        ...prev,
        socket: null,
        isConnected: false,
        error: 'No authentication token available'
      }));
      return;
    }

    // Create new socket connection
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    console.log('🔌 Creating new WebSocket connection to:', backendUrl);

    const socket = io(backendUrl, {
      auth: {
        token: token
      },
      transports: ['polling', 'websocket'],
      timeout: 10000,
      forceNew: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      setSocketState(prev => ({
        ...prev,
        socket,
        isConnected: true,
        error: null
      }));
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket server:', reason);
      setSocketState(prev => ({
        ...prev,
        isConnected: false
      }));
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        error: error.message
      }));
    });

    socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      setSocketState(prev => ({
        ...prev,
        error: error.message || 'WebSocket error occurred'
      }));
    });
  };

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
          error: null,
          reconnect
        });
      }
      return;
    }

    // Create socket connection
    reconnect();

    // Update reconnect function in state
    setSocketState(prev => ({
      ...prev,
      reconnect
    }));

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  return socketState;
};
