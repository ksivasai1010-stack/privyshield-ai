import axios from 'axios';

// Determine API Base URL dynamically
const getBaseApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // 1. If explicitly set via environment variable, normalize and use it
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : (clean.startsWith('http') ? `${clean}/api` : clean);
  }

  // 2. In browser production (e.g. deployed on Vercel), default to the production Render backend
  const isBrowser = typeof window !== 'undefined';
  const isLocalHost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (import.meta.env.PROD || (isBrowser && !isLocalHost)) {
    return 'https://privyshield-ai.onrender.com/api';
  }

  // 3. Local development fallback
  return '/api';
};

const API_BASE_URL = getBaseApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach JWT bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('privyshield_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: graceful handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-clear if already on login/demo
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // Optional session expiration handling
      }
    }
    return Promise.reject(error);
  }
);

export default api;
