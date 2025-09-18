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
  const { auth } = useAuth();

  // Calculate unread message count from backend - optimized version
  const getUnreadMessageCount = useCallback(async () => {
    if (!auth?.user) return 0;

    try {
      // Get all chats for admin
      const allChats = await ChatAPI.getChats({ 
        id: auth.user._id, 
        from: 'admin' 
      });

      // Calculate total unread count across all chats - parallel processing
      const unreadCounts = await Promise.all(
        allChats.map(async (chat) => {
          try {
            const chatMessages = await MessageAPI.read(chat._id);
            return chatMessages.filter((msg: any) => 
              msg.sender !== auth.user._id && !msg.isRead
            ).length;
          } catch (error) {
            console.error('Error calculating unread count for chat:', chat._id, error);
            return 0;
          }
        })
      );

      const totalUnreadCount = unreadCounts.reduce((sum, count) => sum + count, 0);
      return totalUnreadCount;
    } catch (error) {
      console.error('Error calculating total unread count:', error);
      return 0;
    }
  }, [auth?.user]);

  // Combined function to get both notifications and unread messages - optimized
  const getAllAdminNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get both notifications and unread messages in parallel
      const [notificationsResponse, unreadMessageCount] = await Promise.all([
        NotificationAPI.getAll(),
        getUnreadMessageCount()
      ]);
      
      const allNotifications = notificationsResponse?.data || [];
      
      // Filter for ONLY MESSAGE_ADMIN notifications (user messages to admin)
      const adminMessageNotifications = allNotifications.filter((notification: any) => {
        // Only include MESSAGE_ADMIN type (user sending to admin)
        const isMessageAdmin = notification.type === 'MESSAGE_ADMIN';
        
        // Check if notification belongs to current admin
        const belongsToCurrentAdmin = 
          notification.userId === auth?.user?._id || 
          notification.receiverId === auth?.user?._id;
        
        // Check if sender is a user (not admin)
        const isFromUser = 
          notification.data?.senderId !== 'admin' &&
          notification.data?.sender?._id !== 'admin' &&
          notification.title === 'Nouveau message de support';
        
        return isMessageAdmin && belongsToCurrentAdmin && isFromUser;
      });
      
      // Count only unread notifications
      const unreadNotificationCount = adminMessageNotifications.filter(n => !n.read).length;
      
      // Total count = unread notifications + unread messages + new notifications
      const totalCount = unreadNotificationCount + unreadMessageCount + newNotifications.length;
      
      setNotifications(adminMessageNotifications);
      setAdminNotificationCount(totalCount);
      
      console.log('📊 Admin notification counts:', {
        totalNotifications: allNotifications.length,
        adminMessageNotifications: adminMessageNotifications.length,
        unreadNotifications: unreadNotificationCount,
        unreadMessages: unreadMessageCount,
        newNotifications: newNotifications.length,
        total: totalCount
      });
      
    } catch (error) {
      console.error('Error fetching all admin notifications:', error);
      setNotifications([]);
      setAdminNotificationCount(0);
    } finally {
      setLoading(false);
    }
  }, [getUnreadMessageCount, auth?.user, newNotifications]);

  // Listen for real-time notifications via socket - optimized
  useEffect(() => {
    if (!socketContext?.socket) return;

    const handleNewNotification = (notification: any) => {
      console.log('🔔 Admin received real-time notification via hook:', notification);
      
      // Only handle MESSAGE_ADMIN notifications (user → admin)
      const isMessageAdmin = notification.type === 'MESSAGE_ADMIN';
      const belongsToCurrentAdmin = 
        notification.userId === auth?.user?._id || 
        notification.receiverId === auth?.user?._id;
      const isFromUser = 
        notification.data?.senderId !== 'admin' &&
        notification.data?.sender?._id !== 'admin' &&
        notification.title === 'Nouveau message de support';
      
      if (isMessageAdmin && belongsToCurrentAdmin && isFromUser) {
        console.log('✅ Adding new admin message notification');
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
        console.log('🚫 Ignoring notification - not MESSAGE_ADMIN or not from user to admin');
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
      console.log('✅ Message marked as read:', data);
      // Immediately refresh the count when messages are read
      getAllAdminNotifications();
    };

    socketContext.socket.on('notification', handleNewNotification);
    socketContext.socket.on('sendMessage', handleNewMessage);
    socketContext.socket.on('messageRead', handleMessageRead);

    return () => {
      socketContext.socket.off('notification', handleNewNotification);
      socketContext.socket.off('sendMessage', handleNewMessage);
      socketContext.socket.off('messageRead', handleMessageRead);
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
    if (auth?.user) {
      // Load immediately
      getAllAdminNotifications();
      
      // Refresh every 10 seconds instead of 30 for faster updates
      const interval = setInterval(() => {
        getAllAdminNotifications();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [auth?.user, getAllAdminNotifications]);

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