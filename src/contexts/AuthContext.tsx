'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthUser } from '@/lib/types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  // Cookie'ga token yozish (middleware uchun)
  useEffect(() => {
    if (auth.user) {
      // Session cookie o'rnatish
      document.cookie = `__session=authenticated; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    } else {
      // Cookie'ni o'chirish
      document.cookie = '__session=; path=/; max-age=0';
    }
  }, [auth.user]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}