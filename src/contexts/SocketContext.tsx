import io, { Socket } from 'socket.io-client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

import useAuth from '@/hooks/useAuth';
import config from '@/config';

export interface ISocketContext {
  socket: Socket;
  notificationSocket?: Socket;
  addListener: (eventName: string, handler: (data?: any) => void) => void;
  removeListener: (eventName: string) => void;
  emit: (eventName: string, data?: any) => void;
  messages: any[];
  setMessages: (messages: any[]) => void;
  onlineUsers: any[];
  unread: number;
  setUnread: (count: number) => void;
}

declare interface ISocketEvent {
  eventName: string;
  handler: (data?: any) => void;
}

// Create a mock socket object for initial state
const createMockSocket = (): Socket => {
  return ({
    id: 'mock',
    connected: false,
    disconnected: true,
    emit: () => {},
    on: () => {},
    off: () => {},
    once: () => {},
    removeAllListeners: () => {},
    disconnect: () => {},
    connect: () => {},
  } as any) as Socket;
};

const initialState: ISocketContext = {
  socket: createMockSocket(),
  notificationSocket: createMockSocket(),
  addListener: (eventName: string, handler: (data: any) => void) => {},
  removeListener: (eventName: string) => {},
  emit: (eventName: string, data?: any) => {},
  messages: [],
  setMessages: () => {},
  onlineUsers: [],
  unread: 0,
  setUnread: () => {},
};

export const SocketContext = createContext<ISocketContext>(initialState);

// Custom hook to use socket context
export function useCreateSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useCreateSocket must be used within a SocketProvider');
  }
  return context;
}

export default function SocketProvider({ children }: any) {
  const [socket, setSocket] = useState<Socket>();
  const [eventListeners, setEventListeners] = useState<ISocketEvent[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const { auth, isLogged, isReady } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!auth?.user) return;
    
    console.log('🔌 Initializing socket connection for user:', auth.user._id);
    
    // const so: Socket = io('http://localhost:3000', {
    const so: Socket = io(import.meta.env.VITE_SOCKET_URL || 'https://mazadclick-server.onrender.com', {
      query: { userId: auth.user._id },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    so.on('connect', () => {
      console.log('✅ Connected to backend!');
    });

    so.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    so.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
    
    setSocket(so);

    so.on('sendMessage', (data) => {
      console.log('📨 Admin received message via socket:', data);
      
      // Check if this message is for admin (reciver === 'admin' or sender is not admin)
      const isAdminMessage = data.reciver === 'admin' || data.reciver === 'ADMIN';
      const isFromAdmin = data.sender === 'admin' || data.sender === 'ADMIN';
      
      console.log('🔍 Message analysis:', {
        isAdminMessage,
        isFromAdmin,
        sender: data.sender,
        reciver: data.reciver,
        currentUserId: auth?.user?._id
      });
      
      // Only add messages that are either:
      // 1. From users to admin (reciver === 'admin')
      // 2. From admin to users (sender === 'admin')
      if (isAdminMessage || isFromAdmin) {
        console.log('✅ Adding admin message to state');
        setMessages((prev) => {
          // Check for duplicates
          const exists = prev.some(msg => 
            msg._id === data._id || 
            (msg.message === data.message && msg.sender === data.sender && 
             Math.abs(new Date(msg.createdAt).getTime() - new Date(data.createdAt).getTime()) < 1000)
          );
          
          if (exists) {
            console.log('⚠️ Message already exists, skipping');
            return prev;
          }
          
          return [...prev, data];
        });
      } else {
        console.log('❌ Message not for admin, ignoring');
      }
    });
    
    // Also listen for adminMessage events (for consistency)
    so.on('adminMessage', (data) => {
      console.log('📨 Admin received adminMessage via socket:', data);
      
      // adminMessage events are always for admin chat
      setMessages((prev) => {
        // Check for duplicates
        const exists = prev.some(msg => 
          msg._id === data._id || 
          (msg.message === data.message && msg.sender === data.sender && 
           Math.abs(new Date(msg.createdAt).getTime() - new Date(data.createdAt).getTime()) < 1000)
        );
        
        if (exists) {
          console.log('⚠️ AdminMessage already exists, skipping');
          return prev;
        }
        
        console.log('✅ Adding adminMessage to state');
        return [...prev, data];
      });
    });
    
    so.on('notification', (data) => {
      console.log('🔔 Admin received notification via socket:', data);
      setUnread((prev) => prev + 1);
    });
    
    so.on('newMessage', () => setUnread((prev) => prev + 1));

    // Cleanup function to properly disconnect
    return () => {
      console.log('🧹 Cleaning up socket connection');
      so.removeAllListeners(); // Remove all event listeners
      so.disconnect(); // Disconnect the socket
    };
  }, [auth?.user?._id]); // Use _id instead of user object to prevent unnecessary re-renders

  // Handle online users
  useEffect(() => {
    if (!socket) return;
    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });
  }, [socket]);

  const addListener = useCallback((eventName: string, handler: (data: any) => void) => {
    console.log(`[socket event] =>>> adding event name ${eventName}`);

    setEventListeners((prev) => {
      const index = prev.findIndex((e) => e.eventName === eventName);
      console.log(index, eventName);

      if (index > -1) {
        prev[index] = { eventName: prev[index].eventName, handler };
        return prev;
      }

      prev.push({ eventName, handler });
      return prev;
    });
  }, []);

  const removeListener = useCallback((eventName: string) => {
    console.log(`[socket event] =>>> remove event name ${eventName}`);
    setEventListeners((prev) => prev.filter((ev) => ev.eventName !== eventName));
  }, []);

  const emit = useCallback((eventName: string, data?: any) => {
    if (socket) {
      console.log(`📤 Emitting socket event: ${eventName}`, data);
      socket.emit(eventName, data);
    } else {
      console.warn(`⚠️ Cannot emit ${eventName} - socket not connected`);
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    
    eventListeners.forEach(({ eventName, handler }) => {
      socket.on(eventName, handler);
    });

    return () => {
      eventListeners.forEach(({ eventName }) => {
        socket.off(eventName);
      });
    };
  }, [eventListeners, socket]);

    return (
    <SocketContext.Provider value={{ 
      socket: socket as Socket,
      notificationSocket: socket as Socket,
      addListener, 
      removeListener, 
      emit,
      messages, 
      setMessages, 
      onlineUsers, 
      unread, 
      setUnread 
    }}>
      {children}
    </SocketContext.Provider>
  );
}