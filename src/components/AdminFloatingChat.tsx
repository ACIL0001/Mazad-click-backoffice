import React, { useState, useEffect, useRef, useCallback } from 'react';
import './FloatingAdminChat.css';
import { useTranslation } from 'react-i18next';
import { useCreateSocket } from '../contexts/SocketContext';
import { ChatAPI } from '../api/Chat';
import { MessageAPI } from '../api/message';
import { UserAPI } from '../api/user';
import useAuth from '../hooks/useAuth';
import useAdminNotifications from '../hooks/useAdminMessageNotifications';

interface Message {
  _id: string;
  message: string;
  sender: string;
  reciver: string;
  idChat: string;
  createdAt: string;
}

interface AdminChat {
  _id: string;
  users: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    AccountType: string;
  }>;
  createdAt: string;
}

// Define Socket interface to match what's expected
interface SocketWithReadyState {
  connected: boolean;
  id?: string;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
  // Remove readyState as it doesn't exist on socket.io sockets
}

const FloatingAdminChat: React.FC = () => {
  const { t } = useTranslation();
  const { auth } = useAuth();
  const socketContext = useCreateSocket();
  
  // Check if we're on auth-related pages and disable chat entirely
  const isOnAuthPage = typeof window !== 'undefined' && (
    window.location.pathname.includes('/login') ||
    window.location.pathname.includes('/register') ||
    window.location.pathname.includes('/otp-verification') ||
    window.location.pathname.includes('/reset-password') ||
    window.location.pathname.includes('/identity-verification') ||
    window.location.pathname.includes('/subscription-plans')
  );
  
  // Use the new admin message notifications hook - Fixed destructuring
  const { 
    notifications: adminNotifications, 
    unreadCount: unreadAdminMessagesCount, 
    markAsRead,
    markAllAsRead 
  } = useAdminNotifications();

  // Create separate functions for the missing methods
  const refreshNotifications = () => {
    // Implement refresh logic or call a method from the hook if available
    console.log('Refreshing notifications...');
  };

  const clearSocketMessages = () => {
    // Implement clear logic or call a method from the hook if available
    console.log('Clearing socket messages...');
  };

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [adminChat, setAdminChat] = useState<AdminChat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCharCount, setShowCharCount] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const adminChatRef = useRef(adminChat);
  useEffect(() => {
    adminChatRef.current = adminChat;
  }, [adminChat]);

  const processedMessagesRef = useRef<Set<string>>(new Set());
  const handleNewMessageRef = useRef<(data: any, eventType: string) => void>();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 100); // Max height of 100px
      textarea.style.height = newHeight + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && !((event.target as Element)?.closest('.emoji-picker') || (event.target as Element)?.closest('.emoji-btn'))) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Initialize admin chat
  const initializeAdminChat = async () => {
    if (!auth?.user?._id || !auth?.tokens?.accessToken) {
      console.log('FloatingAdminChat: User not authenticated, skipping chat initialization');
      return;
    }

    if (isOnAuthPage) {
      console.log('FloatingAdminChat: On auth page, completely skipping chat initialization');
      return;
    }

    // Zustand auth store has already verified and restored credentials

    console.log('FloatingAdminChat: All auth checks passed, initializing chat');
    setIsLoading(true);
    try {
      // Get existing chats to find admin chat
      const existingChats = await ChatAPI.getChats({
        id: auth.user._id,
        from: 'seller'
      });

      // Find admin chat (admin has AccountType = 'admin')
      const adminChatExists = (existingChats as AdminChat[])?.find((chat: AdminChat) =>
        chat.users.some(user => user.AccountType === 'admin')
      );

      if (adminChatExists) {
        setAdminChat(adminChatExists);
        // Load messages for this chat
        const chatMessages = await MessageAPI.getByConversation(adminChatExists._id);
        setMessages((chatMessages as Message[]) || []);
      } else {
        console.log('No admin chat found, will create on first message');
      }
    } catch (error) {
      console.error('Error initializing admin chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create admin chat if it doesn't exist
  const createAdminChat = async () => {
    if (!auth?.user?._id || !auth?.tokens?.accessToken) {
      console.log('FloatingAdminChat: User not authenticated, cannot create chat');
      return null;
    }

    if (isOnAuthPage) {
      console.log('FloatingAdminChat: On auth page, cannot create chat');
      return null;
    }

    try {
      // First try to get admin users from API
      let admins = [];
      try {
        admins = await UserAPI.getAdmins();
      } catch (apiError) {
        console.log('Could not fetch admin users, will create default admin for chat');
      }

      let adminUser;

      if (admins && (admins as any[]).length > 0) {
        // Use existing admin user
        adminUser = {
          _id: (admins as any[])[0]._id,
          firstName: (admins as any[])[0].firstName || 'Admin',
          lastName: (admins as any[])[0].lastName || 'Support',
          AccountType: 'admin',
          phone: (admins as any[])[0].phone || ''
        };
      } else {
        // Create a default admin for chat purposes
        try {
          await UserAPI.createAdmin?.(); // Create admin if endpoint exists
          // Retry getting admins
          const newAdmins = await UserAPI.getAdmins();
          if (newAdmins && (newAdmins as any[]).length > 0) {
            adminUser = {
              _id: (newAdmins as any[])[0]._id,
              firstName: (newAdmins as any[])[0].firstName || 'Admin',
              lastName: (newAdmins as any[])[0].lastName || 'Support',
              AccountType: 'admin',
              phone: (newAdmins as any[])[0].phone || ''
            };
          }
        } catch (createError) {
          console.log('Could not create admin user, using fallback');
          // Fallback: use a placeholder admin (this should be replaced with actual admin creation)
          adminUser = {
            _id: 'admin-support-id',
            firstName: 'Admin',
            lastName: 'Support',
            AccountType: 'admin',
            phone: ''
          };
        }
      }

      if (!adminUser) {
        console.error('Could not resolve admin user');
        return null;
      }

      const chatData = {
        users: [
          {
            _id: auth.user._id,
            firstName: auth.user.firstName,
            lastName: auth.user.lastName,
            AccountType: auth.user.type || 'seller',
            phone: auth.user.phone || ''
          },
          adminUser
        ],
        createdAt: new Date().toISOString() // Fixed: Convert Date to string
      };

      const newChat = await ChatAPI.createChat(chatData);
      setAdminChat(newChat as AdminChat);
      return newChat as AdminChat;
    } catch (error) {
      console.error('Error creating admin chat:', error);
      return null;
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !auth?.user?._id || !auth?.tokens?.accessToken || isSending) {
      if (!auth?.tokens?.accessToken) {
        console.log('FloatingAdminChat: User not authenticated, cannot send message');
      }
      return;
    }

    console.log('📤 Sending message:', message.trim());
    console.log('📤 Current user:', auth.user._id);
    console.log('📤 Current chat:', adminChat);

    setIsSending(true);
    let currentChat = adminChat;

    // Create chat if it doesn't exist
    if (!currentChat) {
      console.log('📤 Creating new admin chat');
      currentChat = await createAdminChat();
      if (!currentChat) {
        console.error('❌ Failed to create admin chat');
        setIsSending(false);
        return;
      }
    }

    // Always set sender/reciver as required
    const sender = auth.user._id;
    let reciver = 'admin';  // Always send to 'admin' which will go to all admins

    console.log('📤 Message data:', {
      sender,
      reciver,
      message: message.trim(),
      idChat: currentChat._id
    });

    try {
      const messageData = {
        idChat: currentChat._id,
        message: message.trim(),
        sender,
        reciver,
      };

      console.log('📤 Sending via API:', messageData);
      await MessageAPI.send(messageData);
      console.log('✅ Message sent successfully');
      
      setMessage('');
      // Refresh messages
      const updatedMessages = await MessageAPI.getByConversation(currentChat._id);
      setMessages((updatedMessages as Message[]) || []);
      console.log('✅ Messages refreshed');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Define incoming message handler (memoized with useCallback)
  const handleIncomingMessage = useCallback((data: any, eventType: string) => {
    console.log(`📨 ${eventType} message received in FloatingAdminChat:`, data);
    
    // Support both _id and messageId/id
    const rawId = data._id || data.messageId || data.id || 'unknown';
    const msgId = String(rawId);
    
    // Deduplicate using persistent ref set
    const messageKey = `${msgId}-${data.message}-${data.sender}-${data.createdAt}`;
    if (processedMessagesRef.current.has(messageKey)) {
      console.log(`🚫 ${eventType} message already processed, skipping:`, messageKey);
      return;
    }
    processedMessagesRef.current.add(messageKey);
    // Keep in set for 5 seconds to deduplicate
    setTimeout(() => processedMessagesRef.current.delete(messageKey), 5000);

    const currentChat = adminChatRef.current;

    // Check if this message belongs to our admin chat
    const isForCurrentChat = currentChat?._id && (data.idChat === currentChat._id || data.chatId === currentChat._id);
    const isFromAdmin = data.sender === 'admin' || data.sender === 'ADMIN' || data.senderId === 'admin';
    const isForCurrentUser = auth?.user?._id && (
      data.reciver === auth.user._id || 
      data.receiverId === auth.user._id || 
      data.reciver === 'admin' || 
      data.reciver === 'ADMIN'
    );

    console.log('🔍 Message analysis:', {
      eventType,
      isForCurrentChat,
      isFromAdmin,
      isForCurrentUser,
      messageSender: data.sender,
      messageReceiver: data.reciver,
      currentUserId: auth?.user?._id,
      chatId: data.idChat || data.chatId,
      currentChatId: currentChat?._id
    });
    
    if (isForCurrentChat && isForCurrentUser) {
      console.log('✅ Accepting message, adding to messages');
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const messageExists = prev.some(msg => 
          msg._id === msgId || 
          (msg.message === data.message && msg.sender === data.sender && 
           Math.abs(new Date(msg.createdAt).getTime() - new Date(data.createdAt).getTime()) < 1000)
        );
        if (messageExists) {
          console.log('⚠️ Message already exists, skipping');
          return prev;
        }
        
        // Build normalized Message
        const normalizedMsg: Message = {
          _id: msgId,
          message: data.message || '',
          sender: data.sender || '',
          reciver: data.reciver || '',
          idChat: data.idChat || data.chatId || currentChat?._id || '',
          createdAt: data.createdAt || data.timestamp || new Date().toISOString()
        };
        
        return [...prev, normalizedMsg];
      });
      
      // Only increment unread count if chat is closed and it is not own message
      if (!isOpenRef.current && data.sender !== auth?.user?._id) {
        console.log('📊 Incrementing unread count');
        setUnreadCount(prev => prev + 1);
      }

      setTimeout(() => {
        scrollToBottom();
      }, 50);
    } else {
      console.log('❌ Message not for admin chat, ignoring');
    }
  }, [auth?.user?._id]);

  // Keep ref current on every render
  handleNewMessageRef.current = handleIncomingMessage;

  // Handle socket message event listeners
  useEffect(() => {
    if (!socketContext?.socket) return;
    const socket = socketContext.socket as SocketWithReadyState;

    console.log('🔌 AdminFloatingChat: Registering stable socket listeners');

    const handleSendMessage = (data: any) => {
      handleNewMessageRef.current?.(data, 'sendMessage');
    };
    const handleAdminMessage = (data: any) => {
      handleNewMessageRef.current?.(data, 'adminMessage');
    };
    const handleNewMessage = (data: any) => {
      handleNewMessageRef.current?.(data, 'newMessage');
    };
    const handleChatMessageUpdate = (data: any) => {
      const normalizedData = {
        ...data,
        _id: data._id || data.messageId,
        idChat: data.idChat || data.chatId,
      };
      handleNewMessageRef.current?.(normalizedData, 'chatMessageUpdate');
    };

    const handleTestResponse = (data: any) => {
      console.log('🧪 Test response received:', data);
    };

    const handleTestBroadcast = (data: any) => {
      console.log('🧪 Test broadcast received:', data);
    };

    const handleNotification = (notification: any) => {
      console.log('🔔 Received notification:', notification);
      const isForCurrentUser = notification.userId === auth?.user?._id;
      const isAdminMessageNotification = notification.type === 'MESSAGE_ADMIN' || notification.type === 'MESSAGE_RECEIVED';
      
      if (isForCurrentUser && isAdminMessageNotification) {
        console.log('✅ Accepting notification for current user');
        refreshNotifications();
      }
    };

    socket.on('sendMessage', handleSendMessage);
    socket.on('adminMessage', handleAdminMessage);
    socket.on('newMessage', handleNewMessage);
    socket.on('chatMessageUpdate', handleChatMessageUpdate);
    socket.on('testResponse', handleTestResponse);
    socket.on('testBroadcast', handleTestBroadcast);
    socket.on('notification', handleNotification);

    return () => {
      console.log('🔌 AdminFloatingChat: Cleaning up stable socket listeners');
      socket.off('sendMessage', handleSendMessage);
      socket.off('adminMessage', handleAdminMessage);
      socket.off('newMessage', handleNewMessage);
      socket.off('chatMessageUpdate', handleChatMessageUpdate);
      socket.off('testResponse', handleTestResponse);
      socket.off('testBroadcast', handleTestBroadcast);
      socket.off('notification', handleNotification);
    };
  }, [socketContext?.socket, auth?.user?._id]);

  // Handle room joining/leaving and connection state changes
  useEffect(() => {
    const socket = socketContext?.socket;
    if (!socket || !adminChat?._id) return;

    const joinRoom = () => {
      if (socket.connected) {
        socket.emit('joinChat', { chatId: adminChat._id, userId: auth?.user?._id || '' });
        console.log('🔌 AdminFloatingChat: Joined chat room:', adminChat._id);
        socket.emit('test', { message: 'Test from FloatingAdminChat' });
      }
    };

    joinRoom();

    socket.on('connect', joinRoom);

    return () => {
      socket.off('connect', joinRoom);
      if (socket.connected) {
        socket.emit('leaveChat', { chatId: adminChat._id, userId: auth?.user?._id || '' });
        console.log('🔌 AdminFloatingChat: Left chat room:', adminChat._id);
      }
    };
  }, [socketContext?.socket, adminChat?._id, auth?.user?._id]);


  // Initialize chat when component mounts - with delays and auth page guards
  useEffect(() => {
    if (isOnAuthPage) {
      return; // Silent return on auth pages
    }

    if (auth?.user && auth?.tokens?.accessToken) {
      // Add delay to ensure authentication is fully complete before making API calls
      const timeoutId = setTimeout(() => {
        if (!isOnAuthPage && auth?.user && auth?.tokens?.accessToken) {
          console.log('FloatingAdminChat: Initializing chat for user:', auth.user._id);
          initializeAdminChat();
          refreshNotifications();
        }
      }, 2000); // Reduced to 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [auth?.user?._id, auth?.tokens?.accessToken]); // Simplified dependencies

  // Update unread count from admin notifications
  useEffect(() => {
    setUnreadCount(unreadAdminMessagesCount);
  }, [unreadAdminMessagesCount]);

  // Reset unread count when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      clearSocketMessages(); // Clear unread messages when chat is opened
    }
  }, [isOpen]);

  // Debug: Log messages state changes
  useEffect(() => {
    console.log('🔍 Messages state changed:', messages);
    console.log('🔍 Number of messages:', messages.length);
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) { // Max character limit
      setMessage(value);
    }

    // Show character count when approaching limit
    setShowCharCount(value.length > 1800);

    // Clear typing timeout if it exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new typing timeout
    typingTimeoutRef.current = setTimeout(() => {
      // Handle typing indicator logic here if needed
    }, 1000);
  };

  // Add emoji to message
  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Common emojis for quick access
  const quickEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '🙏'];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (senderId: string) => senderId === auth?.user?._id;

  // Don't render the component at all on auth pages
  if (isOnAuthPage) {
    console.log('FloatingAdminChat: On auth page, not rendering component');
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className={`floating-chat-button ${isOpen ? 'hidden' : ''}`}>
        <button
          className="chat-fab"
          onClick={async () => {
            if (!auth?.user?._id || !auth?.tokens?.accessToken) {
              console.log('FloatingAdminChat: User not authenticated, cannot open chat');
              return;
            }

            if (isOnAuthPage) {
              console.log('FloatingAdminChat: On auth page, cannot open chat');
              return;
            }
            
            // Show chat dialog immediately for better UX
            setIsOpen(true);
            setIsLoading(true);
            
            try {
              // 1. Get all chats for this user
              const existingChats = await ChatAPI.getChats({
                id: auth.user._id,
                from: 'seller'
              });

              // 2. Check if a chat with admin exists
              const adminChatExists = (existingChats as AdminChat[])?.find((chat: AdminChat) =>
                chat.users.some(user => user._id === 'admin' || user.AccountType === 'admin') &&
                chat.users.some(user => user._id === auth.user?._id)
              );

              if (adminChatExists) {
                setAdminChat(adminChatExists);
                // Load messages
                const chatMessages = await MessageAPI.getByConversation(adminChatExists._id);
                setMessages((chatMessages as Message[]) || []);
                
                // Mark all messages in this chat as read
                try {
                  await MessageAPI.markAllAsRead(adminChatExists._id);
                  console.log('✅ All admin messages marked as read for chat:', adminChatExists._id);
                  // Immediately reset local unread count for instant UI feedback
                  setUnreadCount(0);
                  // Refresh admin notifications to update unread count
                  refreshNotifications();
                } catch (error) {
                  console.error('❌ Error marking admin messages as read:', error);
                }
                
                return;
              }

              // 3. If not, create a new chat
              const chatData = {
                users: [
                  {
                    _id: 'admin',
                    AccountType: 'admin',
                    firstName: 'Admin',
                    lastName: 'Support',
                    phone: ''
                  },
                  {
                    _id: auth.user._id,
                    AccountType: auth.user.type || 'seller',
                    firstName: auth.user.firstName,
                    lastName: auth.user.lastName,
                    phone: auth.user.phone || ''
                  }
                ],
                createdAt: new Date().toISOString()
              };

              const newChat = await ChatAPI.createChat(chatData);
              setAdminChat(newChat as AdminChat);
              // Load messages
              const chatMessages = await MessageAPI.getByConversation((newChat as AdminChat)._id);
              setMessages((chatMessages as Message[]) || []);
              
              // Mark all messages in this chat as read (in case there are any)
              try {
                await MessageAPI.markAllAsRead((newChat as AdminChat)._id);
                console.log('✅ All admin messages marked as read for new chat:', (newChat as AdminChat)._id);
                // Immediately reset local unread count for instant UI feedback
                setUnreadCount(0);
                // Refresh admin notifications to update unread count
                refreshNotifications();
              } catch (error) {
                console.error('❌ Error marking admin messages as read in new chat:', error);
              }
            } catch (error) {
              console.error('Error handling Floating Admin Chat:', error);
              // On error, you might want to close the chat or show an error message
              // setIsOpen(false); // Uncomment if you want to close on error
            } finally {
              setIsLoading(false);
            }
          }}
          aria-label={t('chat.openAdminChat')}
        >
          <i className="bi bi-headset"></i>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </button>
      </div>

      {/* Chat Dialog */}
      {isOpen && (
        <div className="chat-dialog-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false);
        }}>
          <div className="chat-dialog">
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-content">
                <div className="admin-avatar">
                  <i className="bi bi-headset"></i>
                </div>
                <div className="chat-title">
                  <h4>{t('chat.adminSupport')}</h4>
                  <div className="online-status">
                    <span className="online-dot"></span>
                    <span>{t('chat.online')}</span>
                  </div>
                </div>
              </div>

              <button
                className="close-chat-btn"
                onClick={() => setIsOpen(false)}
                aria-label={t('chat.closeChat')}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            {/* Messages Area */}
            <div className="chat-content">
              <div className="messages-area">
                {isLoading ? (
                  <div className="loading-messages">
                    <div className="loading-spinner"></div>
                    <p>{t('chat.loadingMessages')}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-chat">
                    <i className="bi bi-chat-dots"></i>
                    <p>{t('chat.startConversation')}</p>
                    <small>{t('chat.hereToHelp')}</small>
                    {/* Test button for debugging */}
                    <button 
                      onClick={() => {
                        const testMessage: Message = {
                          _id: 'test-' + Date.now(),
                          message: 'This is a test message from admin',
                          sender: 'admin',
                          reciver: auth?.user?._id || '',
                          idChat: adminChat?._id || 'test-chat',
                          createdAt: new Date().toISOString()
                        };
                        setMessages([testMessage]);
                        console.log('🧪 Test message added:', testMessage);
                      }}
                      style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {t('chat.addTestMessage')}
                    </button>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    console.log('🔍 Rendering message:', msg);
                    return (
                      <div
                        key={msg._id || index}
                        className={`message ${isOwnMessage(msg.sender) ? 'own' : 'other'}`}
                      >
                        <div className="message-bubble">
                          <p>{msg.message}</p>
                          <span className="message-time">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="message other">
                    <div className="message-bubble typing">
                      <p><em>{t('chat.adminTyping')}</em></p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Message Input */}
              <div className="message-input-area">
                <div className="input-container">
                  <div className="input-wrapper">
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder={t('chat.typeMessage')}
                      className="message-input"
                      disabled={isSending}
                    />
                    <div className="input-actions">
                      <button
                        type="button"
                        className="emoji-btn"
                        title={t('chat.addEmoji')}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <i className="bi bi-emoji-smile"></i>
                      </button>
                      <button
                        type="button"
                        className="attach-btn"
                        title={t('chat.attachFile')}
                      >
                        <i className="bi bi-paperclip"></i>
                      </button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="emoji-picker">
                        <div className="emoji-grid">
                          {quickEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              className="emoji-item"
                              onClick={() => addEmoji(emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <div className="emoji-picker-footer">
                          <small>{t('chat.quickEmojis')}</small>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || isSending}
                    className={`send-btn ${isSending ? 'sending' : ''}`}
                    aria-label={t('chat.sendMessage')}
                  >
                    {isSending ? (
                      <div className="sending-spinner"></div>
                    ) : (
                      <i className="bi bi-send"></i>
                    )}
                  </button>
                </div>
                <div className="input-footer">
                  <div className="input-hint">
                    {t('chat.inputHint')}
                  </div>
                  {showCharCount && (
                    <div className={`char-count ${message.length > 1900 ? 'warning' : ''}`}>
                      {message.length}/2000
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .floating-chat-button {
          position: fixed;
          bottom: 24px;
          right: 100px;
          z-index: 1350;
          transition: all 0.3s ease;
        }

        .floating-chat-button.hidden {
          opacity: 0;
          pointer-events: none;
        }

        .chat-fab {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(0, 123, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 48px rgba(0, 123, 255, 0.4);
        }

        .unread-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border: 2px solid white;
        }

        .chat-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(6px);
          z-index: 1400;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .chat-dialog {
          width: 420px;
          height: 600px;
          max-height: 85vh;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .chat-header {
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
          color: white;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          z-index: 2;
        }

        .chat-header-content {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .admin-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .chat-title h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.01em;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .online-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          opacity: 0.9;
        }

        .online-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
          100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }

        .close-chat-btn {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
        }

        .close-chat-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .chat-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        .messages-area {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .loading-messages {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #f1f5f9;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-chat {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }

        .empty-chat i {
          font-size: 54px;
          margin-bottom: 16px;
          color: #3b82f6;
          opacity: 0.4;
        }

        .empty-chat p {
          margin: 8px 0;
          font-weight: 500;
          color: #475569;
        }

        .empty-chat small {
          color: #94a3b8;
        }

        .message {
          display: flex;
          margin-bottom: 4px;
          animation: messageSlide 0.3s ease;
        }

        @keyframes messageSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.own {
          justify-content: flex-end;
        }

        .message.other {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 82%;
          padding: 12px 18px;
          border-radius: 20px;
          background: white;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
          position: relative;
          font-size: 14.5px;
          line-height: 1.5;
        }

        .message.own .message-bubble {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.other .message-bubble {
          border-bottom-left-radius: 4px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #1e293b;
        }

        .message-bubble.typing {
          font-style: italic;
          opacity: 0.7;
          background: #f1f5f9;
        }

        .message-bubble p {
          margin: 0 0 6px 0;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.8;
          display: block;
          text-align: right;
        }

        .message-input-area {
          padding: 16px 20px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.02);
          z-index: 2;
        }

        .input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          width: 100%;
        }

        .input-wrapper {
          flex: 1;
          position: relative;
          background: #f8fafc;
          border-radius: 24px;
          border: 1px solid #cbd5e1;
          transition: all 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          background: #ffffff;
        }

        .message-input {
          width: 100%;
          padding: 12px 70px 12px 18px;
          border: none;
          border-radius: 24px;
          resize: none;
          outline: none;
          font-family: inherit;
          font-size: 14.5px;
          line-height: 1.4;
          background: transparent;
          min-height: 44px;
          max-height: 120px;
          overflow-y: auto;
        }

        .message-input::placeholder {
          color: #94a3b8;
        }

        .message-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-actions {
          position: absolute;
          right: 8px;
          bottom: 6px;
          display: flex;
          gap: 4px;
        }

        .emoji-btn,
        .attach-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          color: #64748b;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .emoji-btn:hover,
        .attach-btn:hover {
          background: #f1f5f9;
          color: #3b82f6;
        }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-size: 18px;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4);
        }

        .send-btn:disabled {
          background: #cbd5e1;
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
          opacity: 1;
        }

        .send-btn.sending {
          background: #22c55e;
        }

        .sending-spinner {
          width: 22px;
          height: 22px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          gap: 12px;
        }

        .input-hint {
          font-size: 12px;
          color: #64748b;
          opacity: 0.8;
          flex: 1;
        }

        .char-count {
          font-size: 11px;
          color: #94a3b8;
          background: #f8fafc;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 500;
        }

        .char-count.warning {
          color: #ef4444;
          background: #fef2f2;
        }

        .emoji-picker {
          position: absolute;
          bottom: calc(100% + 10px);
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 1450;
          min-width: 240px;
          margin-bottom: 8px;
          animation: fadeIn 0.2s ease;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          padding: 12px;
        }

        .emoji-item {
          width: 40px;
          height: 40px;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .emoji-item:hover {
          background: #f1f5f9;
          transform: scale(1.1);
        }

        .emoji-picker-footer {
          padding: 8px 12px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .emoji-picker-footer small {
          color: #94a3b8;
          font-size: 11px;
        }

        /* Scrollbar styling */
        .messages-area::-webkit-scrollbar,
        .message-input::-webkit-scrollbar {
          width: 6px;
        }

        .messages-area::-webkit-scrollbar-track,
        .message-input::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-area::-webkit-scrollbar-thumb,
        .message-input::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .messages-area::-webkit-scrollbar-thumb:hover,
        .message-input::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @media (max-width: 768px) {
          .floating-chat-button {
            bottom: 24px;
            right: 80px;
          }
          .chat-dialog {
            height: 70vh;
            max-width: 380px;
          }
        }

        @media (max-width: 480px) {
          .chat-dialog-overlay {
            padding: 0;
            align-items: flex-end;
          }
          
          .chat-dialog {
            width: 100vw;
            height: 85vh;
            max-height: none;
            max-width: none;
            border-radius: 24px 24px 0 0;
            animation: slideUpMobile 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes slideUpMobile {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          
          .floating-chat-button {
            bottom: 90px;
            right: 20px;
          }
          
          .chat-fab {
            width: 56px;
            height: 56px;
            font-size: 22px;
          }

          .chat-header {
            border-radius: 24px 24px 0 0;
            padding: 16px 20px;
          }

          .input-container {
            gap: 10px;
          }

          .send-btn {
            width: 42px;
            height: 42px;
            font-size: 18px;
          }

          .message-input {
            padding: 12px 60px 12px 16px;
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </>
  );
};

export default FloatingAdminChat;