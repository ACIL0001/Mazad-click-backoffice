import io, { Socket } from 'socket.io-client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

import useAuth from '@/hooks/useAuth';
import config from '@/config';

export interface ISocketContext {
  socket: Socket;
  notificationSocket?: Socket; // Add this property that was missing
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

const initialState: ISocketContext = {
  socket: io(config.socket),
  notificationSocket: undefined, // Initialize the missing property
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
  const [notificationSocket, setNotificationSocket] = useState<Socket>(); // Add state for notification socket
  const [eventListeners, setEventListeners] = useState<ISocketEvent[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const { auth, isLogged, isReady } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!auth?.user) return;
    
    const so: Socket = io('http://localhost:3000', {
      query: { userId: auth.user._id }
    });

    // Create notification socket (you can use same socket or create separate one)
    const notificationSo: Socket = io('http://localhost:3000/notifications', {
      query: { userId: auth.user._id }
    });

    so.on('connect', () => {
      console.log('Connected to backend!');
    });
    
    setSocket(so);
    setNotificationSocket(notificationSo);

    so.on('sendMessage', (data) => {
      console.log('📨 Admin received message via socket:', data);
      setMessages((prev) => [...prev, data]);
    });
    
    // Also listen for adminMessage events (for consistency)
    so.on('adminMessage', (data) => {
      console.log('📨 Admin received adminMessage via socket:', data);
      setMessages((prev) => [...prev, data]);
    });
    
    so.on('notification', (data) => {
      console.log('🔔 Admin received notification via socket:', data);
      setUnread((prev) => prev + 1);
    });
    
    so.on('newMessage', () => setUnread((prev) => prev + 1));

    return () => {
      so.disconnect();
      notificationSo.disconnect();
    };
  }, [auth?.user]);

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
      notificationSocket: notificationSocket, // Add the missing property
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