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
  Dialog,
  DialogContent,
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
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Mic as MicIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { SocketContext } from '../../contexts/SocketContext';
import { ChatAPI } from '../../api/Chat';
import { MessageAPI } from '../../api/message';
import useAuth from '../../hooks/useAuth';
import Page from '../../components/Page';

const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  return (import.meta.env.MODE === 'production'
    ? 'https://mazadclick-server.onrender.com'
    : 'http://localhost:3000').replace(/\/$/, '');
})();

const STATIC_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_STATIC_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  return API_BASE_URL;
})();

const buildAbsoluteUrl = (path: string | undefined | null): string => {
  if (!path) {
    return STATIC_BASE_URL;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (!path.startsWith('/')) {
    return `${STATIC_BASE_URL}/${path}`;
  }
  return `${STATIC_BASE_URL}${path}`;
};

const resolveBrowserBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location;
    if (hostname && hostname !== 'localhost') {
      const portSegment = port ? `:${port}` : '';
      return `${protocol}//${hostname}${portSegment}`.replace(/\/$/, '');
    }
  }
  return API_BASE_URL;
};

// Interfaces
interface Message {
  _id: string;
  message: string;
  sender: string;
  reciver: string;
  idChat: string;
  createdAt: string;
  isRead?: boolean;
  attachment?: {
    _id: string;
    url: string;
    name: string;
    type: string;
    size: number;
    filename: string;
  };
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
  },
  {
    id: 'guest',
    title: 'Invités',
    icon: PersonIcon,
    accountTypes: ['guest', 'GUEST'],
    color: '#9c27b0',
    description: 'Utilisateurs non authentifiés'
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
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  
  // States for file attachments
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States for voice messages
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
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
      
      // Process chats to identify and enhance guest chats
      const processedChats = await Promise.all((allChats || []).map(async (chat) => {
        try {
          // Get messages for this chat to check if it's a guest chat
          const chatMessages = await MessageAPI.read(chat._id);
          
          // Check if this chat has any guest messages
          const guestMessages = chatMessages.filter((msg: any) => 
            msg.sender === 'guest' || msg.isGuestMessage
          );
          
          if (guestMessages.length > 0) {
            // This is a guest chat - enhance the chat structure
            const enhancedChat = {
              ...chat,
              isGuestChat: true,
              lastMessage: guestMessages[guestMessages.length - 1], // Last guest message
              unreadCount: guestMessages.filter((msg: any) => 
                msg.sender === 'guest' && !msg.isRead
              ).length
            };
            
            // Update the guest user info if available from messages
            const guestMessage = guestMessages.find((msg: any) => msg.guestName);
            if (guestMessage) {
              enhancedChat.users = enhancedChat.users.map((user: any) => {
                if (user._id === 'guest') {
                  return {
                    ...user,
                    firstName: guestMessage.guestName || 'Guest',
                    phone: guestMessage.guestPhone || ''
                  };
                }
                return user;
              });
            }
            
            return enhancedChat;
          } else {
            // Regular chat - calculate unread count normally
            const unreadCount = chatMessages.filter((msg: Message) => 
              msg.sender !== auth.user._id && !msg.isRead
            ).length;
            
            return {
              ...chat,
              unreadCount,
              lastMessage: chatMessages[chatMessages.length - 1] || null
            };
          }
        } catch (error) {
          console.error('❌ Error processing chat:', chat._id, error);
          return { ...chat, unreadCount: 0 };
        }
      }));
      
      console.log('🔍 Processed chats:', processedChats.length);
      
      // Debug each chat's user structure in detail
      if (Array.isArray(processedChats)) {
        console.group('🔎 DETAILED CHAT ANALYSIS');
        processedChats.forEach((chat, index) => {
          console.group(`Chat ${index + 1} (${chat._id})`);
          console.log('Full chat object:', chat);
          console.log('Chat ID:', chat._id);
          console.log('Created at:', new Date(chat.createdAt).toLocaleString());
          console.log('User count:', chat.users?.length || 0);
          console.log('Has admin user:', chat.users?.some(u => u._id === 'admin') || false);
          console.log('Is guest chat:', (chat as any).isGuestChat || false);
          
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

      console.log('📊 Final processed chats:', processedChats.length);
      setChats(processedChats);
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

      // Process chats to identify and enhance guest chats (same logic as loadChats)
      const processedChats = await Promise.all((allChats || []).map(async (chat) => {
        try {
          // Get messages for this chat to check if it's a guest chat
          const chatMessages = await MessageAPI.read(chat._id);
          
          // Check if this chat has any guest messages
          const guestMessages = chatMessages.filter((msg: any) => 
            msg.sender === 'guest' || msg.isGuestMessage
          );
          
          if (guestMessages.length > 0) {
            // This is a guest chat - enhance the chat structure
            const enhancedChat = {
              ...chat,
              isGuestChat: true,
              lastMessage: guestMessages[guestMessages.length - 1], // Last guest message
              unreadCount: guestMessages.filter((msg: any) => 
                msg.sender === 'guest' && !msg.isRead
              ).length
            };
            
            // Update the guest user info if available from messages
            const guestMessage = guestMessages.find((msg: any) => msg.guestName);
            if (guestMessage) {
              enhancedChat.users = enhancedChat.users.map((user: any) => {
                if (user._id === 'guest') {
                  return {
                    ...user,
                    firstName: guestMessage.guestName || 'Guest',
                    phone: guestMessage.guestPhone || ''
                  };
                }
                return user;
              });
            }
            
            return enhancedChat;
          } else {
            // Regular chat - calculate unread count normally
            const unreadCount = chatMessages.filter((msg: Message) => 
              msg.sender !== auth.user._id && !msg.isRead
            ).length;
            
            return {
              ...chat,
              unreadCount,
              lastMessage: chatMessages[chatMessages.length - 1] || null
            };
          }
        } catch (error) {
          console.error('❌ Error processing chat:', chat._id, error);
          return { ...chat, unreadCount: 0 };
        }
      }));

      setChats(processedChats);
    } catch (error) {
      console.error('Error silently updating chats:', error);
    }
  }, [auth?.user]);

  // Load messages for selected chat - memoized with useCallback
  const loadMessages = useCallback(async (chatId: string) => {
    console.log('🔄 Loading messages for chatId:', chatId);
    try {
      // All messages now come from the server API
      const chatMessages = await MessageAPI.read(chatId);
      console.log('📨 Messages received:', chatMessages);
      console.log('📨 Number of messages:', chatMessages?.length || 0);
      
      // Log messages with attachments
      const messagesWithAttachments = chatMessages?.filter(msg => msg.attachment) || [];
      if (messagesWithAttachments.length > 0) {
        console.log('📎 ChatLayout found messages with attachments:', messagesWithAttachments.length);
        messagesWithAttachments.forEach(msg => {
          console.log('📎 ChatLayout attachment data:', msg.attachment);
        });
      }
      
      setMessages(chatMessages || []);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  }, []);

  // Silent message loading for real-time updates
  // This function loads messages without showing loading states to the user
  const silentlyLoadMessages = useCallback(async (chatId: string) => {
    try {
      // All messages now come from the server API
      const chatMessages = await MessageAPI.read(chatId);
      setMessages(chatMessages || []);
    } catch (error) {
      console.error('❌ Error silently loading messages:', error);
    }
  }, []);

  // Send message - memoized with useCallback
  const sendMessage = useCallback(async () => {
    if (!message.trim() || !selectedChat || !auth?.user) return;

    // Check if this is a guest chat
    const isGuestChat = (selectedChat as any)?.isGuestChat;
    
    if (isGuestChat) {
      console.log('📤 Admin responding to guest chat');
      
      // For guest chats, send response through the regular API
      // The server will handle sending to the guest user
      const messageData = {
        idChat: selectedChat._id,
        message: message.trim(),
        sender: 'admin',
        reciver: 'guest', // Send to guest
      };

      console.log('📤 Sending admin response via API:', messageData);
      const sentMessage = await MessageAPI.send(messageData);
      console.log('✅ Admin response sent successfully:', sentMessage);
      
      setMessage('');
      
      // Refresh messages to show the new response
      await loadMessages(selectedChat._id);
      await silentlyUpdateChats();
      
      // Auto-scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return;
    }

    // Regular authenticated user flow
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
      
      // The server-side MessageService.create will handle socket events automatically
      // No need to emit socket events from client-side
      
      setMessage('');
      // Refresh messages
      await loadMessages(selectedChat._id);
      await silentlyUpdateChats();
      
      // Immediately trigger badge refresh after sending message
      window.dispatchEvent(new CustomEvent('refreshAdminNotifications'));
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }, [message, selectedChat, auth?.user, socketContext?.socket, loadMessages, silentlyUpdateChats, scrollToBottom]);

  // Handle file selection - memoized with useCallback
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File is too large. Maximum size: 10MB');
        return;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('File type not supported. Supported formats: Images (JPG, PNG, GIF, WebP), PDF, TXT, DOC, DOCX');
        return;
      }

      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview('');
      }
    }
  }, []);

  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setFilePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const sendAttachment = useCallback(async () => {
    if (!selectedFile || !selectedChat) {
      return;
    }

    setIsUploading(true);
    
    // Create temporary message for immediate display
    const isAdmin = auth?.user?.role === 'ADMIN';
    const sender = isAdmin ? 'admin' : auth?.user?._id;
    const tempMessageId = `temp-attachment-${Date.now()}-${Math.random()}`;
    
    // Create a blob URL for preview
    const previewUrl = URL.createObjectURL(selectedFile);
    
    const tempAttachmentInfo = {
      _id: tempMessageId,
      url: previewUrl,
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
      filename: selectedFile.name
    };
    
    // Find receiver
    const user = selectedChat.users.find(u => u._id !== 'admin' && u.AccountType !== 'admin');
    const reciver = isAdmin ? (user?._id || 'guest') : 'admin';
    
    const tempMessage: Message = {
      _id: tempMessageId,
      message: `📎 ${selectedFile.name}`,
      sender: sender || '',
      reciver: reciver,
      idChat: selectedChat._id,
      createdAt: new Date().toISOString(),
      attachment: tempAttachmentInfo,
      isRead: false
    };
    
    // Add temporary message immediately to local state
    setMessages(prev => [...prev, tempMessage]);
    console.log('✅ Temporary attachment message added to local state');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollToBottom();
    }, 10);
    
    try {
      // Step 1: Upload file to attachments endpoint
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('as', 'message-attachment');
      
      console.log('📤 Uploading file...');
      // const apiUrl = typeof window !== 'undefined' && window.location ? 
      //   `${window.location.protocol}//${window.location.hostname}:3000` : 
      //   'http://localhost:3000';
      const apiUrl = resolveBrowserBaseUrl();
      const uploadResponse = await fetch(`${apiUrl.replace(/\/$/, '')}/attachments/upload`, {
        method: 'POST',
        body: uploadFormData
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      console.log('✅ File uploaded:', uploadData);
      
      // Extract attachment info
      const attachmentInfo = {
        _id: uploadData._id || uploadData.id,
      // url: uploadData.fullUrl || uploadData.url || `http://localhost:3000/static/${uploadData.filename}`,
      url: uploadData.fullUrl || uploadData.url || buildAbsoluteUrl(`/static/${uploadData.filename}`),
        name: uploadData.originalname || selectedFile.name,
        type: uploadData.mimetype || selectedFile.type,
        size: uploadData.size || selectedFile.size,
        filename: uploadData.filename
      };

      // Step 2: Create message with attachment
      const messageData = {
        idChat: selectedChat._id,
        message: `📎 ${selectedFile.name}`,
        sender: sender || '',
        reciver: reciver,
        attachment: attachmentInfo, // Add attachment to message
      };

      console.log('📤 Sending attachment message with data:', JSON.stringify(messageData, null, 2));
      console.log('📎 Attachment info being sent:', JSON.stringify(attachmentInfo, null, 2));
      
      const sentMessage = await MessageAPI.send(messageData);
      
      console.log('✅ Attachment message sent, response:', JSON.stringify(sentMessage, null, 2));
      
      // Replace temporary message with server response
      const messageResponse = sentMessage?.data || sentMessage;
      if (messageResponse && messageResponse._id) {
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessageId
            ? { ...messageResponse, attachment: attachmentInfo }
            : msg
        ));
        console.log('✅ Temporary attachment message replaced with server response');
        
        // Clean up blob URL
        URL.revokeObjectURL(previewUrl);
      }

      // Clear file selection
      removeSelectedFile();

      // Refresh messages
      await loadMessages(selectedChat._id);
      await silentlyUpdateChats();
    } catch (error) {
      console.error('❌ Error sending attachment:', error);
      
      // Replace with error message
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessageId
          ? { ...msg, message: 'Failed to send attachment', isError: true } as any
          : msg
      ));
      
      alert('Failed to send attachment. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, selectedChat, auth?.user, loadMessages, silentlyUpdateChats, removeSelectedFile, scrollToBottom]);

  // Voice message functions
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const sendVoiceMessage = useCallback(async () => {
    if (!audioBlob || !selectedChat) {
      return;
    }

    try {
      const formData = new FormData();
      const isAdmin = auth?.user?.role === 'ADMIN';
      
      formData.append('audio', audioBlob, 'voice-message.webm');
      formData.append('idChat', selectedChat._id);
      formData.append('sender', isAdmin ? 'admin' : (auth?.user?._id || 'guest'));
      formData.append('reciver', isAdmin ? selectedChat.users.find(u => u._id !== 'admin')?._id || 'guest' : 'admin');

      // const apiUrl = typeof window !== 'undefined' && window.location ? 
      //   `${window.location.protocol}//${window.location.hostname}:3000` : 
      //   'http://localhost:3000';
      const apiUrl = resolveBrowserBaseUrl();
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/message/voice-message`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAudioBlob(null);
        setAudioUrl('');
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        
        // Refresh messages
        await loadMessages(selectedChat._id);
        await silentlyUpdateChats();
      } else {
        throw new Error('Failed to send voice message');
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert('Failed to send voice message');
    }
  }, [audioBlob, selectedChat, auth?.user, audioUrl, loadMessages, silentlyUpdateChats]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') return 'picture_as_pdf';
    if (fileType.includes('word')) return 'description';
    if (fileType === 'text/plain') return 'text_snippet';
    return 'attach_file';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  const handleImageClick = useCallback((imageUrl: string, imageName: string) => {
    console.log('🖼️ Opening image modal:', { imageUrl, imageName });
    setSelectedImage({ url: imageUrl, name: imageName });
  }, []);

  const handleCloseImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleDownloadImage = useCallback(async (fileUrl: string, fileName: string) => {
    try {
      console.log('📥 Starting download:', { fileUrl, fileName });
      
      // Check if fileUrl is valid
      if (!fileUrl) {
        throw new Error('File URL is undefined or empty');
      }
      
      // Ensure we have a proper URL
      let fullUrl = fileUrl;
      if (fileUrl.startsWith('/static/')) {
        // const apiUrl = typeof window !== 'undefined' && window.location ? 
        //   `${window.location.protocol}//${window.location.hostname}:3000` : 
        //   'http://localhost:3000';
        const apiUrl = resolveBrowserBaseUrl();
        fullUrl = `${apiUrl}${fileUrl}`;
      }
      
      console.log('📥 Download URL:', fullUrl);
      
      // Fetch the file as a blob
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('📥 Blob type:', blob.type);
      console.log('📥 File size:', blob.size, 'bytes');
      
      // Create object URL from the blob
      const objectUrl = URL.createObjectURL(blob);
      
      // Determine file name and extension
      let downloadFileName = fileName || 'file';
      if (!downloadFileName || downloadFileName === 'undefined' || !downloadFileName.includes('.')) {
        // Try to get extension from content type
        const mimeType = blob.type;
        if (mimeType.startsWith('image/')) {
          const extension = mimeType.split('/')[1]?.split('+')[0] || 'png';
          downloadFileName = `image.${extension}`;
        } else if (mimeType.startsWith('audio/')) {
          const extension = mimeType.split('/')[1]?.split('+')[0] || 'webm';
          downloadFileName = `audio.${extension}`;
        } else if (mimeType.includes('pdf')) {
          downloadFileName = 'document.pdf';
        } else {
          downloadFileName = 'file';
        }
      }
      
      console.log('📥 Downloading as:', downloadFileName);
      
      // Create download link
    const link = document.createElement('a');
      link.href = objectUrl;
      link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
      
      // Clean up
      setTimeout(() => {
    document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }, 100);
      
      console.log('✅ Download initiated successfully');
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  }, []);

  // Handle audio playback - useRef to store audio elements
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const handlePlayAudio = useCallback((audioUrl: string, messageId: string) => {
    console.log('🎤 handlePlayAudio called:', { audioUrl, messageId });
    
    // Get or create audio element
    let audioElement = audioRefs.current.get(messageId);
    
    if (!audioElement) {
      console.log('🎤 Creating new audio element');
      audioElement = new Audio(audioUrl);
      
      // Handle when audio ends
      audioElement.addEventListener('ended', () => {
        console.log('🎤 Audio ended');
        setPlayingAudioId(null);
      });
      
      // Handle when audio is paused
      audioElement.addEventListener('pause', () => {
        console.log('🎤 Audio paused');
        setPlayingAudioId(null);
      });
      
      // Handle when audio starts playing
      audioElement.addEventListener('play', () => {
        console.log('🎤 Audio playing');
        setPlayingAudioId(messageId);
        setLoadingAudioId(null);
      });
      
      // Handle audio loading
      audioElement.addEventListener('loadstart', () => {
        console.log('🎤 Audio loading started');
        setLoadingAudioId(messageId);
      });
      
      audioElement.addEventListener('canplay', () => {
        console.log('🎤 Audio can play');
        setLoadingAudioId(null);
      });
      
      audioElement.addEventListener('error', (e) => {
        console.error('🎤 Audio error:', e);
        console.error('🎤 Audio error code:', audioElement.error);
        console.error('🎤 Audio URL:', audioUrl);
        if (audioElement.error) {
          console.error('🎤 Error details:', {
            code: audioElement.error.code,
            message: audioElement.error.message
          });
        }
        setLoadingAudioId(null);
      });
      
      audioRefs.current.set(messageId, audioElement);
    }
    
    // Toggle play/pause
    if (audioElement.paused) {
      console.log('🎤 Starting audio playback');
      // Stop any other playing audio
      if (playingAudioId && playingAudioId !== messageId) {
        const otherAudio = audioRefs.current.get(playingAudioId);
        if (otherAudio) {
          otherAudio.pause();
          otherAudio.currentTime = 0;
        }
      }
      
      audioElement.play()
        .then(() => {
          console.log('✅ Audio playback started successfully');
        })
        .catch(error => {
          console.error('❌ Error playing audio:', error);
          console.error('❌ Failed URL:', audioUrl);
        });
    } else {
      console.log('🎤 Pausing audio');
      audioElement.pause();
      setPlayingAudioId(null);
    }
  }, [playingAudioId]);

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
    const currentUserRole = auth?.user?.role;
    const isAdmin = currentUserRole === 'ADMIN';
    
    // Check if sender is admin (for backoffice users)
    const isSenderAdmin = msg.sender === 'admin' || msg.sender === 'ADMIN';
    const isCurrentUserSender = msg.sender === currentUserId;
    
    console.log('🔍 DEBUG - Message analysis:', {
      messagePreview: msg.message.substring(0, 30),
      sender: `"${msg.sender}"`,
      reciver: `"${msg.reciver}"`,
      currentUserId: `"${currentUserId}"`,
      currentUserRole: `"${currentUserRole}"`,
      isAdmin,
      isSenderAdmin,
      isCurrentUserSender,
      hasAttachment: !!msg.attachment
    });
    
    // If current user is admin and sender is admin, it's our message (goes RIGHT)
    if (isAdmin && isSenderAdmin) {
      console.log('✅ Going RIGHT - Admin sent this message');
      return true;
    }
    
    // If current user is the sender by ID, it's our message (goes RIGHT)
    if (isCurrentUserSender) {
      console.log('✅ Going RIGHT - Current user is sender');
      return true;
    }
    
    // Default: message from user (goes LEFT)
    console.log('✅ Going LEFT - Message from someone else');
    return false;
  }, [auth?.user?._id, auth?.user?.role]);

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
      } else if (userAccountType === 'GUEST' || userAccountType === 'guest') {
        // Show guest users in the guest tab
        matchesType = clientType.id === 'guest';
        console.log(`Type is ${userAccountType}, matches guest tab: ${matchesType}`);
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
    console.log('🔍 Is guest chat:', (chat as any).isGuestChat);
    
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
    
    // For guest chats, we don't need to mark messages as read via API
    if (!(chat as any).isGuestChat) {
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
    } else {
      console.log('🔍 Guest chat selected - no need to mark messages as read');
      // Still trigger badge refresh for consistency
      window.dispatchEvent(new CustomEvent('refreshAdminNotifications'));
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <OnlineIcon sx={{ fontSize: 12, color: '#4CAF50' }} />
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {user?.AccountType} • En ligne
                  </Typography>
                  {user?.phone && (
                    <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 700, fontSize: '0.9rem' }}>
                      📞 {user.phone}
                    </Typography>
                  )}
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
                          {/* Display attachment or text message */}
                          {msg.attachment && msg.attachment.url && msg.attachment.name ? (
                            <>
                              {(() => {
                                console.log('📎 ChatLayout rendering attachment:', msg.attachment);
                                return null;
                              })()}
                              {msg.attachment.type?.startsWith('audio/') || msg.attachment.name?.includes('voice') ? (
                                // Display voice message with play button
                                (() => {
                                  // Get the audio URL - it might already be a full URL from the server
                                  let audioUrl = msg.attachment.url || '';
                                  
                                  // If it's a relative URL, make it absolute
                                  if (audioUrl.startsWith('/static/')) {
                                    // const apiUrl = typeof window !== 'undefined' && window.location ? 
                                    //   `${window.location.protocol}//${window.location.hostname}:3000` : 
                                    //   'http://localhost:3000';
                                    const apiUrl = resolveBrowserBaseUrl();
                                    audioUrl = `${apiUrl}${audioUrl}`;
                                  }
                                  
                                  // If it's already a full URL, use it as is
                                  const isPlaying = playingAudioId === msg._id;
                                  const isLoading = loadingAudioId === msg._id;
                                  console.log('🎤 Voice message - Original URL:', msg.attachment.url);
                                  console.log('🎤 Voice message - Processed URL:', audioUrl);
                                  console.log('🎤 Voice message - Is playing:', isPlaying);
                                  console.log('🎤 Voice message - Is loading:', isLoading);
                                  return (
                                    <Box sx={{ mb: 1 }}>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1.5,
                                          bgcolor: alpha(isOwnMessage(msg) ? theme.palette.primary.dark : theme.palette.grey[300], 0.2),
                                          border: `1px solid ${alpha(isOwnMessage(msg) ? theme.palette.primary.contrastText : theme.palette.primary.main, 0.2)}`,
                                          borderRadius: 3,
                                          p: 1.5,
                                          minWidth: 0,
                                          maxWidth: '100%'
                                        }}
                                      >
                                        {/* Play/Pause Button */}
                                        <IconButton
                                          onClick={() => handlePlayAudio(audioUrl, msg._id)}
                                          disabled={isLoading}
                                          size="medium"
                                          sx={{
                                            color: isOwnMessage(msg) 
                                              ? theme.palette.primary.contrastText 
                                              : theme.palette.primary.main,
                                            bgcolor: alpha(isOwnMessage(msg) 
                                              ? theme.palette.primary.contrastText 
                                              : theme.palette.primary.main, 0.1),
                                            width: 40,
                                            height: 40,
                                            flexShrink: 0,
                                            '&:hover': {
                                              bgcolor: alpha(isOwnMessage(msg) 
                                                ? theme.palette.primary.contrastText 
                                                : theme.palette.primary.main, 0.2),
                                            },
                                            '&:disabled': {
                                              opacity: 0.6
                                            }
                                          }}
                                        >
                                          {isLoading ? (
                                            <CircularProgress size={20} sx={{ color: 'inherit' }} />
                                          ) : isPlaying ? (
                                            <PauseIcon sx={{ fontSize: 20 }} />
                                          ) : (
                                            <PlayArrowIcon sx={{ fontSize: 20 }} />
                                          )}
                                        </IconButton>
                                        
                                        {/* Audio Info */}
                                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <MicIcon 
                                            sx={{ 
                                              fontSize: 18,
                                              color: isOwnMessage(msg) 
                                                ? theme.palette.primary.contrastText 
                                                : theme.palette.primary.main,
                                              opacity: 0.7,
                                              flexShrink: 0
                                            }} 
                                          />
                                          <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                            <Typography 
                                              variant="body2" 
                                              sx={{ 
                                                fontWeight: 500,
                                                fontSize: '0.875rem',
                                                color: isOwnMessage(msg) 
                                                  ? theme.palette.primary.contrastText 
                                                  : 'text.primary',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                              }}
                                            >
                                              {msg.attachment.name || 'Voice message'}
                                            </Typography>
                                            <Typography 
                                              variant="caption" 
                                              sx={{ 
                                                opacity: 0.6,
                                                color: isOwnMessage(msg) 
                                                  ? theme.palette.primary.contrastText 
                                                  : 'text.secondary',
                                                fontSize: '0.7rem',
                                                display: 'block'
                                              }}
                                            >
                                              Audio • {Math.round((msg.attachment.size || 0) / 1024)} KB
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Box>
                                    </Box>
                                  );
                                })()
                              ) : msg.attachment.type?.startsWith('image/') ? (
                                // Display image with click to view and download options
                                <Box sx={{ mb: 1 }}>
                                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                                    <img
                                      src={msg.attachment.url}
                                      alt={msg.attachment.name || 'Attachment'}
                                      style={{
                                        width: '100%',
                                        maxWidth: '300px',
                                        height: 'auto',
                                        cursor: 'pointer',
                                        display: 'block',
                                        borderRadius: '8px'
                                      }}
                                      onClick={() => handleImageClick(msg.attachment.url, msg.attachment.name)}
                                    />
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        bottom: 8,
                                        right: 8,
                                        display: 'flex',
                                        gap: 1,
                                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                                        borderRadius: 1,
                                        p: 0.5
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleImageClick(msg.attachment.url, msg.attachment.name);
                                        }}
                                        sx={{ color: 'white' }}
                                      >
                                        <ImageIcon fontSize="small" />
                                      </IconButton>
                                      {msg.attachment?.url && (
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                            console.log('📎 Image download clicked - full message:', msg);
                                            console.log('📎 Image download clicked - attachment data:', msg.attachment);
                                            console.log('📎 Image download clicked - attachment URL:', msg.attachment?.url);
                                            console.log('📎 Image download clicked - attachment name:', msg.attachment?.name);
                                            
                                          handleDownloadImage(msg.attachment.url, msg.attachment.name);
                                        }}
                                        sx={{ color: 'white' }}
                                      >
                                        <DownloadIcon fontSize="small" />
                                      </IconButton>
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                              ) : (
                                // Display file attachment
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    bgcolor: alpha(isOwnMessage(msg) ? theme.palette.primary.dark : theme.palette.grey[300], 0.2),
                                    border: `1px solid ${alpha(isOwnMessage(msg) ? theme.palette.primary.contrastText : theme.palette.primary.main, 0.2)}`,
                                    borderRadius: 2,
                                    p: 1.5,
                                    mb: 1,
                                    minWidth: 0,
                                    maxWidth: '100%'
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 40,
                                      height: 40,
                                      borderRadius: 1.5,
                                      bgcolor: alpha(isOwnMessage(msg) ? theme.palette.primary.contrastText : theme.palette.primary.main, 0.15),
                                      flexShrink: 0
                                    }}
                                  >
                                    <AttachFileIcon 
                                      sx={{ 
                                        fontSize: 20,
                                        color: isOwnMessage(msg) 
                                          ? theme.palette.primary.contrastText 
                                          : theme.palette.primary.main
                                      }} 
                                    />
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        color: isOwnMessage(msg) 
                                          ? theme.palette.primary.contrastText 
                                          : 'text.primary',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {msg.attachment.name}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        opacity: 0.6,
                                        color: isOwnMessage(msg) 
                                          ? theme.palette.primary.contrastText 
                                          : 'text.secondary',
                                        fontSize: '0.7rem'
                                      }}
                                    >
                                      File • {Math.round((msg.attachment.size || 0) / 1024)} KB
                                    </Typography>
                                  </Box>
                                  {msg.attachment?.url && (
                                  <IconButton
                                    size="small"
                                      onClick={() => {
                                        console.log('📎 File download clicked - full message:', msg);
                                        console.log('📎 File download clicked - attachment data:', msg.attachment);
                                        console.log('📎 File download clicked - attachment URL:', msg.attachment?.url);
                                        console.log('📎 File download clicked - attachment name:', msg.attachment?.name);
                                        
                                        handleDownloadImage(msg.attachment.url, msg.attachment.name);
                                      }}
                                      sx={{
                                        color: isOwnMessage(msg) 
                                          ? theme.palette.primary.contrastText 
                                          : theme.palette.primary.main,
                                        flexShrink: 0
                                      }}
                                    >
                                      <DownloadIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                  )}
                                </Box>
                              )}
                              {/* Show text message only if it's not just the file name */}
                              {msg.message && msg.message.trim() && !msg.message.startsWith('📎') && (
                                <Typography variant="body1" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                                  {msg.message}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="body1" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                              {msg.message}
                            </Typography>
                          )}
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
            {/* File Preview */}
            {selectedFile && (
              <Box sx={{ mb: 2 }}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <AttachFileIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatFileSize(selectedFile.size)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={sendAttachment}
                        disabled={isUploading}
                        sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}
                      >
                        {isUploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SendIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={removeSelectedFile}
                        sx={{ bgcolor: theme.palette.error.main, color: 'white' }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Voice Preview */}
            {audioUrl && (
              <Box sx={{ mb: 2 }}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05), border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MicIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
                    <audio src={audioUrl} controls style={{ flex: 1, height: 40 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={sendVoiceMessage}
                        sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}
                      >
                        <SendIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setAudioUrl('');
                          setAudioBlob(null);
                          if (audioUrl) URL.revokeObjectURL(audioUrl);
                        }}
                        sx={{ bgcolor: theme.palette.error.main, color: 'white' }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.doc,.docx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              {/* Attachment button */}
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                  borderRadius: 2,
                }}
              >
                <AttachFileIcon />
              </IconButton>

              {/* Voice message button */}
              {!audioUrl && (
                <IconButton
                  onClick={() => {
                    if (isRecording) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                  sx={{
                    bgcolor: isRecording ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.secondary.main, 0.1),
                    color: isRecording ? theme.palette.error.main : theme.palette.secondary.main,
                    '&:hover': {
                      bgcolor: isRecording ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.secondary.main, 0.2),
                    },
                    borderRadius: 2,
                    animation: isRecording ? 'pulse 1s infinite' : 'none',
                  }}
                >
                  <MicIcon />
                </IconButton>
              )}

              <style>{`
                @keyframes pulse {
                  0%, 100% {
                    opacity: 1;
                  }
                  50% {
                    opacity: 0.5;
                  }
                }
              `}</style>

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
                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {user.email && (
                                              <Typography variant="caption" color="text.secondary">
                                                {user.email}
                                              </Typography>
                                            )}
                                            {user.phone && (
                                              <Typography variant="body2" sx={{ color: type.color, fontWeight: 700, fontSize: '0.85rem' }}>
                                                📞 {user.phone}
                                              </Typography>
                                            )}
                                          </Box>
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

      {/* Image Modal - Similar to FloatingAdminChat */}
      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onClose={handleCloseImage}
          maxWidth={false}
          PaperProps={{
            sx: {
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              borderRadius: 0,
              overflow: 'hidden',
              position: 'relative',
              width: '100vw',
              height: '100vh',
              maxWidth: '100vw',
              maxHeight: '100vh',
              margin: 0
            }
          }}
        >
          <DialogContent 
            sx={{ 
              p: 0, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: '100%',
              height: '100%',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={handleCloseImage}
          >
            <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: '8px',
                  objectFit: 'contain',
                  cursor: 'pointer',
                  display: 'block'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Open in browser on single click
                  window.open(selectedImage.url, '_blank');
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDownloadImage(selectedImage.url, selectedImage.name);
                }}
                onError={(e) => {
                  console.error('❌ Failed to load image in modal:', selectedImage.url);
                  // Try to construct absolute URL if relative
                  const img = e.target as HTMLImageElement;
                  if (selectedImage.url.startsWith('/static/')) {
                    // const absoluteUrl = `http://localhost:3000${selectedImage.url}`;
                    const absoluteUrl = `${resolveBrowserBaseUrl()}${selectedImage.url}`;
                    console.log('🔄 Trying absolute URL:', absoluteUrl);
                    img.src = absoluteUrl;
                  }
                }}
                onLoad={() => {
                  console.log('✅ Image loaded successfully in modal:', selectedImage.url);
                }}
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseImage();
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  zIndex: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadImage(selectedImage.url, selectedImage.name);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 56,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  zIndex: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
                title="Download"
              >
                <DownloadIcon />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(selectedImage.url, '_blank');
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 104,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  zIndex: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
                title="Open in browser"
              >
                <ImageIcon />
              </IconButton>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Page>
  );
}