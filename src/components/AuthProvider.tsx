import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '../types/api';
import { login as loginApi } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<User | null>;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('vault_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('vault_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const data = await loginApi(credentials);
      if (!data) throw new Error('Credenciais inválidas');

      localStorage.setItem('vault_user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      localStorage.removeItem('vault_user');
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('vault_user');
    setUser(null);
  };

  const updateUser = (nextUser: Partial<User>) => {
    setUser(prev => {
      if (!prev) return nextUser as User;
      const updated = { ...prev, ...nextUser };
      localStorage.setItem('vault_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

