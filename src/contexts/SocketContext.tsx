import io, { Socket } from 'socket.io-client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

import useAuth from '@/hooks/useAuth';
import config from '@/config';

export interface ISocketContext {
  socket: Socket;
  notificationSocket?: Socket;
  addListener: (eventName: string, handler: (data?: any) => void) => void;
  removeListener: (eventName: string, handler?: (data?: any) => void) => void;
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

    // Extract token directly from reactive auth state
    const token = auth?.tokens?.accessToken || '';

    // const so: Socket = io('http://127.0.0.1:3000', {
    const so: Socket = io(socketUrl, {
      query: { userId: auth.user._id, token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    so.on('connect', () => {
      console.log('✅ Socket connected to backend');
    });

    so.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    so.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    so.on('notification', (data) => {
      console.log('🔔 Socket notification received:', data);
      setUnread((prev) => prev + 1);
    });

    setSocket(so);

    return () => {
      console.log('🧹 Cleaning up socket connection (disconnect only — do NOT removeAllListeners)');
      // IMPORTANT: do NOT call so.removeAllListeners() here.
      // Components like ChatLayout register their own handlers on this socket object.
      // Calling removeAllListeners() would wipe them out, breaking real-time delivery.
      so.disconnect();
    };
  }, [auth?.user?._id]);

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