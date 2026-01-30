import { useState, useEffect, useCallback, useMemo, useRef } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: null;
  createdAt: string;
  updatedAt: string;
}

interface SessionData {
  user: User;
}

interface UseSessionReturn {
  data: SessionData | null;
  isPending: boolean;
  signOut: () => void;
  refreshSession: () => Promise<void>;
}

const SESSION_CACHE_DURATION = 2 * 60 * 1000;
let sessionCache: { data: SessionData; timestamp: number } | null = null;

function getAuthTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "auth_token") return value;
  }
  return null;
}

async function fetchSession(): Promise<SessionData | null> {
  const token = getAuthTokenFromCookie();
  if (!token) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/get-session`,
      {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: 'include',
        cache: "no-store",
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.user ? { user: data.user } : null;
  } catch {
    return null;
  }
}

export function useSession(): UseSessionReturn {
  const [data, setData] = useState<SessionData | null>(null);
  const [isPending, setIsPending] = useState(true);
  const checkedRef = useRef(false);
  const refreshCountRef = useRef(0);

  const checkSession = useCallback(async (force = false) => {
    const token = getAuthTokenFromCookie();
    
    if (!token) {
      setData(null);
      setIsPending(false);
      sessionCache = null;
      return;
    }

    const now = Date.now();
    if (!force && sessionCache && now - sessionCache.timestamp < SESSION_CACHE_DURATION) {
      setData(sessionCache.data);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    const session = await fetchSession();
    
    if (session) {
      sessionCache = { data: session, timestamp: now };
      refreshCountRef.current = 0;
    }
    setData(session);
    setIsPending(false);
  }, []);

  const signOut = useCallback(() => {
    sessionCache = null;
    setData(null);
    checkedRef.current = false;
    refreshCountRef.current = 0;
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }, []);

  const refreshSession = useCallback(async () => {
    sessionCache = null;
    checkedRef.current = false;
    await checkSession(true);
  }, [checkSession]);

  useEffect(() => {
    if (checkedRef.current && refreshCountRef.current > 2) return;
    
    checkedRef.current = true;
    refreshCountRef.current++;
    
    const check = async () => {
      await checkSession(true);
    };
    
    check();
  }, [checkSession]);

  return useMemo(() => ({ data, isPending, signOut, refreshSession }), [data, isPending, signOut, refreshSession]);
}
