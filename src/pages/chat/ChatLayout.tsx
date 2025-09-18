"use client";

import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Badge,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  Tab,
  Tabs,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Zoom,
  Fade,
  useTheme,
  alpha,
  CircularProgress,
  useMediaQuery,
  Container,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Store as StoreIcon,
  Circle as OnlineIcon,
  ArrowBack as ArrowBackIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { SocketContext } from '../../contexts/SocketContext';
import { ChatAPI } from '../../api/Chat';
import { MessageAPI } from '../../api/message';
import useAuth from '../../hooks/useAuth';
import Page from '../../components/Page';

// Interfaces
interface Message {
  _id: string;
  message: string;
  sender: string;
  reciver: string;
  idChat: string;
  createdAt: string;
  isRead?: boolean;
}

interface Chat {
  _id: string;
  users: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    AccountType: string;
    phone?: string;
    email?: string;
    isOnline?: boolean;
  }>;
  createdAt: string;
  lastMessage?: Message;
  unreadCount?: number;
}

interface ClientType {
  id: string;
  title: string;
  icon: React.ElementType;
  accountTypes: string[];
  color: string;
  description: string;
}

const clientTypes: ClientType[] = [
  {
    id: 'professional',
    title: 'Clients Professionnels',
    icon: BusinessIcon,
    accountTypes: ['PROFESSIONAL'],
    color: '#1976d2',
    description: 'Clients B2B et entreprises'
  },
  {
    id: 'reseller',
    title: 'Revendeurs',
    icon: StoreIcon,
    accountTypes: ['RESELLER'],
    color: '#388e3c',
    description: 'Partenaires de revente'
  },
  {
    id: 'client',
    title: 'Clients Normaux',
    icon: PersonIcon,
    accountTypes: ['CLIENT', 'BUYER', 'OTHER'],
    color: '#f57c00',
    description: 'Clients normaux et autres utilisateurs'
  }
];

