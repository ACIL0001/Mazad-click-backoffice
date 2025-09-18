import * as PropTypes from 'prop-types'
import { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/material/styles';
// @mui
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  Typography,
  IconButton,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  ListItemButton,
  Link
} from '@mui/material';
// utils
import { fToNow } from '../../utils/formatTime';
// components
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';

// ----------------------------------------------------------------------

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

export enum NotificationType {
  ORDER = "Order",
  ARRIVAL = 'Arrival',
  USER = 'User',
  CATALOG = 'Catalog',
  PRODUCT = 'Product'
}


export enum NotificationAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED'
}

// ----------------------------------------------------------------------

export default function NotificationsPopover({ notifications, onRefresh, loading = false }: any) {

  const lastSeenAt = localStorage.getItem("NotificationSeenAt") || new Date();
  const anchorRef = useRef(null);

  const unread = notifications.filter((n) => new Date(n.createdAt).getTime() > new Date(lastSeenAt).getTime());
  const before = notifications.filter((n) => new Date(n.createdAt).getTime() < new Date(lastSeenAt).getTime());

  const totalUnRead = unread.length;
  const [open, setOpen] = useState(null);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);

  // Track new notifications
  useEffect(() => {
    if (totalUnRead > previousUnreadCount && previousUnreadCount > 0) {
      setHasNewNotifications(true);
      // Reset the flag after 3 seconds
      setTimeout(() => setHasNewNotifications(false), 3000);
    }
    setPreviousUnreadCount(totalUnRead);
  }, [totalUnRead, previousUnreadCount]);


  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
    localStorage.setItem("NotificationSeenAt", new Date().toString());
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };


  return (
    <>
      <IconButton
        ref={anchorRef}
        color={open ? 'primary' : 'default'}
        onClick={handleOpen}
        sx={{ 
          width: 40, 
          height: 40,
          ...(totalUnRead > 0 && {
            animation: `${pulse} 2s ease-in-out infinite`,
          })
        }}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="eva:bell-fill" width={20} height={20} />
        </Badge>
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{ width: 360, p: 0, mt: 1.5, ml: 0.75 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Vous avez {totalUnRead} notifications non lu
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary">
                <Iconify icon="eva:done-all-fill" width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Refresh notifications">
            <IconButton 
              color="default" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <Iconify 
                icon={loading ? "eva:loader-outline" : "eva:refresh-fill"} 
                width={20} 
                height={20}
                sx={loading ? { animation: `${spin} 1s linear infinite` } : {}}
              />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <Iconify icon="eva:loader-outline" width={24} height={24} sx={{ animation: `${spin} 1s linear infinite` }} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Iconify icon="eva:bell-off-outline" width={48} height={48} sx={{ color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Aucune notification
              </Typography>
            </Box>
          ) : (
            <>
              <List
                disablePadding
                subheader={
                  <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                    Nouveau
                  </ListSubheader>
                }
              >
                {unread.map((notification) => (
                  <NotificationItem key={notification._id} notification={notification} />
                ))}
              </List>

              <List
                disablePadding
                subheader={
                  <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                    Avant
                  </ListSubheader>
                }
              >
                {before.map((notification) => (
                  <NotificationItem key={notification._id} notification={notification} />
                ))}
              </List>
            </>
          )}
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple>
            View All
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.instanceOf(Date),
    id: PropTypes.string,
    isUnRead: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    avatar: PropTypes.any,
  }),
};

function NotificationItem({ notification }) {
  const navigate = useNavigate();
  const { avatar, title, description, createdAt, url } = renderContent(notification);

  const body = (
    <Typography variant="subtitle2">
      {title}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {description}
      </Typography>
    </Typography>
  );

  return (
    <ListItemButton
      onClick={() => navigate(`/dashboard/${url}`)}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={body}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} />
            {fToNow(createdAt)}
          </Typography>
        }
      />
    </ListItemButton >
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const { type, action } = notification;

  switch (type + action) {
    case NotificationType.ORDER + NotificationAction.CREATED:
      return {
        ...notification,
        title: 'Vous avez une nouvelle commande',
        description: 'en attente de livraison',
        avatar: <img alt="new order" src="/static/icons/ic_notification_package.svg" />,
        url: "orders"
        //avatar: <img alt={notification.title} src="/static/icons/ic_notification_shipping.svg" />,
        //avatar: <img alt={notification.title} src="/static/icons/ic_notification_chat.svg" />,
      }
    default:
      return {
        title: "",
        description: '',
        url: "app",
        createdAt: new Date()
      }
  }

}
