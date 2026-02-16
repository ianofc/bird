import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

interface User {
  username: string;
  email?: string;
  token?: string;
}

interface BirdContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  login: (user: string, pass: string) => Promise<void>;
  logout: () => void;
}

const BirdContext = createContext<BirdContextType>({} as BirdContextType);

export const BirdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. VERIFICAR SESSÃO AO CARREGAR A PÁGINA
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('@Bird:token');
      
      // Se tiver token salvo, assumimos que está logado (recuperação rápida)
      if (token) {
        setIsAuthenticated(true);
        // Opcional: Aqui você pode bater numa rota /api/me/ para validar o token real
        setCurrentUser({ username: 'Recuperando...' }); 
      }
      
      setIsLoading(false);
    };

    checkSession();
  }, []);

  // 2. FUNÇÃO DE LOGIN REAL (CONECTADA AO DJANGO)
  const login = async (username: string, pass: string) => {
    try {
      console.log(`🦅 [BIRD] Tentando logar via API: ${username}`);
      
      // IMPORTANTE: Tenta bater no endpoint de Auth do Django REST Framework
      // Se der 404 aqui, significa que precisamos ajustar seu urls.py
      const response = await api.post('/api-token-auth/', { 
        username: username, 
        password: pass 
      });

      // Se o backend retornou um token (DRF Token Auth)
      const { token } = response.data;

      if (token) {
        localStorage.setItem('@Bird:token', token);
        api.defaults.headers.Authorization = `Token ${token}`;
        
        setIsAuthenticated(true);
        setCurrentUser({ username, token });
        toast.success("Conexão Neural Estabelecida");
      } else {
        // Fallback se o backend não retornou token mas deu 200 OK (Session Auth)
        setIsAuthenticated(true);
        setCurrentUser({ username });
        toast.success("Sessão Iniciada (Cookie)");
      }

    } catch (error: any) {
      console.error("❌ Erro no Contexto:", error);
      setIsAuthenticated(false);
      
      // Repassa o erro para o Login.tsx mostrar na tela vermelha
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('@Bird:token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.location.href = '/login';
  };

  return (
    <BirdContext.Provider value={{ isAuthenticated, isLoading, currentUser, login, logout }}>
      {children}
    </BirdContext.Provider>
  );
};

export const useBird = () => {
  const context = useContext(BirdContext);
  if (!context) throw new Error("useBird deve ser usado dentro de um BirdProvider");
  return context;
};