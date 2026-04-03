import React, { createContext, useContext, useState, useEffect } from 'react';
// import { api } from '@/services/api'; // Na Fase 2 usaremos isso!

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  bio?: string;
  isPremium?: boolean;
}

interface BirdContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, token: string) => Promise<void>;
  signup: (name: string, handle: string, password: string) => Promise<void>;
  logout: () => void;
  // Estado provisório para a aba Network (Pessoas) funcionar
  users: any[];
  followingIds: string[];
  followUser: (id: string) => void;
  unfollowUser: (id: string) => void;
}

const BirdContext = createContext<BirdContextType | undefined>(undefined);

export function BirdProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [users] = useState([
    { id: '2', name: 'Lívia', handle: '@livia_art', initials: 'LI', color: 'bg-purple-500' },
    { id: '3', name: 'Marcos Dev', handle: '@marcos', initials: 'MD', color: 'bg-blue-500' },
    { id: '4', name: 'Ana Silva', handle: '@ana', initials: 'AS', color: 'bg-emerald-500' }
  ]);

  useEffect(() => {
    // Verifica se já existe um login salvo ao abrir o Bird
    const token = localStorage.getItem('@bird:token');
    const userStr = localStorage.getItem('@bird:user');
    
    if (token && userStr) {
      setCurrentUser(JSON.parse(userStr));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, token: string) => {
    // Simulação do usuário logado (Em breve puxaremos do Django)
    const user: User = { 
      id: '1', 
      name: 'Ian Santos', 
      handle: `@${username}`, 
      avatar: 'https://github.com/shadcn.png',
      isPremium: true
    };
    
    localStorage.setItem('@bird:token', token);
    localStorage.setItem('@bird:user', JSON.stringify(user));
    
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const signup = async (name: string, handle: string, password: string) => {
    console.log("Registrando nova identidade...", name, handle);
    // Aqui faremos a requisição POST para o Backend
  };

  const logout = () => {
    localStorage.removeItem('@bird:token');
    localStorage.removeItem('@bird:user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const followUser = (id: string) => setFollowingIds(prev => [...prev, id]);
  const unfollowUser = (id: string) => setFollowingIds(prev => prev.filter(fid => fid !== id));

  return (
    <BirdContext.Provider value={{
      currentUser, isAuthenticated, isLoading, login, signup, logout,
      users, followingIds, followUser, unfollowUser
    }}>
      {children}
    </BirdContext.Provider>
  );
}

export function useBird() {
  const context = useContext(BirdContext);
  if (context === undefined) {
    throw new Error('useBird must be used within a BirdProvider');
  }
  return context;
}