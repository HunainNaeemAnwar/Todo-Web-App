import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // Create a transform stream to handle the SSE format
  const encoder = new TextEncoder();

  // Create a readable stream for the response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Get the user's auth token from cookies or headers
        const authToken = request.headers.get('authorization') || '';
        const cookieHeader = request.headers.get('cookie');

        // Forward the request to the backend ChatKit endpoint
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const backendResponse = await fetch(`${backendUrl}/chatkit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': authToken }),
            ...(cookieHeader && { 'Cookie': cookieHeader }),
          },
          body: await request.text(),
        });

        if (!backendResponse.body) {
          controller.error(new Error('No response body'));
          return;
        }

        // Create a reader for the backend response
        const reader = backendResponse.body.getReader();

        // Process the response from the backend
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Write the chunk to the response, with error handling
          try {
            controller.enqueue(value);
          } catch (enqueueError) {
            console.warn('Could not enqueue data (controller may be closed)', enqueueError);
            break;
          }
        }
      } catch (error) {
        console.error('Chat API error:', error);
        // Only send error if controller is not already closed
        try {
          const errorText = `event: error\ndata: ${JSON.stringify({ error: 'Internal server error' })}\n\n`;
          controller.enqueue(encoder.encode(errorText));
        } catch (enqueueError) {
          // Ignore enqueue errors if controller is already closed
          console.warn('Could not send error to client (controller may be closed)');
        }
      } finally {
        // Only close if not already closed
        try {
          controller.close();
        } catch (closeError) {
          // Controller might already be closed, ignore the error
          console.warn('Controller already closed');
        }
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}