// Fixed App.tsx 

import './i18n';
// routes
import Router from './routes';
import ThemeProvider from './theme';
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/chart/BaseOptionChart';
import { SnackbarProvider } from 'notistack';
import { AxiosInterceptor } from './api/utils';
import RequestProvider from './contexts/RequestContext';
import SocketProvider from './contexts/SocketContext';
import StatsProvider from './contexts/StatsContext';
import CategoryProvider from './contexts/CategoryContext';
import IdentityProvider from './contexts/IdentityContext'; 
import UserProvider from './contexts/UserContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { useEffect, useState, useCallback, useRef } from 'react';
import useAuth from './hooks/useAuth';
import { hasAdminPrivileges } from './types/Role'; // Import the helper function

// ----------------------------------------------------------------------

export default function App() {
  const { initializeAuth, isLogged, auth, clear } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationAttempted = useRef(false);

  // Memoize the initialization function to prevent unnecessary re-renders
  const initializeApp = useCallback(async () => {
    // Prevent multiple initialization attempts
    if (initializationAttempted.current) {
      return;
    }
    initializationAttempted.current = true;

    try {
      console.log('Initializing auth for port:', window.location.port);
      await initializeAuth();
      
      // Check if user has access to this portal after initialization
      const currentPort = window.location.port;
      const isAdminPortal = currentPort === '3002';
      const isSellerPortal = currentPort === '3003';
      
      if (isLogged && auth?.user) {
        // Use hasAdminPrivileges function for proper ADMIN/SOUS_ADMIN checking
        const userHasAdminAccess = hasAdminPrivileges(auth.user.type) || hasAdminPrivileges(auth.user.accountType);
        const userHasSellerAccess = auth.user.type === 'SELLER' || auth.user.accountType === 'SELLER';
        
        const hasAccess = (isAdminPortal && userHasAdminAccess) || (isSellerPortal && userHasSellerAccess);
        
        console.log('Portal access check:', {
          currentPort,
          isAdminPortal,
          isSellerPortal,
          userType: auth.user.type,
          accountType: auth.user.accountType,
          userHasAdminAccess,
          userHasSellerAccess,
          hasAccess
        });
        
        if (!hasAccess) {
          console.log('User does not have access to this portal, clearing auth');
          clear();
        }
      }
      
      console.log('Auth initialized successfully');
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [initializeAuth]); // Remove isLogged, auth, clear from dependencies to prevent infinite loops

  useEffect(() => {
    // Only initialize if not already initialized and not attempted
    if (!isInitialized && !initializationAttempted.current) {
      initializeApp();
    }
  }, []); // Empty dependency array to run only once

  // Separate effect to handle portal access validation when auth state changes
  useEffect(() => {
    if (isInitialized && isLogged && auth?.user) {
      const currentPort = window.location.port;
      const isAdminPortal = currentPort === '3002';
      const isSellerPortal = currentPort === '3003';
      
      // Use hasAdminPrivileges function for consistent access checking
      const userHasAdminAccess = hasAdminPrivileges(auth.user.type) || hasAdminPrivileges(auth.user.accountType);
      const userHasSellerAccess = auth.user.type === 'SELLER' || auth.user.accountType === 'SELLER';
      
      const hasAccess = (isAdminPortal && userHasAdminAccess) || (isSellerPortal && userHasSellerAccess);
      
      console.log('Auth state change - portal access check:', {
        currentPort,
        isAdminPortal,
        userType: auth.user.type,
        accountType: auth.user.accountType,
        userHasAdminAccess,
        hasAccess
      });
      
      if (!hasAccess) {
        console.log('User does not have access to this portal after auth change, clearing auth');
        clear();
      }
    }
  }, [isInitialized, isLogged, auth?.user, clear]);

  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif'
      }}>
        Chargement de l'application...
      </div>
    );
  }

  return (
    <ThemeContextProvider>
      <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
        <RequestProvider>
          <SocketProvider>
            <StatsProvider>
              <UserProvider>
                <CategoryProvider>
                  <IdentityProvider>
                    <AxiosInterceptor>
                      <ThemeProvider>
                        <ScrollToTop />
                        <BaseOptionChartStyle />
                        <Router />
                      </ThemeProvider>
                    </AxiosInterceptor>
                  </IdentityProvider>
                </CategoryProvider>
              </UserProvider>
            </StatsProvider>
          </SocketProvider>
        </RequestProvider> 
      </SnackbarProvider>
    </ThemeContextProvider>
  );
}