/**
 * Authentication context for managing user session state.
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from '@/lib/better-auth-client';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, isPending } = useSession();
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    if (isPending) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: true,
      });
    } else {
      setAuthState({
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        loading: false,
      });
    }
  }, [session, isPending]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
