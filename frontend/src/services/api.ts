import axios from 'axios';

// Configuração baseada no ambiente
const isDocker = typeof window !== 'undefined' && window.location.port === '8080';
const baseURL = isDocker ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8000');

console.log('[API] Config:', { isDocker, baseURL, href: window.location?.href });

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Interceptor de Request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@Bird:token');
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, { hasToken: !!token });

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    // CSRF para Django
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('[API Error]', {
      status: error.response?.status,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    console.log('[Auth] POST /api-token-auth/');
    const response = await api.post('/api-token-auth/', credentials);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me/');
    return response.data;
  }
};

export default api;
