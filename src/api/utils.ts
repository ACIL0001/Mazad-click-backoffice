import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import app from '@/config';
import useAuth from '@/hooks/useAuth';
import useRequest from '@/hooks/useRequest';
import { hasAdminPrivileges } from '@/types/Role';
import { AuthAPI } from './auth';

// FIXED: Updated LoginResponseData interface to match authStore.ts
interface LoginResponseData {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    type: string;
    accountType: string;
    photoURL?: string;
    phone?: string;
    isPhoneVerified?: boolean;
    [key: string]: any;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    [key: string]: any;
  };
}

const instance = axios.create({
  baseURL: app.baseURL,
  timeout: app.timeout,
  headers: { 'x-access-key': app.apiKey },
  withCredentials: true,
});

const response = (res: AxiosResponse) => res.data;

// FIXED: Updated post method to properly handle FormData
export const requests = {
  get: (url: string) => instance.get(url).then(response),
  post: (url: string, body: {}, returnFullResponse = false) => {
    // Set proper headers for FormData
    const config: any = {};
    if (body instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }
    
    return returnFullResponse 
      ? instance.post(url, body, config) 
      : instance.post(url, body, config).then(response);
  },
  put: (url: string, body: {}) => instance.put(url, body).then(response),
  patch: (url: string, body: {}) => instance.patch(url, body).then(response),
  delete: (url: string, data?: any) => instance.delete(url, { data }).then(response),
};

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