export function ChatLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { auth } = useAuth();
  const socketContext = useContext(SocketContext);
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'overview' | 'chat'>('overview');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);



  // Load all chats - memoized with useCallback
  const loadChats = useCallback(async () => {
    if (!auth?.user) return;

    setIsLoading(true);
    try {
      console.log('🔍 Fetching admin chats for user:', auth.user._id);
      console.log('🔍 API Request:', { id: auth.user._id, from: 'admin' });
      console.log('🔍 Current admin user:', auth.user);
      
      // Log the request before sending
      console.group('🔄 DATABASE REQUEST');
      console.log('Endpoint: /chat/getchats');
      console.log('Method: POST');
      console.log('Payload:', { id: auth.user._id, from: 'admin' });
      console.groupEnd();
      
      // Try the admin-chats endpoint first (more reliable)
      console.log('🔍 Trying admin-chats endpoint first');
      let allChats;
      try {
        allChats = await ChatAPI.getAdminChats();
        console.log('✅ Successfully fetched chats from admin-chats endpoint');
      } catch (error) {
        console.log('❌ Failed to fetch from admin-chats, falling back to getchats endpoint');
        allChats = await ChatAPI.getChats({ 
          id: auth.user._id, 
          from: 'admin' 
        });
      }

      // Log the raw response from the database
      console.group('📥 DATABASE RESPONSE');
      console.log('Raw response:', JSON.stringify(allChats, null, 2));
      console.log('Response type:', typeof allChats);
      console.log('Is array:', Array.isArray(allChats));
      console.log('Number of chats:', allChats?.length || 0);
      console.groupEnd();
      
      // Debug each chat's user structure in detail
      if (Array.isArray(allChats)) {
        console.group('🔎 DETAILED CHAT ANALYSIS');
        allChats.forEach((chat, index) => {
          console.group(`Chat ${index + 1} (${chat._id})`);
          console.log('Full chat object:', chat);
          console.log('Chat ID:', chat._id);
          console.log('Created at:', new Date(chat.createdAt).toLocaleString());
          console.log('User count:', chat.users?.length || 0);
          console.log('Has admin user:', chat.users?.some(u => u._id === 'admin') || false);
          
          // Log each user in the chat with complete details
          if (Array.isArray(chat.users)) {
            console.group('Chat Users');
            chat.users.forEach((user, userIndex) => {
              console.group(`User ${userIndex + 1}`);
              console.log('User ID:', user._id);
              console.log('Full name:', `${user.firstName} ${user.lastName}`);
              console.log('Account type:', user.AccountType);
              console.log('Is admin:', user._id === 'admin' || user.AccountType?.toUpperCase() === 'ADMIN');
              console.log('Raw user object:', user);
              console.groupEnd();
            });
            console.groupEnd();
            
            // Log which user will be used for filtering
            const userForFiltering = getUserFromChat(chat);
            console.log('🔍 User that will be used for filtering:', {
              index: chat.users.indexOf(userForFiltering),
              id: userForFiltering?._id,
              name: userForFiltering ? `${userForFiltering.firstName} ${userForFiltering.lastName}` : 'Unknown',
              accountType: userForFiltering?.AccountType
            });
          }
          console.groupEnd();
        });
        console.groupEnd();
      }

      // Calculate unread count for each chat
      const chatsWithUnread = await Promise.all(
        allChats.map(async (chat: Chat) => {
          try {
            const chatMessages = await MessageAPI.read(chat._id);
            const unreadCount = chatMessages.filter((msg: Message) => 
              msg.sender !== auth.user._id && !msg.isRead
            ).length;
            
            return {
              ...chat,
              unreadCount,
              lastMessage: chatMessages[chatMessages.length - 1] || null
            };
          } catch (error) {
            return { ...chat, unreadCount: 0 };
          }
        })
      );

      console.log('📊 Final chats with unread counts:', chatsWithUnread.length);
      setChats(chatsWithUnread);
    } catch (error) {
      console.log("❌ Error loading chats");
      console.error('❌ Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [auth?.user]);

  // Silent update function for real-time updates (no loading indicator)
  // This function updates chat data without showing loading states to the user
  const silentlyUpdateChats = useCallback(async () => {
    if (!auth?.user) return;

    try {
      // Try the admin-chats endpoint first (more reliable)
      let allChats;
      try {
        allChats = await ChatAPI.getAdminChats();
      } catch (error) {
        // Fall back to the getchats endpoint
        allChats = await ChatAPI.getChats({ 
          id: auth.user._id, 
          from: 'admin' 
        });
      }

      // Calculate unread count for each chat
      const chatsWithUnread = await Promise.all(
        allChats.map(async (chat: Chat) => {
          try {
            const chatMessages = await MessageAPI.read(chat._id);
            const unreadCount = chatMessages.filter((msg: Message) => 
              msg.sender !== auth.user._id && !msg.isRead
            ).length;
            
            return {
              ...chat,
              unreadCount,
              lastMessage: chatMessages[chatMessages.length - 1] || null
            };
          } catch (error) {
            return { ...chat, unreadCount: 0 };
          }
        })
      );

      setChats(chatsWithUnread);
    } catch (error) {
      console.error('Error silently updating chats:', error);
    }
  }, [auth?.user]);

  // Load messages for selected chat - memoized with useCallback
  const loadMessages = useCallback(async (chatId: string) => {
    console.log('🔄 Loading messages for chatId:', chatId);
    try {
      const chatMessages = await MessageAPI.read(chatId);
      console.log('📨 Messages received:', chatMessages);
      console.log('📨 Number of messages:', chatMessages?.length || 0);
      setMessages(chatMessages || []);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  }, []);

  // Silent message loading for real-time updates
  // This function loads messages without showing loading states to the user
  const silentlyLoadMessages = useCallback(async (chatId: string) => {
    try {
      const chatMessages = await MessageAPI.read(chatId);
      setMessages(chatMessages || []);
    } catch (error) {
      console.error('❌ Error silently loading messages:', error);
    }
  }, []);

  // Send message - memoized with useCallback
  const sendMessage = useCallback(async () => {
    if (!message.trim() || !selectedChat || !auth?.user) return;

    // Always set sender/reciver as required
    // Admin users have role === 'ADMIN'
    const isAdmin = auth.user.role === 'ADMIN';
    const sender = isAdmin ? 'admin' : auth.user._id;
    
    // Debug: Log the selected chat users
    console.log('🔍 Selected chat users:', selectedChat.users);
    console.log('🔍 Current admin user:', auth.user);
    
    // Find the non-admin user in the chat (the user the admin is talking to)
    // Try multiple strategies to find the correct user
    let user = null;
    
    // Strategy 1: Find user that is not admin and not the current admin user
    user = selectedChat.users.find(u => 
      u._id !== 'admin' && 
      u.AccountType !== 'admin' && 
      u._id !== auth.user._id
    );
    
    // Strategy 2: If not found, find any user that is not admin
    if (!user) {
      user = selectedChat.users.find(u => 
        u._id !== 'admin' && 
        u.AccountType !== 'admin'
      );
    }
    
    // Strategy 3: If still not found, find any user that is not the current user
    if (!user) {
      user = selectedChat.users.find(u => u._id !== auth.user._id);
    }
    
    // Strategy 4: If still not found, take the first user that is not admin
    if (!user) {
      user = selectedChat.users.find(u => u._id !== 'admin');
    }
    
    console.log('🔍 Found user to send message to:', user);
    console.log('🔍 All users in chat:', selectedChat.users);
    
    let reciver = '';
    if (sender === 'admin') {
      reciver = user ? user._id : '';
      console.log('📤 Admin sending to user ID:', reciver);
      
      // Validate that we have a valid receiver
      if (!reciver) {
        console.error('❌ ERROR: No valid receiver found for admin message!');
        console.error('❌ Chat users:', selectedChat.users);
        console.error('❌ Current admin:', auth.user);
        return; // Don't send the message if we can't find a receiver
      }
    } else {
      reciver = 'admin';
      console.log('📤 User sending to admin');
    }

    console.log('📤 Admin sending message:', {
      sender,
      reciver,
      message: message.trim(),
      chatId: selectedChat._id,
      isAdmin
    });

    try {
      const messageData = {
        idChat: selectedChat._id,
        message: message.trim(),
        sender,
        reciver,
      };

      console.log('📤 Sending message data:', messageData);
      const sentMessage = await MessageAPI.send(messageData);
      console.log('✅ Message sent successfully:', sentMessage);
      
      // Emit socket event for real-time delivery to user
      if (socketContext?.socket && reciver) {
        const socketMessageData = {
          ...messageData,
          _id: sentMessage?._id || `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          isAdmin: true,
          sender: 'admin',
          reciver: reciver
        };
        
        console.log('📤 Emitting adminMessage socket event:', socketMessageData);
        
        // Emit adminMessage event (primary event for admin chat)
        socketContext.socket.emit('adminMessage', socketMessageData);
        
        // Also emit sendMessage for broader compatibility
        socketContext.socket.emit('sendMessage', socketMessageData);
        
        // Emit newMessage for notification system
        socketContext.socket.emit('newMessage', {
          message: messageData.message,
          reciver: reciver,
          idChat: messageData.idChat,
          sender: 'admin'
        });
        
        console.log('✅ All socket events emitted for real-time delivery to user:', reciver);
      } else {
        console.warn('⚠️ Cannot emit socket events - socket not connected or no receiver');
      }
      
      setMessage('');
      // Refresh messages
      await loadMessages(selectedChat._id);
      await silentlyUpdateChats();
      
      // Immediately trigger badge refresh after sending message
      window.dispatchEvent(new CustomEvent('refreshAdminNotifications'));
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }, [message, selectedChat, auth?.user, socketContext?.socket, loadMessages, silentlyUpdateChats]);

  // Handle socket messages - memoized with useCallback
  const handleNewMessage = useCallback((data: Message) => {
    console.log('📨 Admin received socket message:', data);
    
    // Check if this message belongs to the currently selected chat
    if (selectedChat && data.idChat === selectedChat._id) {
      console.log('✅ Message belongs to current chat, updating messages');
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg._id === data._id);
        if (exists) {
          console.log('🚫 Message already exists, skipping duplicate');
          return prev;
        }
        console.log('✅ Adding new message to current chat');
        return [...prev, data];
      });
      
      // Auto-scroll to bottom for new messages
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } else {
      console.log('🚫 Message not for current chat, updating chat list instead');
      // Update chat list to show new message indicator
      silentlyUpdateChats();
    }
  }, [selectedChat, scrollToBottom, silentlyUpdateChats]);

  // Handle notifications - memoized with useCallback
  const handleNewNotification = useCallback((notification: any) => {
    console.log('📧 Admin received notification via socket:', notification);
    
    // Check if this notification is for the current admin
    const isAdmin = auth?.user?.role === 'ADMIN';
    const isForCurrentAdmin = isAdmin && (
      notification.userId === auth?.user?._id ||
      notification.type === 'MESSAGE_ADMIN' // Admin-specific notifications
    );
    
    if (isForCurrentAdmin) {
      console.log('✅ Accepting notification for admin');
      // Refresh chats to update unread counts
      silentlyUpdateChats();
    }
  }, [auth?.user?.role, auth?.user?._id, silentlyUpdateChats]);

  // Handle socket messages - fixed useEffect
  useEffect(() => {
    if (!socketContext?.socket) return;

    socketContext.addListener('sendMessage', handleNewMessage);
    socketContext.addListener('adminMessage', handleNewMessage); // Add listener for adminMessage event
    socketContext.addListener('notification', handleNewNotification);
    
    return () => {
      socketContext.removeListener('sendMessage');
      socketContext.removeListener('adminMessage'); // Remove listener for adminMessage event
      socketContext.removeListener('notification');
    };
  }, [socketContext?.socket, handleNewMessage, handleNewNotification]);

  // Load chats when component mounts - fixed useEffect
  useEffect(() => {
    if (auth?.user) {
      console.log('🔄 Loading chats for admin user:', auth.user._id);
      console.log('🔄 User role:', auth.user.role);
      loadChats();
      
      // Also refresh the notification count when entering the chat page
      // This ensures the sidebar badge is updated
      const refreshNotificationCount = () => {
        // Trigger a custom event that the NavSection can listen to
        window.dispatchEvent(new CustomEvent('refreshAdminNotifications'));
      };
      
      refreshNotificationCount();
    }
  }, [auth?.user, loadChats]);
  


  // Debug socket connection - fixed useEffect
  useEffect(() => {
    if (socketContext?.socket) {
      console.log('🔌 Socket connection status:', {
        connected: socketContext.socket.connected,
        id: socketContext.socket.id
      });
    }
  }, [socketContext?.socket]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatChatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.floor(diffMs / (1000 * 60))}m`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  const getUserFromChat = useCallback((chat: Chat) => {
    // Always get the second user (index 1) from the users array
    // This is the client/buyer/seller user in admin chats
    if (chat.users && chat.users.length > 1) {
      return chat.users[1];
    }
    // Fallback to finding any non-admin user if the array structure is unexpected
    return chat.users.find(user => user._id !== 'admin') || chat.users[0];
  }, []);

  const isOwnMessage = useCallback((msg: Message) => {
    // In backoffice context:
    // - If current user (admin) is the sender -> message goes RIGHT (admin sent to user)
    // - If current user (admin) is the receiver -> message goes LEFT (user sent to admin)
    
    const currentUserId = auth?.user?._id;
    const isCurrentUserSender = msg.sender === currentUserId;
    const isCurrentUserReceiver = msg.reciver === currentUserId;
    
    console.log('🔍 DEBUG - Message analysis:', {
      message: msg.message.substring(0, 20) + '...',
      sender: `"${msg.sender}"`,
      reciver: `"${msg.reciver}"`,
      currentUserId: `"${currentUserId}"`,
      isCurrentUserSender,
      isCurrentUserReceiver
    });
    
    // If current user is the sender, it's our message (goes RIGHT)
    if (isCurrentUserSender) {
      console.log('✅ Going RIGHT - Current user is sender');
      return true;
    }
    // If current user is the receiver, it's from someone else (goes LEFT)
    else if (isCurrentUserReceiver) {
      console.log('✅ Going LEFT - Current user is receiver');
      return false;
    }
    // Fallback: check if sender is 'admin' (for backward compatibility)
    else if (msg.sender === 'admin' || msg.sender === 'ADMIN') {
      console.log('✅ Going RIGHT - Admin is sender (fallback)');
      return true;
    }
    // Default: message from user (goes LEFT)
    else {
      console.log('✅ Going LEFT - User message (default)');
      return false;
    }
  }, [auth?.user?._id]);

  const getFilteredChats = useCallback((clientType: ClientType) => {
    console.group(`🔍 FILTERING CHATS FOR ${clientType.title}`);
    console.log('Total chats before filtering:', chats.length);
    
    const filteredChats = chats.filter(chat => {
      console.group(`Evaluating chat ${chat._id}`);
      
      // Get the non-admin user from the chat
      const user = getUserFromChat(chat);
      
      if (!user) {
        console.log('❌ No non-admin user found in chat - FILTERED OUT');
        console.groupEnd();
        return false;
      }
      
      // Check user AccountType and match with section
      let matchesType = false;
      const userAccountType = (user.AccountType || '').toUpperCase();
      
      console.log('User details:', {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        accountType: user.AccountType,
        normalizedType: userAccountType,
        targetSection: clientType.id
      });
      
      // Map known account types to their respective tabs
      if (userAccountType === 'PROFESSIONAL') {
        matchesType = clientType.id === 'professional';
        console.log(`Type is PROFESSIONAL, matches professional tab: ${matchesType}`);
      } else if (userAccountType === 'RESELLER') {
        matchesType = clientType.id === 'reseller';
        console.log(`Type is RESELLER, matches reseller tab: ${matchesType}`);
      } else if (userAccountType === 'CLIENT' || userAccountType === 'BUYER') {
        // Show both CLIENT and BUYER types in the client tab
        matchesType = clientType.id === 'client';
        console.log(`Type is ${userAccountType}, matches client tab: ${matchesType}`);
      } else if (clientType.id === 'client') {
        // For any other account type, show in the client tab as fallback
        // This ensures all chats are visible somewhere
        matchesType = true;
        console.log(`Type is ${userAccountType}, showing in client tab as fallback: ${matchesType}`);
      } else {
        console.log(`Type is ${userAccountType}, no matching tab found`);
      }
      
      const matchesSearch = searchTerm === '' || 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      console.log('Search term:', searchTerm);
      console.log('Matches search term:', matchesSearch);
      
      const shouldInclude = matchesType && matchesSearch;
      console.log(shouldInclude ? '✅ INCLUDED' : '❌ FILTERED OUT');
      console.groupEnd();
      
      return shouldInclude;
    });
    
    console.log('Chats after filtering:', filteredChats.length);
    console.groupEnd();
    
    return filteredChats;
  }, [chats, getUserFromChat, searchTerm]);

  const getTotalUnreadForType = useCallback((clientType: ClientType) => {
    return getFilteredChats(clientType).reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
  }, [getFilteredChats]);

  const handleChatSelect = useCallback(async (chat: Chat) => {
    console.log('🔍 Chat selected:', chat);
    console.log('🔍 Chat users:', chat.users);
    console.log('🔍 Current admin user:', auth?.user);
    
    // Debug: Log each user in the selected chat
    if (chat.users && Array.isArray(chat.users)) {
      console.group('🔍 CHAT USERS ANALYSIS');
      chat.users.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          accountType: user.AccountType,
          isAdmin: user._id === 'admin' || user.AccountType === 'admin',
          isCurrentUser: user._id === auth?.user?._id
        });
      });
      console.groupEnd();
    }
    
    setSelectedChat(chat);
    setView('chat');
    await loadMessages(chat._id);
    
    // Clear new notifications when chat is opened
    if (window.adminNotificationsHook?.clearNewNotifications) {
      window.adminNotificationsHook.clearNewNotifications();
    }
    
    // Mark all messages in this chat as read
    try {
      await MessageAPI.markAllAsRead(chat._id);
      console.log('✅ All messages marked as read for chat:', chat._id);
      
      // Immediately trigger badge refresh
      window.dispatchEvent(new CustomEvent('refreshAdminNotifications'));
      
      // Also silently update chats to reflect the read status
      silentlyUpdateChats();
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  }, [loadMessages, silentlyUpdateChats]);

  const handleBackToOverview = useCallback(() => {
    setView('overview');
    setSelectedChat(null);
    setMessages([]);
    
    // Trigger badge refresh when leaving chat
    window.dispatchEvent(new CustomEvent('refreshAdminNotifications'));
  }, []);
  
  // Debug filtered chats when they change
  useEffect(() => {
    if (chats.length > 0) {
      console.log('📊 Total chats loaded:', chats.length);
      
      // Log filtered chats for each client type
      clientTypes.forEach(type => {
        const filtered = getFilteredChats(type);
        console.log(`📊 Filtered chats for ${type.title}:`, filtered.length);
        
        // Log details of filtered out chats
        const filteredOut = chats.filter(chat => !filtered.includes(chat));
        if (filteredOut.length > 0) {
          console.log(`📊 Chats filtered out from ${type.title}:`, filteredOut.length);
          filteredOut.forEach((chat, index) => {
            const user = getUserFromChat(chat);
            console.log(`📊 Filtered out chat ${index + 1}:`, {
              chatId: chat._id,
              userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
              accountType: user?.AccountType || 'Unknown'
            });
          });
        }
      });
    }
  }, [chats, getFilteredChats, clientTypes, getUserFromChat]);

  if (view === 'chat' && selectedChat) {
    const user = getUserFromChat(selectedChat);
    
    return (
      <Page title="Centre de Communication">
        <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              borderBottom: 1, 
              borderColor: 'divider',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={handleBackToOverview}
                sx={{ color: 'white' }}
              >
                <ArrowBackIcon />
              </IconButton>
              
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                  width: 50,
                  height: 50 
                }}
              >
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <OnlineIcon sx={{ fontSize: 12, color: '#4CAF50' }} />
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {user?.AccountType} • En ligne
                  </Typography>
                  <Chip 
                    label="Client" 
                    size="small"
                    sx={{ 
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label="Admin" 
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
                <Chip 
                  label={user?.AccountType} 
                  sx={{ 
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>
          </Paper>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              bgcolor: alpha(theme.palette.grey[100], 0.3),
              backgroundImage: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)} 25%, transparent 25%), 
                               linear-gradient(-45deg, ${alpha(theme.palette.primary.main, 0.05)} 25%, transparent 25%), 
                               linear-gradient(45deg, transparent 75%, ${alpha(theme.palette.primary.main, 0.05)} 75%), 
                               linear-gradient(-45deg, transparent 75%, ${alpha(theme.palette.primary.main, 0.05)} 75%)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          >
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ChatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Commencez la conversation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Envoyez un message pour commencer à discuter avec {user?.firstName}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.map((msg, index) => (
                  <Zoom key={msg._id || index} in={true} timeout={300}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: isOwnMessage(msg) ? 'flex-end' : 'flex-start',
                        mb: 1,
                        alignItems: 'flex-end',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          maxWidth: '75%',
                          alignItems: isOwnMessage(msg) ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {/* Message bubble */}
                        <Paper
                          elevation={2}
                          sx={{
                            p: 2,
                            bgcolor: isOwnMessage(msg)
                              ? theme.palette.primary.main
                              : theme.palette.background.paper,
                            color: isOwnMessage(msg)
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.primary,
                            borderRadius: isOwnMessage(msg)
                              ? '20px 20px 4px 20px'
                              : '20px 20px 20px 4px',
                            boxShadow: isOwnMessage(msg)
                              ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                              : `0 2px 8px ${alpha(theme.palette.grey[500], 0.15)}`,
                            border: isOwnMessage(msg) 
                              ? 'none'
                              : `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                          }}
                        >
                          <Typography variant="body1" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                            {msg.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.7,
                              fontSize: '0.75rem',
                              display: 'block',
                              textAlign: isOwnMessage(msg) ? 'right' : 'left',
                            }}
                          >
                            {formatTime(msg.createdAt)}
                          </Typography>
                        </Paper>
                        
                        {/* Message sender indicator */}
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            opacity: 0.6,
                            fontSize: '0.7rem',
                            color: isOwnMessage(msg) 
                              ? theme.palette.primary.main 
                              : theme.palette.text.secondary,
                            fontWeight: 500,
                          }}
                        >
                          {isOwnMessage(msg) ? 'Vous' : user?.firstName || 'Utilisateur'}
                        </Typography>
                      </Box>
                    </Box>
                  </Zoom>
                ))}
                <div ref={messagesEndRef} />
              </Box>
            )}
          </Box>

          {/* Message Input */}
          <Paper 
            elevation={3}
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 6,
                    bgcolor: alpha(theme.palette.grey[100], 0.5),
                  },
                }}
              />
              <IconButton
                onClick={sendMessage}
                disabled={!message.trim()}
                sx={{
                  bgcolor: message.trim() ? theme.palette.primary.main : alpha(theme.palette.grey[400], 0.5),
                  color: message.trim() ? 'white' : theme.palette.action.disabled,
                  '&:hover': {
                    bgcolor: message.trim() ? theme.palette.primary.dark : alpha(theme.palette.grey[400], 0.7),
                  },
                  borderRadius: 3,
                  p: 1.5,
                  minWidth: 48,
                  height: 48,
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Box>
      </Page>
    );
  }

  return (
    <Page title="Centre de Communication">
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
          {/* Header */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                  width: 56,
                  height: 56 
                }}
              >
                <ChatIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Centre de Communication
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Gérez toutes vos conversations clients en un seul endroit
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Search Bar */}
          <Box sx={{ mb: 3, px: 1 }}>
            <TextField
              fullWidth
              placeholder="Rechercher des conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 4,
                  bgcolor: theme.palette.background.paper,
                },
              }}
            />
          </Box>

          {/* Client Type Tabs */}
          <Paper elevation={1} sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 72,
                  textTransform: 'none',
                  fontWeight: 600,
                },
              }}
            >
              {clientTypes.map((type, index) => {
                const Icon = type.icon;
                const unreadCount = getTotalUnreadForType(type);
                
                return (
                  <Tab
                    key={type.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon sx={{ color: type.color }} />
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {type.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getFilteredChats(type).length} conversations
                          </Typography>
                        </Box>
                        {unreadCount > 0 && (
                          <Badge 
                            badgeContent={unreadCount} 
                            color="error"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                  />
                );
              })}
            </Tabs>
          </Paper>

          {/* Chat Lists */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              clientTypes.map((type, index) => {
                if (selectedTab !== index) return null;
                
                const filteredChats = getFilteredChats(type);
                const Icon = type.icon;

                return (
                  <Fade key={type.id} in={true} timeout={500}>
                    <Box>
                      {filteredChats.length === 0 ? (
                        <Card sx={{ textAlign: 'center', py: 8 }}>
                          <CardContent>
                            <Icon sx={{ fontSize: 64, color: type.color, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                              Aucune conversation {type.title.toLowerCase()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {type.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      ) : (
                        <Paper elevation={1}>
                          <List sx={{ py: 0 }}>
                            {filteredChats.map((chat, chatIndex) => {
                              const user = getUserFromChat(chat);
                              if (!user) return null;

                              return (
                                <React.Fragment key={chat._id}>
                                  <ListItemButton
                                    onClick={() => handleChatSelect(chat)}
                                    sx={{
                                      p: 2.5,
                                      '&:hover': {
                                        bgcolor: alpha(type.color, 0.05),
                                      },
                                      borderLeft: 4,
                                      borderLeftColor: 'transparent',
                                      '&:hover .MuiListItemButton-root': {
                                        borderLeftColor: type.color,
                                      },
                                      display: 'flex',
                                      gap: 1,
                                    }}
                                  >
                                    <ListItemAvatar>
                                      <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        variant="dot"
                                        sx={{
                                          '& .MuiBadge-badge': {
                                            bgcolor: '#4CAF50',
                                            color: '#4CAF50',
                                            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                                          },
                                        }}
                                      >
                                        <Avatar 
                                          sx={{ 
                                            bgcolor: type.color,
                                            width: 56,
                                            height: 56,
                                            fontSize: '1.25rem',
                                            fontWeight: 600
                                          }}
                                        >
                                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                        </Avatar>
                                      </Badge>
                                    </ListItemAvatar>
                                    
                                    <ListItemText
                                      primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {user.firstName} {user.lastName}
                                          </Typography>
                                          <Chip 
                                            label={user.AccountType} 
                                            size="small"
                                            sx={{ 
                                              height: 20, 
                                              fontSize: '0.7rem',
                                              bgcolor: type.color,
                                              color: 'white',
                                              fontWeight: 600
                                            }}
                                          />
                                        </Box>
                                      }
                                      secondary={
                                        <Box>
                                          <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{ 
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              mb: 0.5
                                            }}
                                          >
                                            {chat.lastMessage?.message || 'Aucun message'}
                                          </Typography>
                                          {user.email && (
                                            <Typography variant="caption" color="text.secondary">
                                              {user.email}
                                            </Typography>
                                          )}
                                        </Box>
                                      }
                                    />
                                    
                                    <Box sx={{ textAlign: 'right' }}>
                                      {chat.lastMessage && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                          {formatChatTime(chat.lastMessage.createdAt)}
                                        </Typography>
                                      )}
                                      {(chat.unreadCount || 0) > 0 && (
                                        <Badge 
                                          badgeContent={chat.unreadCount} 
                                          color="error"
                                          sx={{
                                            '& .MuiBadge-badge': {
                                              fontSize: '0.75rem',
                                              height: 20,
                                              minWidth: 20,
                                              fontWeight: 600
                                            }
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </ListItemButton>
                                  {chatIndex < filteredChats.length - 1 && <Divider />}
                                </React.Fragment>
                              );
                            })}
                          </List>
                        </Paper>
                      )}
                    </Box>
                  </Fade>
                );
              })
            )}
          </Box>
        </Box>
      </Container>
    </Page>
  );
}