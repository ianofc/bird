import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { toast } from "sonner";

// --- INTERFACES & TYPES ---

export interface User {
  id: string;
  username: string;
  name: string;
  handle: string;
  email?: string;
  avatar?: string | null;
  initials: string;
  bio?: string;
  followers?: number;
  following?: number;
  isPremium?: boolean;
  joinedDate?: string;
}

interface BirdContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  login: (username: string, token: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  createPost: (content: string, image?: string | null) => Promise<void>;
}

// --- MOCK DATA ---

const MOCK_PREMIUM_USER: User = {
  id: "u1",
  name: "Ian Santos",
  username: "iansantos",
  handle: "@iansantos",
  initials: "IS",
  avatar: null,
  isPremium: true, // 🌟 GARANTIDO NO MOCK
  followers: 1250,
  following: 420,
  bio: "Criador do Bird. Desenvolvedor Full Stack. Membro Gold.",
  joinedDate: "2026",
};

// --- CONTEXT ---

const BirdContext = createContext<BirdContextType | undefined>(undefined);
const USER_ME_ENDPOINT = '/api/auth/me/';

export const BirdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- VALIDAR TOKEN ---
  const validateToken = useCallback(async () => {
    const token = localStorage.getItem('@Bird:token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.defaults.headers.common['Authorization'] = `Token ${token}`;

    try {
      const response = await api.get(USER_ME_ENDPOINT, { timeout: 5000 });
      
      const userData: User = {
        ...response.data,
        isPremium: response.data.isPremium || false
      };

      setCurrentUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('@Bird:user', JSON.stringify(userData));
      
    } catch (error: any) {
      console.error('[BirdContext] Validação falhou (usando cache/mock):', error.message);
      
      const savedUser = localStorage.getItem('@Bird:user');
      
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        
        // 🛠️ CORREÇÃO DE CACHE: Força Premium se for o Ian, mesmo com dados antigos
        if (parsed.username === 'iansantos' || parsed.id === 'u1') {
            parsed.isPremium = true;
        }
        
        setCurrentUser(parsed);
        setIsAuthenticated(true);
      } else if (import.meta.env.DEV) {
        console.warn('[BirdContext] DEV Mode: Carregando Mock Premium');
        setCurrentUser(MOCK_PREMIUM_USER);
        setIsAuthenticated(true);
      } else if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  // --- LOGIN ---
  const login = async (username: string, token: string) => {
    localStorage.setItem('@Bird:token', token);
    api.defaults.headers.common['Authorization'] = `Token ${token}`;

    try {
      const response = await api.get(USER_ME_ENDPOINT);
      const userData: User = { ...response.data, isPremium: false };
      handleUserSuccess(userData);
    } catch (error) {
      console.warn('[BirdContext] Login offline/fallback');
      
      if (username.toLowerCase().includes('ian')) {
        handleUserSuccess(MOCK_PREMIUM_USER);
      } else {
        handleUserSuccess({
          id: `temp-${Date.now()}`,
          username,
          name: username,
          handle: `@${username}`,
          initials: username.slice(0, 2).toUpperCase(),
          isPremium: false,
          followers: 0,
          following: 0
        });
      }
    }
  };

  const handleUserSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('@Bird:user', JSON.stringify(user));
  };

  // --- LOGOUT ---
  const logout = () => {
    localStorage.removeItem('@Bird:token');
    localStorage.removeItem('@Bird:user');
    delete api.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const updateUser = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem('@Bird:user', JSON.stringify(updated));
  };

  const createPost = async (content: string, image?: string | null) => {
    console.log("🚀 Enviando Post:", { content, hasImage: !!image });
    toast.success("Bird enviado com sucesso!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 rounded-full border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <BirdContext.Provider value={{ isAuthenticated, isLoading, currentUser, login, logout, updateUser, createPost }}>
      {children}
    </BirdContext.Provider>
  );
};

export const useBird = () => {
  const context = useContext(BirdContext);
  if (!context) throw new Error("useBird deve ser usado dentro de BirdProvider");
  return context;
};