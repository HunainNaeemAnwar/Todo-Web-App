import { getCookie, setCookie, deleteCookie } from '../lib/cookies';
import {
  validateEmail,
  validatePassword,
  validateName,
  sanitizeInput,
} from '../utils/validation';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface SessionData {
  token: string;
  refresh_token?: string;
  expiresAt?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface AuthResponse {
  user: UserData | null;
  session: SessionData | null;
  error: unknown;
}

export type { SessionData, UserData, AuthResponse };

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function getCookieSettings(): { maxAge: number; secure: boolean; sameSite: 'strict' | 'lax' | 'none' } {
  return {
    maxAge: 60 * 60 * 24, // 24 hours for access token
    secure: isProduction(),
    sameSite: isProduction() ? 'strict' : 'lax',
  };
}

function getRefreshCookieSettings(): { maxAge: number; secure: boolean; sameSite: 'strict' | 'lax' | 'none' } {
  return {
    maxAge: 60 * 60 * 24 * 7, // 7 days for refresh token
    secure: isProduction(),
    sameSite: isProduction() ? 'strict' : 'lax',
  };
}

function setAuthCookies(token: string, refreshToken?: string): void {
  const settings = getCookieSettings();
  setCookie(AUTH_TOKEN_KEY, token, settings.maxAge);

  if (refreshToken) {
    const refreshSettings = getRefreshCookieSettings();
    setCookie(REFRESH_TOKEN_KEY, refreshToken, refreshSettings.maxAge);
  }
}

function clearAuthCookies(): void {
  deleteCookie(AUTH_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}

function getToken(): string | null {
  return getCookie(AUTH_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

function extractErrorMessage(errorData: unknown): string {
  if (typeof errorData === 'string') {
    return errorData;
  }
  if (errorData && typeof errorData === 'object') {
    const error = errorData as Record<string, unknown>;
    if ('detail' in error && typeof error.detail === 'string') {
      return error.detail;
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
    if ('title' in error && typeof error.title === 'string') {
      return error.title;
    }
  }
  return 'Authentication failed';
}

function isSessionResponse(data: unknown): data is { user: UserData; session: SessionData } {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    d.user !== null &&
    d.session !== null &&
    typeof (d.user as Record<string, unknown>)?.id === 'string' &&
    typeof (d.session as Record<string, unknown>)?.token === 'string'
  );
}

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedPassword = sanitizeInput(password);
  const sanitizedName = sanitizeInput(name);

  const nameValidation = validateName(sanitizedName);
  if (!nameValidation.isValid) {
    return {
      user: null,
      session: null,
      error: { field: 'name', message: nameValidation.error }
    };
  }

  const emailValidation = validateEmail(sanitizedEmail);
  if (!emailValidation.isValid) {
    return {
      user: null,
      session: null,
      error: { field: 'email', message: emailValidation.error }
    };
  }

  const passwordValidation = validatePassword(sanitizedPassword);
  if (!passwordValidation.isValid) {
    return {
      user: null,
      session: null,
      error: { field: 'password', message: passwordValidation.error }
    };
  }

  try {
    const response = await fetch(`/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sanitizedEmail,
        password: sanitizedPassword,
        name: sanitizedName,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();

      try {
        const errorData = JSON.parse(text);
        return {
          user: null,
          session: null,
          error: { field: 'general', message: extractErrorMessage(errorData) }
        };
      } catch {
        return {
          user: null,
          session: null,
          error: { field: 'general', message: text || 'Registration failed' }
        };
      }
    }

    const data = await response.json();

    if (isSessionResponse(data)) {
      setAuthCookies(data.session.token, data.session.refresh_token);
    }

    return {
      user: data.user,
      session: data.session,
      error: null
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: {
        field: 'general',
        message: error instanceof Error ? error.message : 'Registration failed'
      }
    };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const sanitizedEmail = sanitizeInput(email);
  const sanitizedPassword = sanitizeInput(password);

  const emailValidation = validateEmail(sanitizedEmail);
  if (!emailValidation.isValid) {
    return {
      user: null,
      session: null,
      error: { field: 'email', message: emailValidation.error }
    };
  }

  if (!sanitizedPassword) {
    return {
      user: null,
      session: null,
      error: { field: 'password', message: 'Password is required' }
    };
  }

  try {
    const response = await fetch(`/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sanitizedEmail,
        password: sanitizedPassword,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();

      try {
        const errorData = JSON.parse(text);
        return {
          user: null,
          session: null,
          error: { field: 'general', message: extractErrorMessage(errorData) }
        };
      } catch {
        return {
          user: null,
          session: null,
          error: { field: 'general', message: text || 'Login failed' }
        };
      }
    }

    const data = await response.json();

    if (isSessionResponse(data)) {
      setAuthCookies(data.session.token, data.session.refresh_token);
    }

    return {
      user: data.user,
      session: data.session,
      error: null
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: {
        field: 'general',
        message: error instanceof Error ? error.message : 'Login failed'
      }
    };
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (refreshToken) {
      headers['Authorization'] = `Bearer ${refreshToken}`;
    }

    // Use the refresh token from cookies if not provided in headers
    const response = await fetch(`/api/auth/refresh`, {
      method: 'POST',
      headers,
      credentials: 'include'  // Important: include cookies in the request
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    if (data.session?.token) {
      // Update cookies with new tokens (if they are not HttpOnly)
      // The backend will also set them via Set-Cookie headers
      setAuthCookies(data.session.token, data.session.refresh_token);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Auth] Token refresh error:', error);
    return false;
  }
}

export function signOut(): void {
  const token = getToken();

  // Call the logout endpoint to blacklist the token
  fetch(`/api/auth/sign-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  }).catch(() => {
    // Ignore errors during logout
  });

  clearAuthCookies();
}

export async function getSession(shouldRetry: boolean = true): Promise<{ user: UserData; session: SessionData } | null> {
  const token = getToken();

  // Even if no token is found in client-side cookies, the backend might have an HttpOnly cookie
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/auth/get-session`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      // If unauthorized, try to refresh (we might have an HttpOnly refresh cookie)
      if ((response.status === 401 || response.status === 403) && shouldRetry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return getSession(false);
        }
      }
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    const data = await response.json();

    if (isSessionResponse(data) && data.user) {
      return { user: data.user, session: data.session };
    }

    // If we got a 200 response but no user/session (e.g. access token expired),
    // try to refresh using the HttpOnly refresh cookie
    if (shouldRetry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return getSession(false);
      }
    }

    return null;
  } catch (error) {
    console.warn('[Auth] Session check failed:', error);
    // Try to refresh if there's a network error or other issue
    // We attempt refresh regardless of client-side token presence
    try {
      if (shouldRetry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return getSession(false);
        }
      }
    } catch (e) {
      console.error('[Auth] Refresh attempt failed:', e);
    }
    return null;
  }
}
