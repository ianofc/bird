import React, { createContext, useContext, useState, useEffect } from 'react';

const BirdContext = createContext<any>(undefined);

export const BirdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('@Bird:token');
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const user = localStorage.getItem('@Bird:user');
    return user ? JSON.parse(user) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, token: string) => {
    // Agora o login recebe o token e salva de verdade
    localStorage.setItem('@Bird:token', token);
    const userData = { name: "Ian Santos", handle: username, initials: "IS" };
    localStorage.setItem('@Bird:user', JSON.stringify(userData));
    
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('@Bird:token');
    localStorage.removeItem('@Bird:user');
    setIsAuthenticated(false);
    setCurrentUser(null);
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