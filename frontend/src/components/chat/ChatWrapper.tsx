"use client";

import React, { memo } from 'react';
import { useChat } from '@/context/ChatContext';
import ChatContainer from './ChatContainer';

interface ChatWrapperProps {
  className?: string;
  onReady?: () => void;
}

const ChatWrapperComponent = ({ className, onReady }: ChatWrapperProps) => {
  const { session: chatSession, loading: chatLoading, error: chatError } = useChat();

  if (chatLoading) {
    return (
      <div className={`flex items-center justify-center h-full w-full bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Initializing AI assistant...</p>
        </div>
      </div>
    );
  }

  if (chatError) {
    return (
      <div className={`flex items-center justify-center h-full w-full bg-red-50 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">AI Assistant Error</h3>
          <p className="text-red-600 mb-2">{chatError}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className={`flex items-center justify-center h-full w-full bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Initializing...</h3>
          <p className="text-gray-600">Setting up your AI assistant</p>
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