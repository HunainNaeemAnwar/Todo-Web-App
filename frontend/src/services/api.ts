const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface TokenCache {
  token: string;
  timestamp: number;
}

const TOKEN_CACHE_DURATION = 4 * 60 * 1000;
let tokenCache: TokenCache | null = null;

function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "auth_token") return value;
  }
  return null;
}

async function getBackendToken(): Promise<string | null> {
  const cookieToken = getTokenFromCookie();
  if (!cookieToken) {
    tokenCache = null;
    return null;
  }

  if (tokenCache && Date.now() - tokenCache.timestamp < TOKEN_CACHE_DURATION) {
    return tokenCache.token;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/get-backend-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth_token=${cookieToken}`,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      tokenCache = null;
      return null;
    }

    const data = await response.json();
    if (data.token) {
      tokenCache = { token: data.token, timestamp: Date.now() };
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

function isAuthPage(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  return path === '/login' || path === '/register';
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const cookieToken = getTokenFromCookie();

  if (!cookieToken) {
    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, credentials: 'include' });
    return response;
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${cookieToken}`);

  return fetch(`${API_BASE_URL}${url}`, { ...options, headers, credentials: 'include' });
}

const api = {
  get: async <T>(url: string, options?: RequestInit): Promise<T | null> => {
    try {
      const response = await fetchWithAuth(url, { ...options, method: 'GET' });
      
      if (!response.ok) {
        if (response.status === 401 && !isAuthPage()) {
          window.location.href = '/login';
          return null;
        }
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
      }
      return response.json();
    } catch {
      return null;
    }
  },
  
  post: async <T>(url: string, data?: unknown, options?: RequestInit): Promise<T | null> => {
    try {
      const response = await fetchWithAuth(url, {
        ...options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      if (!response.ok) {
        if (response.status === 401 && !isAuthPage()) {
          window.location.href = '/login';
          return null;
        }
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
      }
      return response.json();
    } catch {
      return null;
    }
  },
  
  put: async <T>(url: string, data?: unknown, options?: RequestInit): Promise<T | null> => {
    try {
      const response = await fetchWithAuth(url, {
        ...options,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      if (!response.ok) {
        if (response.status === 401 && !isAuthPage()) {
          window.location.href = '/login';
          return null;
        }
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
      }
      return response.json();
    } catch {
      return null;
    }
  },
  
  patch: async <T>(url: string, data?: unknown, options?: RequestInit): Promise<T | null> => {
    try {
      const response = await fetchWithAuth(url, {
        ...options,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      if (!response.ok) {
        if (response.status === 401 && !isAuthPage()) {
          window.location.href = '/login';
          return null;
        }
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
      }
      return response.json();
    } catch {
      return null;
    }
  },
  
  delete: async <T>(url: string, options?: RequestInit): Promise<T | null> => {
    try {
      const response = await fetchWithAuth(url, { ...options, method: 'DELETE' });
      
      if (!response.ok) {
        if (response.status === 401 && !isAuthPage()) {
          window.location.href = '/login';
          return null;
        }
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
      }
      return response.status === 204 ? ({} as T) : response.json();
    } catch {
      return null;
    }
  },
};

export default api;
