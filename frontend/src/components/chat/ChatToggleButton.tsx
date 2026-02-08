"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

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
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggleChat();
        }}
        className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg transition-all duration-200 group ${
          isOpen
            ? "glass hover:bg-white/10 scale-95"
            : "bg-accent-primary hover:bg-accent-secondary hover:scale-105"
        }`}
        aria-label={isOpen ? "Close AI Chat Assistant" : "Open AI Chat Assistant"}
      >
        {isOpen ? (
          <svg
            className="w-5 h-5 md:w-6 md:h-6 text-text-primary"
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
            className="w-6 h-6 md:w-7 md:h-7 text-text-primary group-hover:animate-pulse"
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
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-depth-900 text-text-primary text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
          {isOpen ? "Close Chat" : "AI Chat Assistant"}
        </span>
      </button>
    </div>
  );
}
