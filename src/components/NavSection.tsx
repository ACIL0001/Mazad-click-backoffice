import React, { useEffect, useState, useMemo } from 'react';
import * as PropTypes from 'prop-types';

import { NavLink as RouterLink, matchPath, useLocation } from 'react-router-dom';
// material
import { alpha, useTheme, styled } from '@mui/material/styles';
import {
  Box,
  List,
  Collapse,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Badge,
  Stack,
  Typography,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
//
import Iconify from './Iconify';
import useServerStats from '@/hooks/useServerStats';
import useCategory from '@/hooks/useCategory';
import useIdentity from '@/hooks/useIdentity';
import useUsers from '@/hooks/useUsers';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

// Extend Window interface to include adminNotificationsHook
declare global {
  interface Window {
    adminNotificationsHook?: {
      clearNewNotifications?: () => void;
      forceRefresh?: () => void;
      refreshNotifications?: () => void;
    };
  }
}
import { RoleCode } from '@/types/Role';
import { IdentityStatus } from '@/types/Identity';
import { filterNavItemsByPermissions } from '@/utils/permissions';
import useAuth from '@/hooks/useAuth';
import navConfigData from '@/layouts/dashboard/NavConfig';

// ----------------------------------------------------------------------

const ListItemStyle = styled((props: any) => <ListItemButton disableGutters {...props} />)(({ theme }) => ({
  ...theme.typography.body2,
  height: 48,
  position: 'relative',
  textTransform: 'capitalize',
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    height: 40,
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
}));

const ListItemIconStyle = styled(ListItemIcon)(({ theme }) => ({
  width: 22,
  height: 22,
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('sm')]: {
    width: 20,
    height: 20,
  },
}));

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
  active: PropTypes.func,
};

function NavItem({ item, active }: any ) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isActiveRoot = active(item.path);

  const { title, path, icon, info, children, disabled, inactive } = item;

  const [open, setOpen] = useState(isActiveRoot);

  const handleOpen = () => {
    setOpen((prev: boolean) => !prev);
  };

  const activeRootStyle = {
    color: 'primary.main',
    fontWeight: 'fontWeightMedium',
    bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
  };

  const activeSubStyle = {
    color: 'primary.main',
    fontWeight: 'fontWeightMedium',
    bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
  };

  const inactiveStyle = {
    color: 'text.disabled',
    opacity: 0.5,
    cursor: 'default',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  };

  if (children) {
    return (
      <>
        <ListItemStyle
          onClick={inactive ? undefined : handleOpen}
          sx={{
            ...(isActiveRoot && !inactive && activeSubStyle),
            ...(inactive && inactiveStyle),
          }}
          disabled={disabled || inactive}
        >
          <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
          <ListItemText disableTypography primary={<Typography variant={isMobile ? "body2" : "body1"}>{title}</Typography>} />
          {info && info}
          <Iconify
            icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            sx={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, ml: 1 }} 
          />
        </ListItemStyle>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((childItem: any) => {
              const { title, path, description, disabled, icon, inactive } = childItem;
              const isActiveSub = active(path);

              return (
                  <ListItemStyle
                    key={path}
                  component={inactive ? 'div' : RouterLink}
                  to={inactive ? undefined : path}
                  disabled={disabled || inactive}
                    sx={{
                    ...(isActiveSub && !inactive && activeSubStyle),
                    ...(inactive && inactiveStyle),
                    }}
                  >
                    <ListItemIconStyle>
                    {icon ? (
                      icon
                    ) : (
                      <Box
                        component="span"
                        sx={{
                        width: isMobile ? 3 : 4,
                        height: isMobile ? 3 : 4,
                          display: 'flex',
                          borderRadius: '50%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'text.disabled',
                          transition: (theme) => theme.transitions.create('transform'),
                          ...(isActiveSub && {
                            transform: 'scale(2)',
                            bgcolor: 'primary.main',
                          }),
                        }}
                      />
                    )}
                    </ListItemIconStyle>
                  <Stack gap={isMobile ? '0px' : '0px'}>
                    <ListItemText disableTypography primary={<Typography variant={isMobile ? "body2" : "body1"}>{title}</Typography>} />
                      {description && (
                      <Typography variant={isMobile ? "caption" : "caption"} sx={{ opacity: 1, fontSize: isMobile ? '0.65rem' : 'inherit' }}>
                          {description}
                        </Typography>
                      )}
                    </Stack>
                  </ListItemStyle>
              );
            })}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <ListItemStyle
      component={inactive ? 'div' : RouterLink}
      to={inactive ? undefined : path}
      sx={{
        ...(isActiveRoot && !inactive && activeRootStyle),
        ...(inactive && inactiveStyle),
      }}
      disabled={disabled || inactive}
    >
      <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
      <ListItemText disableTypography primary={<Typography variant={isMobile ? "body2" : "body1"}>{title}</Typography>} />
      {info && info}
    </ListItemStyle>
  );
}

NavSection.propTypes = {
  navConfig: PropTypes.array,
};

