import { NextRequest, NextResponse } from 'next/server';

/**
 * ChatKit Session Endpoint Proxy
 * Forwards session requests to FastAPI backend
 *
 * Key pattern: Auth token can be in Authorization header OR cookies
 * The backend checks both, so we need to forward cookies as well
 */
export async function POST(request: NextRequest) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    // Get all relevant headers
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    // Build headers for backend - forward auth if available
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    // Get request body if present
    let body: string | undefined;
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const jsonBody = await request.json();
        body = JSON.stringify(jsonBody);
      } catch {
        // Ignore JSON parse errors
      }
    }

    console.log('[ChatKit Session] Forwarding to backend:', {
      url: `${backendUrl}/api/chatkit/session`,
      hasAuth: !!authHeader,
      hasCookie: !!cookieHeader,
    });

    // Forward to FastAPI backend
    const response = await fetch(`${backendUrl}/api/chatkit/session`, {
      method: 'POST',
      headers,
      body,
      credentials: 'include',
    });

    // Log response status for debugging
    console.log('[ChatKit Session] Backend response:', response.status);

    if (!response.ok) {
      // Handle non-JSON error responses
      const responseContentType = response.headers.get('content-type');
      const text = await response.text();

      console.error('[ChatKit Session] Backend error:', response.status, text);

      if (
        !responseContentType ||
        !responseContentType.includes('application/json')
      ) {
        return NextResponse.json(
          { error: text || 'Session creation failed' },
          { status: response.status }
        );
      }

      try {
        const errorData = JSON.parse(text);
        return NextResponse.json(errorData, { status: response.status });
      } catch {
        return NextResponse.json(
          { error: 'Session creation failed' },
          { status: response.status }
        );
      }
    }

    const data = await response.json();

    console.log('[ChatKit Session] Success:', {
      hasClientSecret: !!data.client_secret,
      hasDomainKey: !!data.domain_key,
    });

    // Validate response data
    if (!data.client_secret || !data.domain_key) {
      console.error('[ChatKit Session] Invalid response from backend:', data);
      return NextResponse.json(
        { error: 'Invalid session data from backend' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[ChatKit Session] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create session', message: String(error) },
      { status: 500 }
    );
  }
}
