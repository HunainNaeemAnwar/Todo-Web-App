"use client";

import React, { memo, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import ChatContainer from './ChatContainer';

interface ChatWrapperProps {
  className?: string;
  onReady?: () => void;
}

const ChatWrapperComponent = ({ className, onReady }: ChatWrapperProps) => {
  const { session: chatSession, loading: chatLoading, error: chatError, startConversation } = useChat();
  const { user, loading: authLoading } = useAuth();

  // Log auth state for debugging
  useEffect(() => {
    console.log('[ChatWrapper] Auth state:', { 
      userId: user?.id, 
      authLoading, 
      chatLoading,
      chatSessionId: chatSession?.id,
      chatError,
      cookieString: typeof document !== 'undefined' ? document.cookie : 'N/A'
    });
  }, [user, authLoading, chatLoading, chatSession, chatError]);

  // Auto-start conversation when auth is ready
  useEffect(() => {
    if (!authLoading && user && !chatSession && !chatLoading && !chatError) {
      console.log('[ChatWrapper] Starting conversation...');
      startConversation().catch(err => {
        console.error('[ChatWrapper] Failed to start conversation:', err);
      });
    }
  }, [user, authLoading, chatSession, chatLoading, chatError, startConversation]);

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className={`flex items-center justify-center h-full w-full bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className={`flex items-center justify-center h-full w-full bg-yellow-50 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-600">Please log in to use the AI assistant</p>
          <p className="text-sm text-yellow-500 mt-2">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  if (chatError) {
    return (
      <div className={`flex items-center justify-center h-full w-full bg-red-50 rounded-lg p-4 ${className}`}>
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-red-600 mb-2">AI Assistant Error</h3>
          <p className="text-red-600 mb-2">{chatError}</p>
          <div className="mt-4 space-x-2">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => startConversation()}
            >
              Retry
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (chatLoading) {
    return (
      <div className={`flex items-center justify-center h-full w-full bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Initializing AI assistant...</p>
          <p className="text-xs text-gray-500 mt-1">Establishing secure session</p>
        </div>
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className={`flex items-center justify-center h-full w-full bg-blue-50 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <h3 className="text-lg font-medium text-blue-800 mb-2">Starting AI Assistant...</h3>
          <p className="text-blue-600">Establishing secure session</p>
          <p className="text-sm text-blue-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <ChatContainer
      className={className}
      onReady={onReady}
    />
  );
};

export default memo(ChatWrapperComponent);