// add a subscriber to the queue
const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const AxiosInterceptor = ({ children }: any) => {
  const { isLoading, setLoading } = useRequest();
  const { auth, isLogged, clear, set } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const onRequest = (req: any) => {
    console.log('🚀 Request interceptor - URL:', req.url);
    setLoading(true);

    // client preferred language
    req.headers['accept-language'] = auth?.user?.preference?.language || 'FR';

    // FIXED: Get access token only from tokens property
    const getAccessToken = () => {
      // Only try auth.tokens (the correct structure)
      if (auth?.tokens?.accessToken) {
        console.log('🔑 Found token in auth.tokens');
        return auth.tokens.accessToken;
      }
      console.log('❌ No token found in auth:', auth);
      return null;
    };

    const publicEndpoints = [
      '/auth/signin',
      '/auth/signup', 
      '/auth/exists',
      '/auth/2factor',
      '/otp/confirm-phone',
      '/otp/resend/confirm-phone',
    ];

    // FIXED: Check if this is a public endpoint first
    const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
    
    console.log('📋 Request details:', {
      url: req.url,
      isLogged,
      isPublicEndpoint,
      hasAuth: !!auth,
      hasTokens: !!auth?.tokens
    });

    // FIXED: Remove admin portal restriction - add auth for all authenticated requests
    if (isLogged && !isPublicEndpoint) {
      const accessToken = getAccessToken();
      
      if (accessToken) {
        console.log('✅ Adding Authorization header');
        req.headers.Authorization = 'Bearer ' + accessToken;
      } else {
        console.log('⚠️ No access token available for authenticated request');
      }
    } else {
      console.log('ℹ️ Skipping auth header:', {
        reason: !isLogged ? 'not logged in' : 
               isPublicEndpoint ? 'public endpoint' : 'unknown'
      });
    }

    // FIXED: Don't override Content-Type if it's already set (for FormData)
    if (req.data instanceof FormData && !req.headers['Content-Type']) {
      req.headers['Content-Type'] = 'multipart/form-data';
    }

    console.log('📤 Final request headers:', {
      Authorization: req.headers.Authorization ? 'Bearer ***' : 'none',
      'Content-Type': req.headers['Content-Type'],
      'x-access-key': req.headers['x-access-key']
    });

    return req;
  };

  // @response interceptor
  const onReponse = (res: any) => {
    setLoading(false);
    return res;
  };

  // @error interceptor - FIXED: Prevent infinite loop
  const onError = async (error: any) => {
    setLoading(false);
    const originalRequest = error.config;

    console.log('❌ Request error:', {
      status: error.response?.status,
      url: originalRequest?.url,
      retry: originalRequest?._retry,
      code: error.code
    });

    // FIXED: Don't handle 304 (Not Modified) as errors
    if (error.response?.status === 304) {
      console.log('ℹ️ 304 Not Modified - not an actual error');
      return Promise.reject(error);
    }

    // FIXED: Only handle 401 errors for actual authentication failures
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if this is a token-related 401 (not other types of 401)
      const isTokenError = error.response?.data?.error === 'Unauthorized' || 
                          error.response?.data?.message?.includes('Token');
      
      if (!isTokenError) {
        console.log('ℹ️ 401 error is not token-related, skipping refresh');
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // FIXED: Get refresh token only from tokens property
          const getRefreshToken = () => {
            if (auth?.tokens?.refreshToken) return auth.tokens.refreshToken;
            return null;
          };

          const refreshToken = getRefreshToken();
          
          if (!isLogged || !refreshToken) {
            console.log('No refresh token available, clearing auth');
            isRefreshing = false;
            clear();
            throw error;
          }

          console.log('🔄 Attempting token refresh...');
          
          // FIXED: Add timeout to prevent hanging
          const refreshTimeout = setTimeout(() => {
            throw new Error('Token refresh timeout');
          }, 5000);

          try {
            const { data: tokens } = await AuthAPI.refresh(refreshToken);

            // FIXED: Create proper LoginResponseData structure
            const authUpdate: LoginResponseData = {
              tokens: {
                accessToken: tokens.accessToken || tokens.access_token,
                refreshToken: tokens.refreshToken || tokens.refresh_token,
              },
              user: {
                ...auth.user,
              } as LoginResponseData['user'],
            };
            
            console.log('✅ Token refresh successful');
            set(authUpdate);

            clearTimeout(refreshTimeout);
            isRefreshing = false;
            const newAccessToken = tokens.accessToken || tokens.access_token;
            onRefreshed(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance(originalRequest); // Retry the original request
          } catch (refreshError) {
            clearTimeout(refreshTimeout);
            throw refreshError;
          }
        } catch (refreshError) {
          console.error('💥 Token refresh failed:', refreshError);

          isRefreshing = false;
          onRefreshed(null); // Notify waiting requests of failure

          // Don't clear auth if we're on auth pages to prevent disrupting login flow
          const isOnAuthPage = typeof window !== 'undefined' && (
            window.location.pathname.includes('/login') ||
            window.location.pathname.includes('/register') ||
            window.location.pathname.includes('/otp-verification') ||
            window.location.pathname.includes('/reset-password') ||
            window.location.pathname.includes('/identity-verification') ||
            window.location.pathname.includes('/subscription-plans')
          );

          if (!isOnAuthPage) {
            clear(); // Log out the user only if not on auth pages
          } else {
            console.log('Token refresh failed during auth flow, not clearing auth to prevent disrupting login');
          }

          throw refreshError; // Reject the original request with the error
        }
      } else {
        // If a token refresh is already in progress, queue the original request
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }
    }

    // Handle different types of errors
    if (error.response?.status !== 401 && error.response?.status !== 304) {
      console.log('API Error:', error.response);

      // Show user-friendly error message
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'un problème est survenu';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
      // Network/connection errors
      console.log('Network Error:', error.message);
      enqueueSnackbar('Impossible de se connecter au serveur. Vérifiez votre connexion.', { variant: 'error' });
    }

    // Log error details safely
    if (error.response) {
      console.log('\nStatus : ' + error.response.status + '\n Body : ');
      console.log(error.response.data);
    } else {
      console.log('\nNetwork Error:', error.message);
    }

    return Promise.reject(error);
  };

  useEffect(() => {
    const responseInterceptor = instance.interceptors.response.use(onReponse, onError);
    const requestInterceptor = instance.interceptors.request.use(onRequest, onError);

    return () => {
      instance.interceptors.response.eject(responseInterceptor);
      instance.interceptors.request.eject(requestInterceptor);
    };
  }, [auth, isLogged, clear, set, enqueueSnackbar, setLoading]);

  return children;
}

export { AxiosInterceptor };