import axios from 'axios';

// Aponta para o backend Django rodando na porta 8000
const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Injetar o Token de Autenticação em todas as requisições, se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@lyv:token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data; // Retorna { token: "..." }
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },
};

export const feedService = {
  getFeed: async () => {
    const response = await api.get('/feed/');
    return response.data.results;
  },
  createPost: async (formData: FormData) => {
    // Usando multipart/form-data para suportar imagens
    const response = await api.post('/lyvs/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  toggleLike: async (postId: string) => {
    const response = await api.post(`/lyvs/${postId}/like/`);
    return response.data;
  }
};

export const chatService = {
  getRooms: async () => {
    const response = await api.get('/chat/rooms/');
    return response.data;
  },
  getMessages: async (roomId: string) => {
    const response = await api.get(`/chat/rooms/${roomId}/messages/`);
    return response.data;
  },
  sendMessage: async (roomId: string, content: string) => {
    const response = await api.post(`/chat/rooms/${roomId}/messages/`, { content });
    return response.data;
  },
  startDm: async (username: string) => {
    const response = await api.post('/chat/start-dm/', { username });
    return response.data;
  }
};

// --- TAS (Motor de Recomendação e Trends) ---
export const tasService = {
  getTrending: async () => {
    const res = await api.get('/trending/');
    return res.data;
  },
  getSuggested: async () => {
    const res = await api.get('/suggested/');
    return res.data;
  },
  followUser: async (username: string) => {
    const res = await api.post(`/users/${username}/follow/`);
    return res.data;
  }
};

// --- HEIMDALL (Guardião de Notificações e Segurança) ---
export const heimdallService = {
  getNotifications: async () => {
    const res = await api.get('/notifications/');
    return res.data;
  },
  markAsRead: async () => {
    const res = await api.post('/notifications/read/');
    return res.data;
  }
};