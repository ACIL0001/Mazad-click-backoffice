import * as PropTypes from 'prop-types';
// material
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton, Badge } from '@mui/material';
// components
import Iconify from '../../components/Iconify';
//
import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
import LanguagePopover from './LanguagePopover';
import NotificationsPopover from './NotificationsPopover';
import LinearLoader from '@/components/LinearLoader';
import ThemeSwitch from '@/components/ThemeSwitch';
import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import useServerStats from '@/hooks/useServerStats';
import { StyledBadge } from './OnlineSidebar';
import { NotificationAPI } from '@/api/notification';
import { useContext } from 'react';
import { SocketContext } from '@/contexts/SocketContext';


const DRAWER_WIDTH = 280;
const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const RootStyle = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', 
  backgroundColor: alpha(theme.palette.background.default, 0.72),
  [theme.breakpoints.up('lg')]: {
    width: `calc(100% - ${DRAWER_WIDTH + 1}px)`,
  },
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
  minHeight: APPBAR_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// FIXED: Made the 'online' property optional to resolve the TypeScript error
interface StatsContextType {
  online?: {
    client: any[];
    restaurant: any[];
    rider: any[];
    admin: any[];
  } | null;
  // Add any other properties that exist on your StatsContextType
}


DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func,
  onOpenRightSidebar: PropTypes.func,
};

function DashboardNavbar({ onOpenSidebar, onOpenRightSidebar }) {
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const { isLogged, auth, isReady } = useAuth();
  const theme = useTheme();
  
  // The use of '?' after 'serverStats' is now more appropriate because 'online' might not exist on the returned object.
  const serverStats: StatsContextType | null = useServerStats();
  const online = serverStats?.online || null;
  
  const socketContext = useContext(SocketContext);

  useEffect(() => {
    // Wait for auth to be ready and user to be logged in with valid tokens
    if (isReady && isLogged && auth?.tokens?.accessToken && auth?.user?._id) {
      console.log('🔐 Auth ready, fetching notifications...');
      getNotifications();
      // Set up polling for notifications every 30 seconds as fallback
      const interval = setInterval(() => {
        getNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      console.log('🔐 Auth not ready yet:', { 
        isReady,
        isLogged, 
        hasToken: !!auth?.tokens?.accessToken, 
        hasUser: !!auth?.user?._id 
      });
    }
  }, [isReady, isLogged, auth?.tokens?.accessToken, auth?.user?._id]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    if (!socketContext?.socket) return;

    const handleNewNotification = (notification: any) => {
      console.log('🔔 Admin received real-time notification:', notification);
      setNotifications(prev => [notification, ...prev]);
    };

    socketContext.socket.on('notification', handleNewNotification);

    return () => {
      socketContext.socket.off('notification', handleNewNotification);
    };
  }, [socketContext?.socket]);

  const getNotifications = async () => {
    // Only fetch if we have a valid auth token and user
    if (!auth?.tokens?.accessToken || !auth?.user?._id) {
      console.log('🔐 Skipping notification fetch - auth not ready:', {
        hasToken: !!auth?.tokens?.accessToken,
        hasUser: !!auth?.user?._id,
        tokenPreview: auth?.tokens?.accessToken ? auth.tokens.accessToken.substring(0, 20) + '...' : 'none',
        userId: auth?.user?._id
      });
      return;
    }

    console.log('🔐 Fetching notifications with valid auth...', {
      tokenPreview: auth.tokens.accessToken.substring(0, 20) + '...',
      userId: auth.user._id,
      userType: auth.user.type
    });
    
    try {
      setNotificationsLoading(true);
      const { data } = await NotificationAPI.getAll();
      const newNotifications = data || [];
      
      // Check if we have new notifications
      if (newNotifications.length > previousNotificationCount && previousNotificationCount > 0) {
        console.log('New notifications received!');
      }
      
      setNotifications(newNotifications);
      setPreviousNotificationCount(newNotifications.length);
      console.log('✅ Notifications fetched successfully:', newNotifications.length);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };



  const handleRefreshNotifications = () => {
    getNotifications();
  };

  // Safe access to online properties with proper null checks
  const totalOnline = online ? (
    (online.client?.length || 0) +
    (online.restaurant?.length || 0) +
    (online.rider?.length || 0) +
    (online.admin?.length || 0)
  ) : 0;

  return (
    <RootStyle>
      <LinearLoader />
      <ToolbarStyle>
        <IconButton onClick={onOpenSidebar} sx={{ mr: 1, color: 'text.primary', display: { lg: 'none' } }}>
          <Iconify icon="eva:menu-2-fill" sx={{}} />
        </IconButton>
        {/* <Searchbar /> */}
        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
          <ThemeSwitch />
          
          <LanguagePopover />

          <NotificationsPopover 
            notifications={notifications} 
            onRefresh={handleRefreshNotifications}
            loading={notificationsLoading}
          />
          <IconButton onClick={onOpenRightSidebar} sx={{ color: 'text.primary' }}>
            <Badge
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              badgeContent={totalOnline}
              color="success"
              max={99}
              sx={{
                marginRight: 1,
                '& .MuiBadge-badge': {
                  backgroundColor: '#fff',
                  color: (theme) => theme.palette.info.main,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Iconify icon="mdi:account-group" width={24} height={24} />
            </Badge>
          </IconButton>
          {isLogged && <AccountPopover />}
        </Stack>
      </ToolbarStyle>
    </RootStyle>
  );
}

export default DashboardNavbar;