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
      // Forward relevant headers (exclude host/connection/transfer-encoding)
      const lowerKey = key.toLowerCase();
      if (!lowerKey.startsWith('host') && 
          !lowerKey.startsWith('connection') && 
          !lowerKey.startsWith('transfer-encoding') &&
          !lowerKey.startsWith('content-length')) {
        headers.set(key, value);
      }
    });

    // Ensure we have the correct content type
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

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
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Handle JSON responses
    const responseData = await response.text();
    
    // Log error responses for debugging
    if (!response.ok) {
      console.error('[ChatKit Proxy] Backend error:', response.status, responseData);
    }

    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[ChatKit Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend', message: String(error) },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
