# ChatKit Integration Guide

This document explains how the ChatKit integration is implemented in the frontend.

## Components

### 1. ChatContainer (`src/components/chat/ChatContainer.tsx`)
- Main ChatKit component that renders the chat interface
- Uses `useChatKit` hook to connect to the backend
- Configures theming, start screen prompts, header, composer, and history
- Properly handles authentication tokens through custom fetch function

### 2. ChatModal (`src/components/chat/ChatModal.tsx`)
- Modal wrapper for the ChatContainer
- Controls visibility of the chat interface
- Handles loading states and errors

### 3. ChatContext (`src/context/ChatContext.tsx`)
- Manages chat state (open/closed, session, etc.)
- Handles session initialization
- Provides custom fetch function for authentication
- Coordinates with TaskContext for refresh triggers

## API Routes

### 1. `/api/chat` (`src/app/api/chat/route.ts`)
- Main chat endpoint that ChatKit connects to
- Acts as a proxy to the backend ChatKit endpoint
- Handles authentication token forwarding
- Streams responses back to the client

### 2. `/api/chatkit/session` (`src/app/api/chatkit/session/route.ts`)
- Session initialization endpoint
- Creates ChatKit session by connecting to backend
- Handles authentication and returns session data

## Configuration

### Environment Variables
- `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY`: Domain key for ChatKit (defaults to 'local-dev')
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL (defaults to 'http://localhost:8000')
- `NEXT_PUBLIC_CHAT_API_URL`: Custom chat API URL (optional)

### Authentication
- Authentication tokens are forwarded from frontend to backend
- Tokens are extracted from cookies and headers
- Proper headers are set for all API requests

## Key Features Implemented

1. **Proper ChatKit Integration**: Uses official `@openai/chatkit-react` library
2. **Authentication**: Secure token forwarding between frontend and backend
3. **Theming**: Consistent with application design
4. **Start Screen**: Customized prompts for task management
5. **Composer Tools**: Task-specific tools for better UX
6. **History**: Conversation history management
7. **Error Handling**: Graceful error states and loading indicators
8. **Responsive Design**: Works well on different screen sizes

## Testing

A test page is available at `/test-chatkit` to verify the ChatKit integration independently.