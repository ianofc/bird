import axios from 'axios';

// ==========================================
// 1. CONFIGURAÇÃO COM PROXY (SOLUÇÃO NUCLEAR)
// ==========================================
const api = axios.create({
    // 🚨 MUDANÇA CRÍTICA: Deixe vazio! 
    // Isso faz o request ir para http://localhost:8080/api/...
    // O Vite (frontend) vai pegar essa chamada e jogar para o Django (backend:8000)
    baseURL: '', 
    
    // IMPORTANTE: Permite envio de Cookies/Session para o Django
    withCredentials: true, 
    
    headers: {
        'Content-Type': 'application/json',
    },
});

// ==========================================
// 2. HELPER: PEGAR CSRF DO COOKIE
// ==========================================
function getCookie(name: string) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ==========================================
// 3. INTERCEPTORS (INJEÇÃO DE TOKEN)
// ==========================================
api.interceptors.request.use(
    (config) => {
        // 1. Injeta o Token de Autenticação (DRF - se estiver usando Token Auth além de Session)
        const token = localStorage.getItem('@Bird:token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }

        // 2. Injeta o Token CSRF (Django Security)
        const csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==========================================
// 4. TRATAMENTO DE ERROS GLOBAIS
// ==========================================
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se o token for inválido (401), podemos limpar o storage aqui
        if (error.response && error.response.status === 401) {
            console.warn('[API] Sessão expirada ou token inválido.');
            // Opcional: localStorage.removeItem('@Bird:token');
        }
        return Promise.reject(error);
    }
);

export default api;