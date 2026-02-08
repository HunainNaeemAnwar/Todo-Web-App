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

  // Auto-start conversation when auth is ready
  useEffect(() => {
    if (!authLoading && user && !chatSession && !chatLoading && !chatError) {
      startConversation().catch(err => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[ChatWrapper] Failed to start conversation:', err);
        }
      });
    }
  }, [user, authLoading, chatSession, chatLoading, chatError, startConversation]);

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className={`flex items-center justify-center h-full w-full glass-panel rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
          <p className="text-text-secondary mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className={`flex items-center justify-center h-full w-full glass-panel rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-text-primary mb-2">Authentication Required</h3>
          <p className="text-text-secondary">Please log in to use the AI assistant</p>
          <p className="text-sm text-text-tertiary mt-2">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  if (chatError) {
    return (
      <div className={`flex items-center justify-center h-full w-full glass-panel rounded-lg p-4 ${className}`}>
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-status-error mb-2">AI Assistant Error</h3>
          <p className="text-text-secondary mb-2">{chatError}</p>
          <div className="mt-4 space-x-2">
            <button
              className="px-4 py-2 bg-status-error text-white rounded hover:bg-status-error/80"
              onClick={() => startConversation()}
            >
              Retry
            </button>
            <button
              className="px-4 py-2 glass border-white/10 text-text-primary rounded hover:bg-white/5"
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
      <div className={`flex items-center justify-center h-full w-full glass-panel rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
          <p className="text-text-secondary mt-2">Initializing AI assistant...</p>
          <p className="text-xs text-text-tertiary mt-1">Establishing secure session</p>
        </div>
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className={`flex items-center justify-center h-full w-full glass-panel rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-3"></div>
          <h3 className="text-lg font-medium text-text-primary mb-2">Starting AI Assistant...</h3>
          <p className="text-text-secondary">Establishing secure session</p>
          <p className="text-sm text-text-tertiary mt-2">This may take a moment</p>
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