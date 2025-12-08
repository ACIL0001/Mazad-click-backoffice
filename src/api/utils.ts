import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import app from '@/config';
import useAuth from '@/hooks/useAuth';
import useRequest from '@/hooks/useRequest';
import { LoginResponseData } from '@/types/Auth';
import { AuthAPI } from './auth';
import { authStore } from '@/contexts/authStore';

const instance = axios.create({
  baseURL: app.baseURL,
  timeout: app.timeout,
  headers: { 'x-access-key': app.apiKey },
  withCredentials: true,
  // Treat 304 Not Modified as a success to prevent retry/error loops
  validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
});

const response = (res: AxiosResponse) => res.data;

export const requests = {
  get: (url: string) => instance.get(url).then(response),
  post: (url: string, body: {}, returnFullResponse = false) => {
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
  put: (url: string, body: {}) => {
    const config: any = {};
    if (body instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }
    return instance.put(url, body, config).then(response);
  },
  patch: (url: string, body: {}) => instance.patch(url, body).then(response),
  delete: (url: string, data?: any) => instance.delete(url, { data }).then(response),
};

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

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
    // Get the latest auth state directly from zustand store to avoid stale closures
    const currentAuth = authStore.getState();
    
    console.log('🚀 Request interceptor - URL:', req.url, 'isLogged:', currentAuth.isLogged, 'hasToken:', !!currentAuth.auth?.tokens?.accessToken);
    
    setLoading(true);

    req.headers['accept-language'] = currentAuth.auth?.user?.preference?.language || 'FR';

    const getAccessToken = () => {
      if (currentAuth.auth?.tokens?.accessToken) {
        return currentAuth.auth.tokens.accessToken;
      }
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

    const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
    
    // Add token if we have one and it's not a public endpoint
    const accessToken = getAccessToken();
    
    if (accessToken && !isPublicEndpoint) {
      console.log('✅ Adding Authorization header');
      req.headers.Authorization = 'Bearer ' + accessToken;
    } else if (!isPublicEndpoint && !accessToken) {
      console.warn('⚠️ Request to protected endpoint without token:', req.url);
    }

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

  const onReponse = (res: any) => {
    setLoading(false);
    return res;
  };

  const onError = async (error: any) => {
    setLoading(false);
    const originalRequest = error.config;

    console.log('❌ Request error:', {
      status: error.response?.status,
      url: originalRequest?.url,
      retry: originalRequest?._retry,
      code: error.code
    });

    if (error.response?.status === 304) {
      console.log('ℹ️ 304 Not Modified - treating as success');
      // Resolve with the response so callers receive it as a successful result
      return Promise.resolve(error.response);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
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
          // Get latest auth state from store
          const currentAuth = authStore.getState();
          
          const getRefreshToken = () => {
            if (currentAuth.auth?.tokens?.refreshToken) return currentAuth.auth.tokens.refreshToken;
            return null;
          };

          const refreshToken = getRefreshToken();
          
          if (!currentAuth.isLogged || !refreshToken) {
            console.log('No refresh token available, clearing auth');
            isRefreshing = false;
            clear();
            throw error;
          }

          console.log('🔄 Attempting token refresh...');
          
          const refreshTimeout = setTimeout(() => {
            throw new Error('Token refresh timeout');
          }, 5000);

          try {
            const { data: tokens } = await AuthAPI.refresh(refreshToken);

            // FIXED: Properly typed tokens object with required properties
            const tokensData = {
              accessToken: tokens.accessToken || tokens.access_token || '',
              refreshToken: tokens.refreshToken || tokens.refresh_token || '',
            };

            // FIXED: Properly structured authUpdate object matching LoginResponseData
            // Get current user from store
            const currentAuth = authStore.getState();
            
            const authUpdate: LoginResponseData = {
              session: {
                accessToken: tokensData.accessToken,
                refreshToken: tokensData.refreshToken,
              },
              user: {
                _id: currentAuth.auth?.user?._id || '',
                firstName: currentAuth.auth?.user?.firstname || currentAuth.auth?.user?.firstName || '',
                lastName: currentAuth.auth?.user?.lastname || currentAuth.auth?.user?.lastName || '',
                email: currentAuth.auth?.user?.email || '',
                type: currentAuth.auth?.user?.type || '',
                accountType: currentAuth.auth?.user?.accountType || '',
                phone: currentAuth.auth?.user?.phone || currentAuth.auth?.user?.tel?.toString() || '',
                isPhoneVerified: currentAuth.auth?.user?.isPhoneVerified || false,
                // WORKAROUND: Use 'as any' to bypass the incorrect type error.
                // The root cause is likely a cached/stale type definition.
                photoURL: currentAuth.auth?.user?.photoURL || currentAuth.auth?.user?.picture?.url || '',

              },
            };
            
            console.log('✅ Token refresh successful');
            set(authUpdate);

            clearTimeout(refreshTimeout);
            isRefreshing = false;
            const newAccessToken = tokensData.accessToken;
            onRefreshed(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return instance(originalRequest);
          } catch (refreshError) {
            clearTimeout(refreshTimeout);
            throw refreshError;
          }
        } catch (refreshError) {
          console.error('💥 Token refresh failed:', refreshError);

          isRefreshing = false;
          onRefreshed(null);

          const isOnAuthPage = typeof window !== 'undefined' && (
            window.location.pathname.includes('/login') ||
            window.location.pathname.includes('/register') ||
            window.location.pathname.includes('/otp-verification') ||
            window.location.pathname.includes('/reset-password') ||
            window.location.pathname.includes('/identity-verification') ||
            window.location.pathname.includes('/subscription-plans')
          );

          if (!isOnAuthPage) {
            clear();
          } else {
            console.log('Token refresh failed during auth flow, not clearing auth to prevent disrupting login');
          }

          throw refreshError;
        }
      } else {
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

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.log('Request timeout:', error.message);
    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
      console.log('Network Error:', error.message);
      enqueueSnackbar('Impossible de se connecter au serveur. Vérifiez votre connexion.', { variant: 'error' });
    } else if (error.response?.status !== 401 && error.response?.status !== 304) {
      console.log('API Error:', error.response);

      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'un problème est survenu';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }

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