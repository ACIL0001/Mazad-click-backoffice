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
  session: {
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
    console.log(req.url);
    setLoading(true);

    // client preferred language
    req.headers['accept-language'] = auth.user?.preference?.language || 'FR';

    // Check if this request should go to the current portal's API
    const currentPort = window.location.port;
    const isAdminPortal = currentPort === '3002';
    const isSellerPortal = currentPort === '3003';

    // Only add Authorization header if the user type matches the portal
    const shouldAddAuth = isLogged && 
                         auth.tokens && 
                         ((isAdminPortal && hasAdminPrivileges(auth.user?.type as any)) || 
                          (isSellerPortal && auth.user?.type === 'SELLER'));

    const publicEndpoints = [
      '/otp/confirm-phone',
      '/otp/resend/confirm-phone',
    ];

    if (shouldAddAuth && !publicEndpoints.some((endpoint) => req.url.includes(endpoint))) {
      if (!req.headers.Authorization) req.headers.Authorization = 'Bearer ' + auth.tokens.accessToken;
    }

    // FIXED: Don't override Content-Type if it's already set (for FormData)
    if (req.data instanceof FormData && !req.headers['Content-Type']) {
      req.headers['Content-Type'] = 'multipart/form-data';
    }

    return req;
  };

  // @response interceptor
  const onReponse = (res: any) => {
    setLoading(false);
    return res;
  };

  // @error interceptor
  const onError = async (error: any) => {
    setLoading(false);
    const originalRequest = error.config;

    // If access token expired and it's not already being refreshed
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          if (!isLogged) {
            isRefreshing = false;
            throw error;
          }

          const refreshToken = auth.tokens.refreshToken;

          const { data: tokens } = await AuthAPI.refresh(refreshToken);

          // FIXED: Create proper LoginResponseData structure
          const authUpdate: LoginResponseData = {
            ...auth,
            session: {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            },
            user: {
              ...auth.user,
            } as LoginResponseData['user'],
          };
          set(authUpdate);

          isRefreshing = false;
          onRefreshed(tokens.accessToken);
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return instance(originalRequest); // Retry the original request
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);

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
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            } else {
              Promise.reject(error);
            }
          });
        });
      }
    }

    // Handle different types of errors
    if (error.response?.status !== 401) {
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