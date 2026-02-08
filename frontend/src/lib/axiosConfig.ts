import axios, { AxiosInstance } from 'axios';
import { refreshAccessToken } from './auth-client';

// Create a base axios instance
const createAxiosInstance = (): AxiosInstance => {
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
    // Enable sending cookies with requests (important for HTTP-only auth cookies)
    withCredentials: true,
  });

  // Track if we are currently refreshing the token
  let isRefreshing = false;
  type QueueItem = { resolve: (token: string | null) => void; reject: (error: Error) => void };
  let failedQueue: QueueItem[] = [];

  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // Response interceptor to handle 401 errors and attempt refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return api(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            processQueue(null);
            return api(originalRequest);
          }

          // Refresh failed, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/?showLogin=true';
          }
        } catch (refreshError) {
          processQueue(refreshError);
          if (typeof window !== 'undefined') {
            window.location.href = '/?showLogin=true';
          }
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

// Export a single instance to be reused across services
export const apiClient = createAxiosInstance();

export default apiClient;