"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getCookie } from '../lib/cookies';
import { useAuth } from './AuthContext';
import { refreshAccessToken } from '../lib/auth-client';

interface ChatSession {
  id: string;
  conversationId: string;
  domain_key?: string;
  user_id?: string;
}

interface ChatContextType {
  session: ChatSession | null;
  loading: boolean;
  error: string | null;
  startConversation: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  triggerRefresh: () => void;
  customFetch: typeof fetch;
  setRefreshTasks: ((fn: () => void) => void) | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const refreshTasksRef = useRef<(() => void) | null>(null);

  const setRefreshTasks = useCallback((fn: () => void) => {
    refreshTasksRef.current = fn;
  }, []);

  const hasStartedRef = useRef(false);

  // Get auth token - memoize to prevent unnecessary re-fetches
  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return getCookie('auth_token');
  }, []);

  const triggerRefresh = useCallback(() => {
    // If we have a registered task refresh function, call it
    if (refreshTasksRef.current) {
      console.log('[ChatContext] triggering registered task refresh');
      refreshTasksRef.current();
    }
    // ChatKit handles its own message refresh
    console.log('[ChatContext] triggerRefresh called');
  }, []);

  const customFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);

    // Create a new init object to avoid mutating the original
    const modifiedInit: RequestInit = {
      ...init,
      credentials: 'include' as RequestCredentials,
    };

    // Helper to add auth headers
    const addAuthHeaders = (options: RequestInit) => {
      if (url.includes('/api/')) {
        const authToken = getAuthToken();
        if (authToken) {
          options.headers = {
            ...(options.headers as Record<string, string> || {}),
            Authorization: `Bearer ${authToken}`,
          };
        }
      }

      // Remove Content-Type for GET requests
      if (options.method === 'GET' || !options.method) {
        options.headers = {
          ...(options.headers as Record<string, string> || {}),
        };
        delete (options.headers as Record<string, string>)?.['Content-Type'];
      }
    };

    addAuthHeaders(modifiedInit);

    let response = await fetch(url, modifiedInit);

    // Handle 401 Unauthorized - Attempt Refresh
    if (response.status === 401) {
      console.log('[customFetch] 401 received, attempting token refresh...');
      try {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          console.log('[customFetch] Token refresh successful, retrying request...');
          // Update headers with new token
          addAuthHeaders(modifiedInit);
          response = await fetch(url, modifiedInit);
        } else {
          console.error('[customFetch] Token refresh failed');
        }
      } catch (err) {
        console.error('[customFetch] Error during token refresh:', err);
      }
    }

    // Log response status for debugging
    if (url.includes('/api/chatkit')) {
      console.log('[customFetch] Response:', {
        url: url.substring(0, 100),
        status: response.status,
        ok: response.ok
      });
    }

    return response;
  }, [getAuthToken]);

  const startConversation = useCallback(async () => {
    // Don't start if already loading, session exists, or user not authenticated
    if (loading || session?.id || !user) {
      console.log('[ChatContext] Skipping startConversation:', {
        loading,
        hasSession: !!session?.id,
        hasUser: !!user,
        authLoading
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get auth token from cookies
      const authToken = getAuthToken();

      // For debugging - log what we have
      console.log('[ChatContext] Starting conversation:', {
        userId: user?.id,
        hasAuthToken: !!authToken,
        cookieString: typeof document !== 'undefined' ? document.cookie : 'N/A'
      });

      // Call backend to establish ChatKit session using customFetch which handles token refresh
      const response = await customFetch('/api/chatkit/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('[ChatContext] Session error:', response.status, responseText);

        // Try to parse error JSON
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { detail: responseText };
        }

        throw new Error(errorData.detail || `Failed to establish chat session: ${response.status} ${response.statusText}`);
      }

      const sessionData = await response.json();

      // Validate required session data
      if (!sessionData.client_secret || !sessionData.domain_key) {
        console.error('[ChatContext] Invalid session response:', sessionData);
        throw new Error('Invalid session data received from server');
      }

      setSession({
        id: sessionData.client_secret,
        conversationId: sessionData.conversationId || 'new',
        domain_key: sessionData.domain_key,
        user_id: sessionData.user_id,
      });

      console.log('[ChatContext] Session established successfully');
    } catch (err) {
      console.error('[ChatContext] Session error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to start conversation: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [loading, session?.id, user, getAuthToken]);

  const sendMessage = useCallback(async (message: string) => {
    if (!session) {
      await startConversation();
    }
  }, [session, startConversation]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Auto-start conversation when auth is ready and user is authenticated
  useEffect(() => {
    // Only start if:
    // 1. Auth is not loading anymore
    // 2. User is authenticated
    // 3. We haven't already started
    // 4. No session exists yet
    if (!authLoading && user && !hasStartedRef.current && !session?.id && !loading) {
      console.log('[ChatContext] Auth ready, user authenticated, starting conversation...');
      hasStartedRef.current = true;
      startConversation().catch(error => {
        console.error('Failed to start conversation:', error);
      });
    }
    // If auth is loaded but user is not authenticated, clear any existing session
    else if (!authLoading && !user) {
      if (session) {
        setSession(null);
      }
      setError(null); // Clear any previous errors when user is not authenticated
    }
  }, [authLoading, user, session?.id, loading, startConversation]);

  const value = React.useMemo(() => ({
    session,
    loading,
    error,
    startConversation,
    sendMessage,
    triggerRefresh,
    customFetch,
    setRefreshTasks,
    isOpen,
    setIsOpen,
    toggleChat
  }), [
    session,
    loading,
    error,
    startConversation,
    sendMessage,
    triggerRefresh,
    customFetch,
    setRefreshTasks,
    isOpen,
    toggleChat
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
