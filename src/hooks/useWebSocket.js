import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = (url = 'http://localhost:3001', onConnect, onDisconnect) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(url, {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      if (onConnect) onConnect();
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      if (onDisconnect) onDisconnect();
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [url, onConnect, onDisconnect]);

  // Function to listen for specific events
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Function to remove event listeners
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  // Function to emit events
  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    on,
    off,
    emit
  };
};

export default useWebSocket;