"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getSession,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  type SessionData,
  type UserData,
} from "../lib/auth-client";

interface ExtendedSession extends SessionData {
  refresh_token?: string;
}

interface AuthContextType {
  user: UserData | null;
  session: ExtendedSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => void;
  updateUser: (user: UserData) => void;
}

export type { UserData as User, ExtendedSession, AuthContextType };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isUserData(data: unknown): data is UserData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.id === 'string' &&
    typeof d.email === 'string' &&
    typeof d.name === 'string'
  );
}

function isSessionData(data: unknown): data is ExtendedSession {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return typeof d.token === 'string';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<ExtendedSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await getSession();
        if (sessionData && isUserData(sessionData.user) && isSessionData(sessionData.session)) {
          setUser(sessionData.user);
          setSession(sessionData.session);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authSignIn(email, password);
    if (result.error) {
      const errorMessage = typeof result.error === 'object' && result.error !== null && 'message' in result.error
        ? (result.error as { message: string }).message
        : "Login failed";
      return { error: errorMessage };
    }
    if (result.user && result.session && isUserData(result.user) && isSessionData(result.session)) {
      setUser(result.user);
      setSession(result.session);
    }
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
    if (result.user && result.session && isUserData(result.user) && isSessionData(result.session)) {
      setUser(result.user);
      setSession(result.session);
    }
    return {};
  };

  const signOut = () => {
    authSignOut();
    setUser(null);
    setSession(null);
  };

  const updateUser = (updatedUser: UserData) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      updateUser
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