export default function NavSection({ ...other }) {
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const { categories, updateCategory } = useCategory();
  const { identities, updateIdentity } = useIdentity();
  const { users, updateAllUsers } = useUsers();
  
  // Safely use the hook with fallback
  let adminNotificationCount = 0;
  let hookResult: any = null;
  let isLoading = false;
  
  try {
    hookResult = useAdminNotifications();
    adminNotificationCount = hookResult?.adminNotificationCount || 0;
    isLoading = hookResult?.loading || false;
    console.log('📊 NavSection - Admin notification count:', adminNotificationCount, 'Loading:', isLoading);
    
    // Expose the hook globally for other components to use
    if (typeof window !== 'undefined') {
    window.adminNotificationsHook = hookResult;
    }
  } catch (error) {
    console.error('Error using useAdminNotifications hook:', error);
    adminNotificationCount = 0;
    isLoading = false;
  }

  // Listen for refresh events from chat page - optimized
  useEffect(() => {
    const handleRefreshNotifications = () => {
      if (hookResult?.forceRefresh) {
        console.log('🔄 Force refreshing admin notifications from chat page');
        hookResult.forceRefresh();
      } else if (hookResult?.refreshNotifications) {
        console.log('🔄 Refreshing admin notifications from chat page');
        hookResult.refreshNotifications();
      }
    };

    // Listen for custom events
    if (typeof window !== 'undefined') {
    window.addEventListener('refreshAdminNotifications', handleRefreshNotifications);
    
    // Also listen for focus events to refresh when user returns to tab
    const handleWindowFocus = () => {
      console.log('🔄 Window focused, refreshing notifications');
      handleRefreshNotifications();
    };
    
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('refreshAdminNotifications', handleRefreshNotifications);
      window.removeEventListener('focus', handleWindowFocus);
    };
    }
  }, [hookResult]);

  const match = (path: string) => (path ? !!matchPath({ path, end: false }, pathname) : false);

  // Memoize getIcon to prevent unnecessary re-renders
  const getIcon = useMemo(() => {
    return (name: string, badgeContent: number | null = null) => {
    if (badgeContent !== null && badgeContent > 0) {
        return (
            <Badge
                badgeContent={isLoading ? '...' : badgeContent}
                color="error"
                max={99}
                sx={{ 
                  marginRight: isMobile ? 0.5 : 1,
                  '& .MuiBadge-badge': {
                    animation: isLoading ? 'pulse 1s infinite' : 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }
                }}
            >
                <Iconify icon={name} width={isMobile ? 20 : 22} height={isMobile ? 20 : 22} />
            </Badge>
        );
    }
    return <Iconify icon={name} width={isMobile ? 20 : 22} height={isMobile ? 20 : 22} />;
  };
  }, [isMobile, isLoading]);

  useEffect(() => {
    updateCategory();
    updateIdentity();
    updateAllUsers();
  }, [updateCategory, updateIdentity, updateAllUsers]);

  // Create enhanced navigation config with dynamic badges and permission filtering
  const enhancedNavConfig = useMemo(() => {
    const baseConfig = [
      {
        title: 'Tableau De Bord',
        path: '/dashboard/app',
        icon: getIcon('typcn:chart-pie'),
      },
      {
        title: 'Utilisateurs',
        path: '/dashboard/users',
        icon: getIcon('mdi:user-online'),
        requiresAdmin: true,
        children: [
          {
            title: 'Clients',
            path: '/dashboard/users/clients',
            icon: getIcon('mdi:account'),
            requiresAdmin: true,
          },
          {
            title: 'Professionals',
            path: '/dashboard/users/professionals',
            icon: getIcon('mdi:account-group'),
            requiresAdmin: true,
          },
          {
            title: 'Resellers',
            path: '/dashboard/users/resellers',
            icon: getIcon('mdi:store'),
            requiresAdmin: true,
          },
        ],
      },
      {
        title: 'Administration',
        path: '/dashboard/admin',
        icon: getIcon('mdi:shield-account'),
        requiresAdmin: true,
        children: [
          {
            title: 'Gestion des Admins',
            path: '/dashboard/admin/management',
            icon: getIcon('mdi:account-cog'),
            adminOnly: true,
          },
          {
            title: 'Profil Admin',
            path: '/dashboard/admin/profile',
            icon: getIcon('mdi:account-circle'),
            requiresAdmin: true,
          },
          {
            title: 'Permissions',
            path: '/dashboard/admin/permissions',
            icon: getIcon('mdi:key'),
            requiresAdmin: true,
          },
        ],
      },
      {
        title: 'Enchères',
        path: '/dashboard/auctions',
        icon: getIcon('mdi:gavel'),
        requiresAdmin: true,
      },
      {
        title: 'Soumissions',
        path: '/dashboard/tenders',
        icon: getIcon('mdi:file-document-outline'),
        requiresAdmin: true,
      },
      {
        title: 'Categories',
        path: '/dashboard/categories',
        icon: getIcon('material-symbols:category'),
        requiresAdmin: true,
      },
      {
        title: 'Abonnements',
        path: '/dashboard/subscription',
        icon: getIcon('mdi:credit-card-multiple'),
        requiresAdmin: true,
      },
      {
        title: 'Conditions Générales',
        path: '/dashboard/terms',
        icon: getIcon('mdi:file-document-outline'),
        requiresAdmin: true,
      },
      {
        title: 'Centre de Communication',
        path: '/dashboard/chat',
        icon: getIcon('material-symbols:chat-bubble'),
        requiresAdmin: true,
      },
      {
        title: 'Identités',
        path: '/dashboard/identities',
        icon: getIcon('ph:user-focus-bold'),
        requiresAdmin: true,
      },
    ];

    // Filter navigation items based on user permissions
    const userRole = user?.type as RoleCode;
    return filterNavItemsByPermissions(baseConfig, userRole);
  }, [user?.type, adminNotificationCount, getIcon]);

  return (
    <Box {...other}>
      <List disablePadding sx={{ p: isMobile ? 0.5 : 1 }}>
        {enhancedNavConfig.map((item) => (
          <NavItem key={item.path} item={item} active={match} />
        ))}
      </List>
    </Box>
  );
}