"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSession, signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from "../lib/auth-client";

interface User {
  id: string;
  email: string;
  name: string;
}

interface Session {
  token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const sessionData = await getSession();
      if (sessionData) {
        setUser(sessionData.user as User);
        setSession(sessionData.session as Session);
      }
    } catch (error) {
      console.error("Session check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const result = await authSignIn(email, password);
    if (result.error) {
      const errorMessage = typeof result.error === 'object' && result.error !== null && 'message' in result.error
        ? (result.error as { message: string }).message
        : "Login failed";
      return { error: errorMessage };
    }
    setUser(result.user as User);
    setSession(result.session as Session);
    return {};
  };

  const signUp = async (email: string, password: string, name: string) => {
    const result = await authSignUp(email, password, name);
    if (result.error) {
      const errorMessage = typeof result.error === 'object' && result.error !== null && 'message' in result.error
        ? (result.error as { message: string }).message
        : "Registration failed";
      return { error: errorMessage };
    }
    setUser(result.user as User);
    setSession(result.session as Session);
    return {};
  };

  const signOut = () => {
    authSignOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}