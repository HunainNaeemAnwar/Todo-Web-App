"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/contexts/AuthContext";

export default function ChatToggleButton() {
  const { isOpen, toggleChat } = useChat();
  const { user } = useAuth();

  // Only show the chat button if the user is logged in
  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleChat}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 group ${
          isOpen
            ? "bg-gray-700 hover:bg-gray-800 scale-95"
            : "bg-purple-600 hover:bg-purple-700 hover:scale-105"
        }`}
        aria-label={isOpen ? "Close AI Chat Assistant" : "Open AI Chat Assistant"}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-7 h-7 text-white group-hover:animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {isOpen ? "Close Chat" : "AI Chat Assistant"}
        </span>
      </button>
    </div>
  );
}
