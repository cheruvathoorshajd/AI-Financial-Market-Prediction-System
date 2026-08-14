import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  // Generous: /insights/outlook trains LSTMs on the server and is intentionally
  // slow. This is a safety net for genuinely hung requests, not a tight budget.
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // The /auth/me probe 401s whenever the user is simply logged out or the
      // token has expired — AuthContext treats that as "logged out". Don't bounce
      // the user off a public page for it; only redirect when a genuine
      // authenticated action fails on an expired session.
      const url = error.config?.url ?? '';
      if (!url.includes('/auth/me')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
