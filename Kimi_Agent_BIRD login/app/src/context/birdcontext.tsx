import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipagem
interface User {
  username: string;
  token?: string;
}

interface BirdContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
}

const BirdContext = createContext<BirdContextType>({} as BirdContextType);

// Chaves para localStorage
const TOKEN_KEY = 'bird_token';
const USER_KEY = 'bird_user';

export const BirdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Verifica se há token salvo ao iniciar
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Erro ao parsear usuário:', e);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Função de login
  const login = async (username: string, password: string): Promise<void> => {
    // Simula chamada à API (substitua pela sua API real)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock de autenticação - substitua pela sua lógica real
        if (username && password) {
          const mockToken = `token_${Date.now()}`;
          const user: User = { username, token: mockToken };
          
          // Salva no localStorage
          localStorage.setItem(TOKEN_KEY, mockToken);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          
          // Atualiza estado
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          resolve();
        } else {
          reject(new Error('Credenciais inválidas'));
        }
      }, 500);
    });
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <BirdContext.Provider value={{ isAuthenticated, isLoading, currentUser, login, logout }}>
      {children}
    </BirdContext.Provider>
  );
};

export const useBird = () => {
  return useContext(BirdContext);
};

export default BirdContext;
