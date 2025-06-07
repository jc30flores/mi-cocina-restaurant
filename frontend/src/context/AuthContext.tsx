import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any | null;
  login: (userData: any) => void;
  logout: () => void;
  waiterColor: string | null;
  setWaiterColor: (color: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(() => {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [waiterColor, setWaiterColorState] = useState<string | null>(() => {
    return sessionStorage.getItem('waiterColor') || null;
  });

  const login = (userData: any) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };
  const setWaiterColor = (color: string) => {
    setWaiterColorState(color);
    sessionStorage.setItem('waiterColor', color);
    // lock this color globally until logout
    try {
      const locked: string[] = JSON.parse(localStorage.getItem('lockedColors') || '[]');
      if (!locked.includes(color)) {
        locked.push(color);
        localStorage.setItem('lockedColors', JSON.stringify(locked));
      }
    } catch {}
  };

  const logout = () => {
    // unlock this color
    try {
      const locked: string[] = JSON.parse(localStorage.getItem('lockedColors') || '[]');
      if (waiterColor) {
        const updated = locked.filter(c => c !== waiterColor);
        localStorage.setItem('lockedColors', JSON.stringify(updated));
      }
    } catch {}
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('waiterColor');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, waiterColor, setWaiterColor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};