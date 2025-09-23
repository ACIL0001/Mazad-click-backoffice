import { useState, useEffect } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { CircularProgress, Box, Typography } from '@mui/material';
//
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import OnlineSidebar from './OnlineSidebar';
import useAuth from '@/hooks/useAuth';
// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

const LoadingStyle = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  gap: 16
});

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const navigate = useNavigate();
  const { isLogged, isReady, auth, initializeAuth } = useAuth();

  // Initialize auth on component mount
  useEffect(() => {
    if (!isReady) {
      console.log('DashboardLayout: Initializing auth...');
      initializeAuth();
    }
  }, [isReady, initializeAuth]);

  // Handle authentication check
  useEffect(() => {
    console.log('DashboardLayout - isReady:', isReady, 'isLogged:', isLogged, 'auth:', auth);
    
    if (isReady) {
      if (!isLogged || !auth?.user) {
        console.log('User not authenticated, redirecting to login');
        // Add a small delay to prevent race conditions during login
        const timer = setTimeout(() => {
          navigate("/login", { replace: true });
        }, 100);
        
        return () => clearTimeout(timer);
      } else {
        console.log('User authenticated, allowing dashboard access');
      }
    }
  }, [isReady, isLogged, auth?.user, navigate]);

  // Show loading while auth is being initialized
  if (!isReady) {
    return (
      <LoadingStyle>
        <CircularProgress size={40} />
        <Typography variant="body1" color="textSecondary">
          Initialisation...
        </Typography>
      </LoadingStyle>
    );
  }

  // If ready but not logged in, let the useEffect handle the redirect
  // Show loading briefly to prevent flash of content
  if (isReady && !isLogged) {
    return (
      <LoadingStyle>
        <CircularProgress size={40} />
        <Typography variant="body1" color="textSecondary">
          Vérification de l'authentification...
        </Typography>
      </LoadingStyle>
    );
  }

  // Only render dashboard if user is authenticated
  if (!auth?.user) {
    return null; // This prevents flash of dashboard content
  }

  return (
    <RootStyle>
      <DashboardNavbar 
        onOpenSidebar={() => setOpen(true)} 
        onOpenRightSidebar={() => setOpenRight(true)}
      />
      <DashboardSidebar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
      <MainStyle>
        <Outlet />
      </MainStyle>
      <OnlineSidebar isOpenSidebar={openRight} onCloseSidebar={() => setOpenRight(false)} />
    </RootStyle>
  );
}