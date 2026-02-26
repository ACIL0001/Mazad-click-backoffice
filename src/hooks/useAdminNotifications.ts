import { useState, useEffect, useContext, useCallback } from 'react';
import { NotificationAPI } from '@/api/notification';
import { ChatAPI } from '@/api/Chat';
import { MessageAPI } from '@/api/message';
import { SocketContext } from '@/contexts/SocketContext';
import useAuth from './useAuth';

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [adminNotificationCount, setAdminNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newNotifications, setNewNotifications] = useState([]); // Track only new notifications
  const socketContext = useContext(SocketContext);
  const { auth, isReady } = useAuth();

  // Calculate unread message count from backend - optimized version using single API call
  const getUnreadMessageCount = useCallback(async () => {
    if (!auth?.user?._id) return 0;

    try {
      // Use the dedicated endpoint to get the count in a single request
      const response = await MessageAPI.getUnreadCount(auth.user._id);
      return response?.count || 0;
    } catch (error) {
      console.error('Error getting total unread count:', error);
      return 0;
    }
  }, [auth?.user?._id]);

  // Combined function to get both notifications and unread messages - optimized
  const getAllAdminNotifications = useCallback(async () => {
    // Only fetch if we have a valid auth token and user
    if (!auth?.tokens?.accessToken || !auth?.user?._id) {
      console.log('🔐 Skipping admin notification fetch - auth not ready:', {
        hasToken: !!auth?.tokens?.accessToken,
        hasUser: !!auth?.user?._id
      });
      setNotifications([]);
      setAdminNotificationCount(0);
      setLoading(false);
      return;
    }

    console.log('🔐 Fetching admin notifications with valid auth...');
    try {
      setLoading(true);
      
      // Get both notifications and unread messages in parallel
      const [notificationsResponse, unreadMessageCount] = await Promise.all([
        NotificationAPI.getAll(),
        getUnreadMessageCount()
      ]);
      
      const allNotifications = notificationsResponse?.data || [];
      
      // Filter for MESSAGE_ADMIN and IDENTITY_VERIFICATION notifications
      const adminNotifications = allNotifications.filter((notification: any) => {
        const isMessageAdmin = notification.type === 'MESSAGE_ADMIN';
        const isIdentityVerification = notification.type === 'IDENTITY_VERIFICATION';
        
        // Check if notification belongs to current admin
        const belongsToCurrentAdmin = 
          notification.userId === auth?.user?._id || 
          notification.receiverId === auth?.user?._id
        
        // For MESSAGE_ADMIN: check if sender is a user (not admin)
        const isFromUser = 
          notification.data?.senderId !== 'admin' &&
          notification.data?.sender?._id !== 'admin' &&
          notification.title === 'Nouveau message de support';
        
        // For IDENTITY_VERIFICATION: always include if it's for admin
        const isIdentityForAdmin = isIdentityVerification && belongsToCurrentAdmin;
        
        return (isMessageAdmin && belongsToCurrentAdmin && isFromUser) || isIdentityForAdmin;
      });
      
      // Count only unread notifications
      const unreadNotificationCount = adminNotifications.filter(n => !n.read).length;
      
      // Total count = unread notifications + unread messages
      const totalCount = unreadNotificationCount + unreadMessageCount;
      
      setNotifications(adminNotifications);
      setAdminNotificationCount(totalCount);
      
      console.log('📊 Admin notification counts:', {
        totalNotifications: allNotifications.length,
        adminNotifications: adminNotifications.length,
        unreadNotifications: unreadNotificationCount,
        unreadMessages: unreadMessageCount,
        total: totalCount
      });
      
    } catch (error) {
      console.error('Error fetching all admin notifications:', error);
      setNotifications([]);
      setAdminNotificationCount(0);
    } finally {
      setLoading(false);
    }
  }, [getUnreadMessageCount, auth?.user?._id]);

  // Listen for real-time notifications via socket - optimized
  useEffect(() => {
    if (!socketContext?.socket) return;

    const handleNewNotification = (notification: any) => {
      console.log('🔔 Admin received real-time notification via hook:', notification);
      
      const isMessageAdmin = notification.type === 'MESSAGE_ADMIN';
      const isIdentityVerification = notification.type === 'IDENTITY_VERIFICATION';
      const belongsToCurrentAdmin = 
        notification.userId === auth?.user?._id || 
        notification.receiverId === auth?.user?._id
      const isFromUser = 
        notification.data?.senderId !== 'admin' &&
        notification.data?.sender?._id !== 'admin' &&
        notification.title === 'Nouveau message de support';
      const isIdentityForAdmin = isIdentityVerification && belongsToCurrentAdmin;
      
      if ((isMessageAdmin && belongsToCurrentAdmin && isFromUser) || isIdentityForAdmin) {
        console.log('✅ Adding new admin notification:', notification.type);
        setNewNotifications(prev => {
          // Check if notification already exists
          const exists = prev.some(n => 
            n._id === notification._id || 
            (n.type === notification.type && n.userId === notification.userId)
          );
          
          if (exists) {
            return prev;
          }
          
          return [...prev, notification];
        });
        
        setNotifications(prev => [notification, ...prev]);
        setAdminNotificationCount(prev => prev + 1);
      } else {
        console.log('🚫 Ignoring notification - not MESSAGE_ADMIN or IDENTITY_VERIFICATION for admin');
      }
    };

    const handleNewMessage = (message: any) => {
      console.log('📨 Admin received real-time message via hook:', message);
      // Check if this message is for admin (user sending to admin)
      const isForAdmin = message.reciver === 'admin' && message.sender !== 'admin';
      if (isForAdmin) {
        setAdminNotificationCount(prev => prev + 1);
      }
    };

    const handleMessageRead = (data: any) => {
      console.log('✅ Message marked as read via socket:', data);
      
      // Immediately refresh the count when messages are read
      // Use setTimeout to ensure the server has processed the read status
      setTimeout(() => {
        getAllAdminNotifications();
      }, 500);
    };

    const handleMarkAllAsRead = (data: any) => {
      console.log('✅ All messages marked as read via socket:', data);
      // Refresh the count
      setTimeout(() => {
        getAllAdminNotifications();
      }, 500);
    };

    const handleAdminMessagesMarkedAsRead = (data: any) => {
      console.log('✅ Admin messages marked as read via socket:', data);
      // Refresh the count immediately for admin
      setTimeout(() => {
        getAllAdminNotifications();
      }, 500);
    };

    socketContext.socket.on('notification', handleNewNotification);
    socketContext.socket.on('sendMessage', handleNewMessage);
    socketContext.socket.on('messageRead', handleMessageRead);
    socketContext.socket.on('messagesMarkedAsRead', handleMarkAllAsRead);
    socketContext.socket.on('adminMessagesMarkedAsRead', handleAdminMessagesMarkedAsRead);

    return () => {
      socketContext.socket.off('notification', handleNewNotification);
      socketContext.socket.off('sendMessage', handleNewMessage);
      socketContext.socket.off('messageRead', handleMessageRead);
      socketContext.socket.off('messagesMarkedAsRead', handleMarkAllAsRead);
      socketContext.socket.off('adminMessagesMarkedAsRead', handleAdminMessagesMarkedAsRead);
    };
  }, [socketContext?.socket, getAllAdminNotifications, auth?.user]);

  // Function to clear new notifications (when admin opens chat)
  const clearNewNotifications = useCallback(() => {
    console.log('🧹 Clearing new admin notifications');
    setNewNotifications([]);
    // Refresh to update count
    getAllAdminNotifications();
  }, [getAllAdminNotifications]);

  // Initial load and periodic refresh - optimized intervals
  useEffect(() => {
    // Wait for auth to be ready and user to be logged in with valid tokens
    if (isReady && auth?.tokens?.accessToken && auth?.user?._id) {
      console.log('🔐 Admin auth ready, fetching notifications...');
      // Load immediately
      getAllAdminNotifications();
      
      // Refresh every 30 seconds to reduce server load
      const interval = setInterval(() => {
        getAllAdminNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      console.log('🔐 Admin auth not ready yet:', { 
        isReady,
        hasToken: !!auth?.tokens?.accessToken, 
        hasUser: !!auth?.user?._id 
      });
    }
  }, [isReady, auth?.tokens?.accessToken, auth?.user?._id, getAllAdminNotifications]);

  // Expose a function to force immediate refresh
  const forceRefresh = useCallback(() => {
    console.log('🔄 Force refreshing admin notifications');
    getAllAdminNotifications();
  }, [getAllAdminNotifications]);

  return {
    notifications,
    adminNotificationCount,
    loading,
    newNotifications,
    refreshNotifications: getAllAdminNotifications,
    forceRefresh,
    clearNewNotifications,
  };
}; 