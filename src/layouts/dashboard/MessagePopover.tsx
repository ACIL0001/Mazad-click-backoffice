import { useRef, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  ListSubheader,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { debounce } from 'lodash';
import MenuPopover from '../../components/MenuPopover';
import Iconify from '../../components/Iconify';
import { ChatAPI } from '../../api/Chat';
import { MessageAPI } from '../../api/message';
import { SocketContext } from '../../contexts/SocketContext';
import useAuth from '../../hooks/useAuth';
import { fToNow } from '../../utils/formatTime';

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

  // Real-time updates via socket
  useEffect(() => {
    if (!socketContext?.socket) return;

    const handleNewMessage = (payload: any) => {
      console.log('🔔 MessagePopover received real-time socket event:', payload);
      // Use debounced fetch
      fetchChatsDebounced();
    };

    // Listen for various message and read status events
    socketContext.socket.on('adminMessage', handleNewMessage);
    socketContext.socket.on('messageReceived', handleNewMessage);
    socketContext.socket.on('newMessage', handleNewMessage);
    socketContext.socket.on('sendMessage', handleNewMessage);
    socketContext.socket.on('chatMessageUpdate', handleNewMessage);
    socketContext.socket.on('messageRead', handleNewMessage);
    socketContext.socket.on('messagesMarkedAsRead', handleNewMessage);
    socketContext.socket.on('adminMessagesMarkedAsRead', handleNewMessage);

    return () => {
      if (socketContext?.socket) {
        socketContext.socket.off('adminMessage', handleNewMessage);
        socketContext.socket.off('messageReceived', handleNewMessage);
        socketContext.socket.off('newMessage', handleNewMessage);
        socketContext.socket.off('sendMessage', handleNewMessage);
        socketContext.socket.off('chatMessageUpdate', handleNewMessage);
        socketContext.socket.off('messageRead', handleNewMessage);
        socketContext.socket.off('messagesMarkedAsRead', handleNewMessage);
        socketContext.socket.off('adminMessagesMarkedAsRead', handleNewMessage);
      }
      fetchChatsDebounced.cancel(); // Cancel any pending debounce on cleanup
    };
  }, [socketContext?.socket, fetchChatsDebounced]);

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

  const handleMarkAllAsRead = async () => {
    try {
      const unreadChats = chats.filter(chat => chat.unreadCount > 0);
      if (unreadChats.length === 0) return;

      await Promise.all(unreadChats.map(chat => MessageAPI.markAllAsRead(chat._id)));
      
      // Update state locally
      setChats(prev => prev.map(chat => ({ ...chat, unreadCount: 0 })));
      setUnreadCount(0);
      
      // Notify via socket so other tabs or the chat page can update
      if (socketContext?.socket) {
        socketContext.socket.emit('adminMessagesMarkedAsRead', { adminId: auth?.user?._id });
      }
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
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

  const unreadChats = chats.filter(chat => chat.unreadCount > 0);
  const readChats = chats.filter(chat => !chat.unreadCount || chat.unreadCount === 0);

  const renderChatItem = (chat: any) => {
    const isUnread = chat.unreadCount > 0;
    return (
      <ListItemButton
        key={chat._id}
        onClick={() => handleSelectChat(chat._id)}
        sx={{
          py: 1.5,
          px: 2.5,
          mt: '1px',
          transition: 'all 0.25s ease-in-out',
          ...(isUnread ? {
            bgcolor: 'action.selected',
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            }
          } : {
            '&:hover': {
              bgcolor: 'action.hover',
            }
          })
        }}
      >
        <ListItemAvatar>
          <Avatar src={getChatAvatar(chat)} alt={getChatName(chat)}>
            {getChatName(chat).charAt(0)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle2" component="span" sx={{ fontWeight: isUnread ? 700 : 500 }}>
              {getChatName(chat)}
            </Typography>
          }
          secondary={
            <Typography
              component="span"
              variant="caption"
              sx={{
                display: 'block',
                color: isUnread ? 'text.primary' : 'text.secondary',
                fontWeight: isUnread ? 600 : 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mt: 0.5,
              }}
            >
              {chat.lastMessage?.message || 'Aucun message'}
            </Typography>
          }
        />
        <Box sx={{ ml: 1, textAlign: 'right' }}>
          <Typography variant="caption" sx={{ display: 'block', color: isUnread ? 'primary.main' : 'text.disabled', fontWeight: isUnread ? 600 : 400, mb: 0.5 }}>
            {fToNow(chat.lastMessage?.createdAt || chat.createdAt)}
          </Typography>
          {isUnread && (
            <Badge color="error" badgeContent={chat.unreadCount} />
          )}
        </Box>
      </ListItemButton>
    );
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
          width: 320,
          p: 0,
          borderRadius: '16px',
          boxShadow: (theme) => `0 12px 40px 0 ${alpha(theme.palette.common.black, 0.12)}, 0 1px 3px 0 ${alpha(theme.palette.common.black, 0.05)}`,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(20px)',
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.98),
          overflow: 'hidden',
          '& .MuiList-root': {
            p: 0
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Messages</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Vous avez {unreadCount} nouveau(x) message(s)
            </Typography>
          </Box>
          
          {unreadCount > 0 && (
            <Tooltip title="Marquer tout comme lu">
              <IconButton color="primary" onClick={handleMarkAllAsRead} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}>
                <Iconify icon="eva:done-all-fill" width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ 
          maxHeight: { xs: 260, sm: 320 },
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.grey[600], 0.4),
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: (theme) => alpha(theme.palette.grey[600], 0.65),
          },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}>
          {chats.length === 0 ? (
             <Box sx={{ p: 5, textAlign: 'center' }}>
               <Iconify icon="eva:message-square-outline" width={48} height={48} sx={{ color: 'text.disabled', mb: 1, mx: 'auto' }} />
               <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                 Aucune conversation
               </Typography>
             </Box>
          ) : (
            <>
              {unreadChats.length > 0 && (
                <List
                  disablePadding
                  subheader={
                    <ListSubheader 
                      disableSticky 
                      sx={{ 
                        py: 1, 
                        px: 2.5, 
                        typography: 'overline',
                        bgcolor: 'background.paper',
                        color: 'text.secondary',
                        fontWeight: 700,
                        zIndex: 1
                      }}
                    >
                      Nouveau
                    </ListSubheader>
                  }
                >
                  {unreadChats.map((chat) => renderChatItem(chat))}
                </List>
              )}

              {readChats.length > 0 && (
                <List
                  disablePadding
                  subheader={
                    <ListSubheader 
                      disableSticky 
                      sx={{ 
                        py: 1, 
                        px: 2.5, 
                        typography: 'overline',
                        bgcolor: 'background.paper',
                        color: 'text.disabled',
                        fontWeight: 700,
                        zIndex: 1
                      }}
                    >
                      Anciens messages
                    </ListSubheader>
                  }
                >
                  {readChats.map((chat) => renderChatItem(chat))}
                </List>
              )}
            </>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button 
            fullWidth 
            component={RouterLink}
            to="/dashboard/chat"
            onClick={handleClose}
            variant="text"
            color="primary"
            sx={{ py: 1, fontWeight: 700, borderRadius: 1.5 }}
          >
            Voir tout
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}
