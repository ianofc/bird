import React, { createContext, useContext, useState, useEffect } from 'react';

const BirdContext = createContext<any>(undefined);

export const BirdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // O Superusuário inicia com Soberania (Bypass)
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [currentUser, setCurrentUser] = useState({
    name: "Ian Santos",
    handle: "iansantos",
    initials: "IS",
    role: "SUPERUSER"
  });

  const login = (user: string, pass: string) => {
    console.log("Thalamus validando credenciais...");
    // Autoridade Total para iansantos
    if (user === "iansantos") {
      setIsAuthenticated(true);
      setCurrentUser({ name: "Ian Santos", handle: "iansantos", initials: "IS", role: "SUPERUSER" });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <BirdContext.Provider value={{ isAuthenticated, currentUser, login, logout, posts: [], trends: [] }}>
      {children}
    </BirdContext.Provider>
  );
};

export const useBird = () => {
  const context = useContext(BirdContext);
  if (!context) throw new Error("useBird must be used within BirdProvider");
  return context;
};