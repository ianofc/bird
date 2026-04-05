// LYV System - URLs e Endpoints

// URLs da aplicação (rotas internas)
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// Endpoints da API (backend)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },
} as const;

// URLs externas
export const EXTERNAL_URLS = {
  SUPPORT: 'https://support.lyv.com',
  DOCS: 'https://docs.lyv.com',
  PRIVACY: 'https://lyv.com/privacy',
} as const;

export default { ROUTES, API_ENDPOINTS, EXTERNAL_URLS };
