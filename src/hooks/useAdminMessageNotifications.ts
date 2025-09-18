import { useState, useEffect, useCallback } from 'react';
import useAuth from './useAuth';
import { useCreateSocket } from '../contexts/SocketContext';

interface AdminNotification {
  _id: string;
  type: string;
  message: string;
  userId: string;
  createdAt: string;
  isRead: boolean;
}

export default function useAdminMessageNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { auth } = useAuth();
  const { socket, addListener, removeListener } = useCreateSocket();

  const handleNewNotification = useCallback((notification: AdminNotification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (socket && auth?.user) {
      addListener('admin-notification', handleNewNotification);
      
      return () => {
        removeListener('admin-notification');
      };
    }
  }, [socket, auth?.user, addListener, removeListener, handleNewNotification]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification._id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}