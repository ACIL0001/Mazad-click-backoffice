import { useRef, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  Badge,
  Avatar,
  Divider,
  Typography,
  IconButton,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { debounce } from 'lodash';
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import Iconify from '../../components/Iconify';
import { ChatAPI } from '../../api/Chat';
import { SocketContext } from '../../contexts/SocketContext';
import useAuth from '../../hooks/useAuth';
import { fToNow } from '../../utils/formatTime';
import { isValidToken } from '../../utils/jwt';

// ----------------------------------------------------------------------

export default function MessagePopover() {
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const { auth, isReady } = useAuth();
  const socketContext = useContext(SocketContext);

  const [open, setOpen] = useState(null);
  const [chats, setChats] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchChats = async () => {
    // strict check for token and auth readiness
    if (!isReady || !auth?.tokens?.accessToken) {
        return;
    }

    try {
      // Use getAdminChats to get all chats with unread counts
      let data = await ChatAPI.getAdminChats();
      
      // Data format validation
      if (!Array.isArray(data)) {
        // Fallback for different API response structures
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else {
          console.error('Invalid chats data format:', data);
          data = [];
        }
      }

      // Sort by last message time (newest first) and unread status
      const sortedChats = data.sort((a: any, b: any) => {
        const dateA = new Date(a.lastMessage?.createdAt || a.createdAt).getTime();
        const dateB = new Date(b.lastMessage?.createdAt || b.createdAt).getTime();
        return dateB - dateA;
      });

      setChats(sortedChats);
      
      // Calculate total unread count
      const count = sortedChats.reduce((acc: number, chat: any) => {
        return acc + (chat.unreadCount || 0);
      }, 0);
      setUnreadCount(count);

    } catch (error: any) {
      // Silence 401 errors as they are handled by the global interceptor (logout/refresh)
      if (error.response?.status === 401) return;
      console.error('Error fetching chats for popover:', error);
    }
  };

  // Debounced fetch to prevent 429 errors from rapid socket events
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchChatsDebounced = useCallback(
    debounce(() => {
      fetchChats();
    }, 1000), // Wait 1s after last event before fetching
    [auth?.tokens?.accessToken] // Re-create if token changes
  );

  // Fetch chats on mount and when auth changes
  useEffect(() => {
    if (isReady && auth?.user?._id && auth?.tokens?.accessToken) {
      fetchChats();
    }
  }, [isReady, auth?.user?._id, auth?.tokens?.accessToken]);

  // Real-time updates via socket - COMMENTED OUT TO PREVENT INTERFERENCE
  /*
  useEffect(() => {
    if (!socketContext?.socket) return;

    const handleNewMessage = (payload: any) => {
      console.log('🔔 MessagePopover received new message:', payload);
      // Use debounced fetch
      fetchChatsDebounced();
    };

    // Listen for various message events
    socketContext.socket.on('adminMessage', handleNewMessage);
    socketContext.socket.on('messageReceived', handleNewMessage);
    socketContext.socket.on('newMessage', handleNewMessage);
    socketContext.socket.on('sendMessage', handleNewMessage); // For self-sent messages

    return () => {
      socketContext.socket.off('adminMessage', handleNewMessage);
      socketContext.socket.off('messageReceived', handleNewMessage);
      socketContext.socket.off('newMessage', handleNewMessage);
      socketContext.socket.off('sendMessage', handleNewMessage);
      fetchChatsDebounced.cancel(); // Cancel any pending debounce on cleanup
    };
  }, [socketContext?.socket, fetchChatsDebounced]);
  */

  const handleOpen = (event: any) => {
    setOpen(event.currentTarget);
    fetchChats(); // Refresh when opening
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleSelectChat = (chatId: string) => {
    handleClose();
    // Navigate to ChatLayout with specific chat selected
    // Pass chatId in state so ChatLayout can pick it up
    navigate('/dashboard/chat', { state: { chatId } });
  };

  const getChatName = (chat: any) => {
    const isGuestChat = chat.users.some((u: any) => u._id === 'guest');
    if (isGuestChat && chat.lastMessage?.guestName) {
      return chat.lastMessage.guestName;
    }

    // Find the other user (not admin)
    const otherUser = chat.users.find((u: any) => u._id !== 'admin' && u.AccountType !== 'admin' && u._id !== auth?.user?._id);
    if (otherUser) {
      return `${otherUser.firstName} ${otherUser.lastName}`;
    }
    
    // Fallback if no specific other user found
    return "Utilisateur inconnu";
  };
  
  const getChatAvatar = (chat: any) => {
    const isGuestChat = chat.users.some((u: any) => u._id === 'guest');
    if (isGuestChat) {
      return null; // Will render initials
    }
    
    const otherUser = chat.users.find((u: any) => u._id !== 'admin' && u.AccountType !== 'admin' && u._id !== auth?.user?._id);
    return otherUser?.avatarUrl; // Assuming avatarUrl exists
  };

  return (
    <>
      <Tooltip title="Messages">
        <IconButton
          ref={anchorRef}
          color={open ? 'primary' : 'default'}
          onClick={handleOpen}
          sx={{
            width: 40,
            height: 40,
            ...(open && {
              bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity),
            }),
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <Iconify icon="eva:message-circle-fill" width={24} height={24} />
          </Badge>
        </IconButton>
      </Tooltip>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          mt: 1.5,
          ml: 0.75,
          width: 360,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Messages</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Vous avez {unreadCount} nouveau(x) message(s)
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' }, maxHeight: 400 }}>
          <List disablePadding>
            {chats.length === 0 && (
               <Box sx={{ p: 3, textAlign: 'center' }}>
                 <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                   Aucune conversation
                 </Typography>
               </Box>
            )}
            
            {chats.map((chat) => (
              <ListItemButton
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  ...(chat.unreadCount > 0 && {
                    bgcolor: 'action.selected',
                  }),
                }}
              >
                <ListItemAvatar>
                  <Avatar src={getChatAvatar(chat)} alt={getChatName(chat)}>
                    {getChatName(chat).charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" component="span">
                      {getChatName(chat)}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {chat.lastMessage?.message || 'Aucun message'}
                    </Typography>
                  }
                />
                <Box sx={{ ml: 1, textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', mb: 0.5 }}>
                    {fToNow(chat.lastMessage?.createdAt || chat.createdAt)}
                  </Typography>
                  {chat.unreadCount > 0 && (
                    <Badge color="error" badgeContent={chat.unreadCount} />
                  )}
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <IconButton 
            onClick={() => navigate('/dashboard/chat')}
            sx={{ width: '100%', borderRadius: 1, typography: 'button' }}
          >
            Voir tout
          </IconButton>
        </Box>
      </MenuPopover>
    </>
  );
}
