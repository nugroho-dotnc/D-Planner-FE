import axios from 'axios';
import authStore from '../store/authStore';

// ─── Axios Instance ────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor — inject access token ────────────────────
api.interceptors.request.use(
  (config) => {
    const token = authStore.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — auto-refresh on 401 ───────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // 401 and not already retried
    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = authStore.getRefreshToken();

      // No refresh token — clear and redirect to login
      if (!refreshToken) {
        authStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue other requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry  = true;
      isRefreshing     = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/refresh`,
          { refreshToken },
        );
        const newToken = data.data.accessToken;
        authStore.setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        authStore.clear();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ─── SWR Fetcher ──────────────────────────────────────────────────
// Usage: useSWR('/api/activities', swrFetcher)
export const swrFetcher = (url) =>
  api.get(url).then((res) => res.data.data ?? res.data);

export default api;
