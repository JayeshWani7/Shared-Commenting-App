import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from 'react-query';
import { useAuth } from './AuthContext';
import { toast } from '@/utils/toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && token) {
      console.log('Connecting to:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
      
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
        auth: {
          token,
          userId: user.id,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
        
        // Join user-specific room
        newSocket.emit('join_room', { userId: user.id });
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('new_notification', (notification) => {
        // Show toast notification with sound
        toast.notification(notification.title);
        
        // Refresh notifications data
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['notifications', 'unread-count']);
      });

      newSocket.on('comment_update', (data) => {
        // Handle real-time comment updates
        queryClient.invalidateQueries(['comments']);
        console.log('Comment update:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const value = {
    socket,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
