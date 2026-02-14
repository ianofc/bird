import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000', // URL do seu Django
});

// Interceptor para injetar o Token em cada requisição
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@Bird:token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export default api;