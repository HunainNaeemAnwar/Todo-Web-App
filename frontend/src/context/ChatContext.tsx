"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ChatSession {
  client_secret: string;
  domain_key: string;
  user_id: string;
}

interface ChatContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  session: ChatSession | null;
  loading: boolean;
  error: string | null;
  customFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  setRefreshTasks: (refreshFunc: () => void) => void;
  triggerRefresh: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTasks, setRefreshTasksState] = useState<(() => void) | null>(null);

  // Use ref to track the last refresh time and prevent excessive calls
  const lastRefreshTime = useRef<number>(0);
  const refreshCooldown = 2000; // 2 seconds cooldown between refreshes

  const fetchSession = useCallback(async () => {
    // Only fetch if we have a user
    if (!user) return;

    setLoading(true);
    try {
      console.log('[ChatContext] Fetching AI session...');
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

      // Get token from auth session first
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/chatkit/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Session initialization failed (${response.status})`);
      }

      const data = await response.json();
      console.log('[ChatContext] Session ready:', data.domain_key);
      // Include user_id in the session data
      setSession({...data, user_id: user.id});
      setError(null);
    } catch (err) {
      console.error('[ChatContext] Initialization error:', err);
      setError(err instanceof Error ? err.message : 'Could not initialize AI');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch session when user changes
  useEffect(() => {
    if (user && !session) {
      fetchSession();
    } else if (!user) {
      // Reset session if user logs out
      setSession(null);
    }
  }, [user, session, fetchSession]);

  const customFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    const pageContext = {
      url: typeof window !== 'undefined' ? window.location.href : '',
      title: typeof window !== 'undefined' ? document.title : '',
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      description: typeof document !== 'undefined' ? document.querySelector('meta[name="description"]')?.getAttribute('content') || '' : '',
    };

    const userInfo = {
      id: user.id,
      name: user.name || user.email || 'User',
      email: user.email || ''
    };

    // Inject metadata into request body
    let modifiedInit = { ...init };
    if (modifiedInit.body && typeof modifiedInit.body === 'string') {
      try {
        const parsed = JSON.parse(modifiedInit.body);
        if (parsed.params?.input) {
          parsed.params.input.metadata = {
            userId: user.id,
            userInfo,
            pageContext,
            ...parsed.params.input.metadata,
          };
          modifiedInit.body = JSON.stringify(parsed);
        }
      } catch (e) {
        // If parsing fails, continue with original body
        console.warn('Could not parse request body for metadata injection', e);
      }
    }

    const headers = new Headers(modifiedInit.headers);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('X-User-ID', user.id);

    // Ensure content-type is set correctly for JSON requests
    if (!headers.has('Content-Type') && typeof modifiedInit.body === 'string' && (modifiedInit.body.startsWith('{') || modifiedInit.body.startsWith('['))) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(input, { ...modifiedInit, headers });
  }, [user]);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  const setRefreshTasks = useCallback((refreshFunc: () => void) => {
    setRefreshTasksState(() => refreshFunc);
  }, []);

  const triggerRefresh = useCallback(() => {
    const currentTime = Date.now();
    const timeSinceLastRefresh = currentTime - lastRefreshTime.current;

    // Only trigger refresh if cooldown period has passed
    if (timeSinceLastRefresh > refreshCooldown) {
      lastRefreshTime.current = currentTime;
      setRefreshTasksState(prev => {
        if (prev) {
          prev();
        }
        return prev;
      });
    }
  }, []);

  return (
    <ChatContext.Provider value={{
      isOpen,
      openChat,
      closeChat,
      toggleChat,
      session,
      loading,
      error,
      customFetch,
      setRefreshTasks,
      triggerRefresh
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
