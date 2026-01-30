import { NextRequest, NextResponse } from 'next/server';

/**
 * ChatKit API Proxy
 * Forwards ChatKit requests from frontend to FastAPI backend
 */
export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    // Get all headers from the incoming request
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Forward relevant headers (exclude host/connection)
      if (!key.startsWith('host') && !key.startsWith('connection')) {
        headers.set(key, value);
      }
    });

    // Get the request body
    const body = await request.text();

    // Forward to FastAPI backend
    const response = await fetch(`${backendUrl}/api/chatkit`, {
      method: 'POST',
      headers,
      body,
    });

    // Handle streaming responses (SSE)
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle JSON responses
    const responseData = await response.text();
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[ChatKit Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
