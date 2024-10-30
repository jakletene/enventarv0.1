import React, { createContext, useContext, useState } from 'react';
import { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const login = async (username: string, password: string) => {
    // Simulate API call
    if (
      (username === 'admin' && password === '123') ||
      (username === 'supplier' && password === '123') ||
      (username === 'warehouse' && password === '123')
    ) {
      const user: User = {
        id: '1',
        username,
        role: username as User['role'],
      };
      setAuthState({ user, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}