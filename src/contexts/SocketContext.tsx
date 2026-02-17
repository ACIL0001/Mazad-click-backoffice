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
    
    const socketUrl = (config.socket && config.socket.trim() !== ''
      ? config.socket.trim()
      : (import.meta.env.MODE === 'production'
        ? 'https://mazadclick-server.onrender.com/'
        : 'http://127.0.0.1:3000/')).replace(/\/$/, '');

    // const so: Socket = io('http://127.0.0.1:3000', {
    const so: Socket = io(socketUrl, {
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

    /* 
    // Internal listener commented out to prevent interference with ChatLayout
    so.on('sendMessage', (data) => {
      console.log('📨 Admin received message via socket (Internal Context):', data);
      
      // Check if this message is for admin (reciver === 'admin' or sender is not admin)
      const isAdminMessage = data.reciver === 'admin' || data.reciver === 'ADMIN';
      const isFromAdmin = data.sender === 'admin' || data.sender === 'ADMIN';
      
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
      }
    }); 
    */
    
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
    // console.log(`[socket event] =>>> adding event name ${eventName}`);
    setEventListeners((prev) => {
      // Check if this exact handler is already added to avoid duplicates from strict mode double-mounts
      const exists = prev.some(l => l.eventName === eventName && l.handler === handler);
      if (exists) return prev;
      return [...prev, { eventName, handler }];
    });
  }, []);

  const removeListener = useCallback((eventName: string, handler?: (data: any) => void) => {
    // console.log(`[socket event] =>>> remove event name ${eventName}`);
    setEventListeners((prev) => {
      if (handler) {
        return prev.filter(l => !(l.eventName === eventName && l.handler === handler));
      }
      // If no handler specified, remove all for this event name (legacy behavior support)
      return prev.filter((ev) => ev.eventName !== eventName);
    });
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
    
    // Subscribe all listeners
    eventListeners.forEach(({ eventName, handler }) => {
      // Check if listener is already attached to socket to prevent max listeners warning
      // Socket.io doesn't easily let us check this, so rely on our state management
      // But we can be safe:
      socket.off(eventName, handler); // Remove first to ensure no duplicates
      socket.on(eventName, handler);
    });

    return () => {
      // Unsubscribe all listeners in this effect's scope
      eventListeners.forEach(({ eventName, handler }) => {
        socket.off(eventName, handler);
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