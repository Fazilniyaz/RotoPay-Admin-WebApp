import axios, { AxiosError, AxiosResponse } from 'axios';
import { authStore } from '@/store/authStore';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onError: (error: Error) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onError(error);
    } else if (token) {
      prom.onSuccess(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - attach access token
api.interceptors.request.use(
  (config) => {
    const token = authStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any;

    // If not 401, already retried, or is an auth endpoint, reject
    if (
      error.response?.status !== 401 || 
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // Prevent double refresh
    if (isRefreshing) {
      return new Promise<string>((onSuccess, onError) => {
        failedQueue.push({ onSuccess, onError });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Start refresh
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshToken = authStore.getState().refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${baseURL}/auth/refresh-token`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      authStore.getState().setTokens(accessToken, newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      processQueue(null, accessToken);

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      authStore.getState().clearAuth();
      // Redirect to login if in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
