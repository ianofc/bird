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
  const token = localStorage.getItem('@bird:token');
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
    const response = await api.post('/birds/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  toggleLike: async (postId: string) => {
    const response = await api.post(`/birds/${postId}/like/`);
    return response.data;
  }
};