import axios, { AxiosResponse } from 'axios';
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
  const { setLoading } = useRequest();
  const { auth, isLogged, clear, set } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const onRequest = (req: any) => {
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
      '/auth/signin',
      '/auth/signup',
      '/auth/exists',
      '/auth/2factor',
      '/otp/confirm-phone',
      '/otp/resend/confirm-phone',
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
    const accessToken = getAccessToken();

    // DEBUG AUTH
    if (req.url.includes('/chat') || req.url.includes('/notification')) {
      console.log(`🔒 AUTH DEBUG for ${req.url}:`);
      console.log(`   - Access Token Present: ${!!accessToken}`);
      if (accessToken) console.log(`   - Access Token Preview: ${accessToken.substring(0, 10)}...`);
      console.log(`   - Is Public Endpoint: ${isPublicEndpoint}`);
      const storeState = authStore.getState();
      console.log(`   - Auth Store Logged In: ${storeState.isLogged}`);
      console.log(`   - Auth Store Ready: ${storeState.isReady}`);
    }

    if (accessToken && !isPublicEndpoint) {
      req.headers.Authorization = 'Bearer ' + accessToken;
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
    console.log('🔄 401 DETECTED - ATTEMPTING REFRESH');

    // Prevent infinite loops
    if (originalRequest._retry) {
      console.error('❌ REFRESH LOOP DETECTED - ABORTING');
      clear();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const currentAuth = authStore.getState();
        const getRefreshToken = () => {
          if (currentAuth.auth?.tokens?.refreshToken) return currentAuth.auth.tokens.refreshToken;
          return null;
        };
        const refreshToken = getRefreshToken();

        console.log(`🔄 Refresh Token Available: ${!!refreshToken}`);

        if (!currentAuth.isLogged || !refreshToken) {
          console.warn('⚠️ No refresh token or not logged in - clearing session');
          isRefreshing = false;
          clear();
          throw error;
        }

        console.log('🔄 Calling AuthAPI.refresh...');
        const tokens = await AuthAPI.refresh(refreshToken);
        console.log('✅ Refresh Successful! Tokens received.');

        // ... (rest of the logic)
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
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);

      } catch (refreshError) {
        console.error('❌ Refresh Failed:', refreshError);
        isRefreshing = false;
        onRefreshed(null);
        clear();
        throw refreshError;
      }
    } else {
      console.log('⏳ Refresh already in progress - queuing request');
      // ... existing queue logic ...
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
};

export { AxiosInterceptor };