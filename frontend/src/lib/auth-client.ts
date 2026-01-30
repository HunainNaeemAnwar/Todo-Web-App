const AUTH_COOKIE = 'auth_token';
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function setCookie(name: string, value: string, expires?: Date): void {
  if (typeof document === 'undefined') return;
  const expiresStr = expires ? `; expires=${expires.toUTCString()}` : '';
  document.cookie = `${name}=${value}${expiresStr}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [n, v] = cookie.trim().split('=');
    if (n === name) return v;
  }
  return null;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<{ user: unknown; session: unknown; error: unknown }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { user: null, session: null, error: errorData };
    }

    const data = await response.json();
    if (data.session?.token) {
      setCookie(AUTH_COOKIE, data.session.token);
    }
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return { user: null, session: null, error: { message: error instanceof Error ? error.message : 'Registration failed' } };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: unknown; session: unknown; error: unknown }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { user: null, session: null, error: errorData };
    }

    const data = await response.json();
    if (data.session?.token) {
      setCookie(AUTH_COOKIE, data.session.token);
    }
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return { user: null, session: null, error: { message: error instanceof Error ? error.message : 'Login failed' } };
  }
}

export function signOut(): void {
  deleteCookie(AUTH_COOKIE);
}

export async function getSession(): Promise<{ user: unknown; session: unknown } | null> {
  const token = getCookie(AUTH_COOKIE);
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/api/auth/get-session`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.user ? { user: data.user, session: data.session } : null;
  } catch {
    return null;
  }
}
