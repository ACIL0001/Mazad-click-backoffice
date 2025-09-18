import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

interface RequirePhoneVerificationProps {
  children: ReactNode;
}

interface UserWithIdentityStatus {
  _id: string;
  type: string;
  isHasIdentity?: boolean; 
  isPhoneVerified?: boolean;
  [key: string]: any; 
}

export default function RequirePhoneVerification({ children }: RequirePhoneVerificationProps) {
  const { auth, refreshUserData } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<{ to: string } | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Check for both token structures - auth.tokens or auth.session
        const hasTokens = auth?.tokens?.accessToken || auth?.session?.accessToken;
        
        // Check if user is authenticated before making API calls
        if (!auth?.user?._id || !hasTokens) {
          console.log('RequirePhoneVerification: User not authenticated, skipping checks');
          console.log('RequirePhoneVerification: Auth state:', { 
            user: auth?.user, 
            tokens: auth?.tokens, 
            session: auth?.session 
          });
          setIsChecking(false);
          return;
        }

        const userToCheck = auth.user as UserWithIdentityStatus;
        console.log('RequirePhoneVerification: Using existing user data:', userToCheck);
        console.log('RequirePhoneVerification: User type:', userToCheck.type, 'Phone verified:', userToCheck.isPhoneVerified);
        
        // Admin and Sous Admin users should have immediate access
        if (userToCheck && (userToCheck.type === 'ADMIN' || userToCheck.type === 'SOUS_ADMIN')) {
          console.log('RequirePhoneVerification: Admin/Sous Admin user detected, allowing immediate access');
          setShouldRedirect(null);
          setIsChecking(false);
          return;
        }
        
        if (userToCheck && userToCheck.type === 'PROFESSIONAL') {
          if (!userToCheck.isHasIdentity) {
            setShouldRedirect({ to: '/identity-verification' });
            return;
          }
          
          if (userToCheck.isHasIdentity) {
            // Check subscription status for users who have uploaded identity documents
            try {
              const { SubscriptionAPI } = await import('@/api/subscription');
              const subscriptionData = await SubscriptionAPI.getMySubscription();
              
              console.log('RequirePhoneVerification: Subscription data:', subscriptionData);
              
              // Check if user has an ACTIVE subscription (not just any subscription)
              if (!subscriptionData || !subscriptionData.hasActiveSubscription) {
                console.log('RequirePhoneVerification: No active subscription, redirecting to subscription plans');
                setShouldRedirect({ to: '/subscription-plans' });
                return;
              }
              
              console.log('RequirePhoneVerification: User has active subscription, allowing dashboard access');
            } catch (error) {
              console.error('Error checking subscription status in RequirePhoneVerification:', error);
              // If subscription check fails, redirect to subscription plans to be safe
              console.log('RequirePhoneVerification: Subscription check failed, redirecting to subscription plans');
              setShouldRedirect({ to: '/subscription-plans' });
              return;
            }
          }
        }
        
        // Additional phone verification check - using explicit false check for better type safety
        if (userToCheck && userToCheck.isPhoneVerified === false) {
          console.log('RequirePhoneVerification: Phone not verified, redirecting to phone verification');
          setShouldRedirect({ to: '/phone-verification' });
          return;
        }
        
        // User has subscription or not a professional, allow access
        console.log('RequirePhoneVerification: All checks passed, allowing access');
        setShouldRedirect(null);
      } catch (error) {
        console.error('Error checking user status in RequirePhoneVerification:', error);
        // On error, allow access to prevent blocking the user
        console.log('RequirePhoneVerification: Error occurred, allowing access to prevent blocking user');
        setShouldRedirect(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, [auth?.user, auth?.tokens, auth?.session]); // Watch both token structures

  // Show loading while checking user status
  if (isChecking) {
    console.log('RequirePhoneVerification: Still checking, showing loading...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect if needed
  if (shouldRedirect) {
    console.log('RequirePhoneVerification: Redirecting to:', shouldRedirect.to);
    return <Navigate to={shouldRedirect.to} replace />;
  }

  // Allow access to children
  console.log('RequirePhoneVerification: Allowing access to protected route');
  return <>{children}</>;
}