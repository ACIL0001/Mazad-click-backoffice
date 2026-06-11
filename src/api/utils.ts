import axios, { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useRef } from 'react';
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

const isTokenExpired = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    // Add a 15 second buffer
    return payload.exp * 1000 < Date.now() + 15000;
  } catch (e) {
    return true; // Force refresh if decoding fails
  }
};

const AxiosInterceptor = ({ children }: any) => {
  const { setLoading } = useRequest();
  const { auth, isLogged, clear, set } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const performTokenRefresh = async (): Promise<string> => {
    if (isRefreshing) {
      console.log('⏳ Refresh already in progress - queuing request');
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (token) {
            resolve(token);
          } else {
            reject(new Error('Token refresh failed'));
          }
        });
      });
    }

    isRefreshing = true;
    try {
      const currentAuth = authStore.getState();
      const getRefreshToken = () => {
        if (currentAuth.auth?.tokens?.refreshToken) return currentAuth.auth.tokens.refreshToken;
        return null;
      };
      const refreshToken = getRefreshToken();

      console.log(`🔄 Proactive Refresh Token Available: ${!!refreshToken}`);

      if (!currentAuth.isLogged || !refreshToken) {
        console.warn('⚠️ No refresh token or not logged in - clearing session');
        isRefreshing = false;
        clear();
        throw new Error('No refresh token available');
      }

      console.log('🔄 Calling AuthAPI.refresh...');
      const tokens = await AuthAPI.refresh(refreshToken);
      console.log('✅ Refresh Successful! Tokens received.');

      const tokensData = {
        accessToken: tokens.accessToken || tokens.access_token || '',
        refreshToken: tokens.refreshToken || tokens.refresh_token || '',
      };

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
          photoURL: currentAuth.auth?.user?.photoURL || currentAuth.auth?.user?.picture?.url || '',
        },
      };

      set(authUpdate);
      isRefreshing = false;
      const newAccessToken = tokensData.accessToken;
      onRefreshed(newAccessToken);
      return newAccessToken;
    } catch (refreshError) {
      console.error('❌ Refresh Failed:', refreshError);
      isRefreshing = false;
      onRefreshed(null);
      clear();
      throw refreshError;
    }
  };

  const onRequest = async (req: any) => {
    const currentAuth = authStore.getState();
    setLoading(true);

    req.headers['accept-language'] = currentAuth.auth?.user?.preference?.language || 'FR';

    const getAccessToken = () => {
      if (currentAuth.auth?.tokens?.accessToken) {
        return currentAuth.auth.tokens.accessToken;
      }
      return null;
    };

    const publicEndpoints = [
      'auth/signin',
      'auth/signup',
      'auth/exists',
      'auth/2factor',
      'otp/confirm-phone',
      'otp/resend/confirm-phone',
      'auth/refresh',
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
    let accessToken = getAccessToken();

    // Proactive Expiration Check
    if (accessToken && !isPublicEndpoint) {
      if (isTokenExpired(accessToken)) {
        console.log(`⏱️ Token expired proactively detected for request to ${req.url}`);
        try {
          accessToken = await performTokenRefresh();
        } catch (error) {
          throw new axios.Cancel('Session expired, please login again.');
        }
      }
    }

    if (!accessToken && !isPublicEndpoint) {
      console.warn(`⚠️ Blocked request to ${req.url} because no token is available.`);
      throw new axios.Cancel('No token available for protected endpoint');
    }

    if (accessToken && !isPublicEndpoint) {
      if (req.headers && typeof req.headers.set === 'function') {
        req.headers.set('Authorization', 'Bearer ' + accessToken);
      } else {
        req.headers.Authorization = 'Bearer ' + accessToken;
      }
    }

    if (req.data instanceof FormData && !req.headers['Content-Type']) {
      req.headers['Content-Type'] = 'multipart/form-data';
    }

    return req;
  };

  const onReponse = (res: any) => {
    setLoading(false);
    return res;
  };

  const onError = async (error: any) => {
    setLoading(false);
    const originalRequest = error.config;

    console.log(`❌ API ERROR for ${originalRequest?.url}:`, error.response?.status);

    if (error.response?.status === 304) {
      return Promise.resolve(error.response);
    }

    const isTokenError = error.response?.status === 401;

    if (axios.isCancel(error)) {
      console.log('🛑 Request aborted by interceptor:', error.message);
      return Promise.reject(error);
    }

    // Handle non-401 errors (Logging / Snackbar)
    if (!isTokenError) {
      // ... existing error handling ...
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.log('Request timeout:', error.message);
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        console.log('Network Error:', error.message);
        enqueueSnackbar('Impossible de se connecter au serveur. Vérifiez votre connexion.', { variant: 'error' });
      } else {
        console.log('API Error:', error.response);
        const errorMessage = error.response?.data?.message || error.message || 'un problème est survenu';
        // changing snackbar variant to warning to be less intrusive if it's just a connection blip
        if (errorMessage !== 'Unauthorized') enqueueSnackbar(errorMessage, { variant: 'error' });
      }
      return Promise.reject(error);
    }

    // Handle 401 Token Refresh
    console.log('🔄 401 DETECTED - ATTEMPTING REFRESH FALLBACK');

    // Prevent infinite loops
    if (originalRequest._retry) {
      console.error('❌ REFRESH LOOP DETECTED - ABORTING');
      clear();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await performTokenRefresh();
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return instance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(error);
    }
  };

  const interceptorsRef = useRef({ request: null as number | null, response: null as number | null });

  if (interceptorsRef.current.request === null) {
    interceptorsRef.current.response = instance.interceptors.response.use(onReponse, onError);
    interceptorsRef.current.request = instance.interceptors.request.use(onRequest, onError);
  }

  useEffect(() => {
    return () => {
      if (interceptorsRef.current.response !== null) {
        instance.interceptors.response.eject(interceptorsRef.current.response);
        instance.interceptors.request.eject(interceptorsRef.current.request as number);
      }
    };
  }, []);

  return children;
};

export { AxiosInterceptor };