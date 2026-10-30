import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
const cleanBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
// Normalize URL so it always points to the /api endpoint
const API_BASE_URL = cleanBaseUrl.endsWith('/api')
  ? cleanBaseUrl
  : (cleanBaseUrl.startsWith('http') ? `${cleanBaseUrl}/api` : cleanBaseUrl);

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
