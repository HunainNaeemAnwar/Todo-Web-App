"use client";

import React, { memo } from "react";
import { useChat } from "@/context/ChatContext";
import ChatWrapper from "@/components/chat/ChatWrapper";

const ChatModalComponent = () => {
  const { isOpen } = useChat();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-20 right-6 z-50 transition-all duration-300 ${
        isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 relative" style={{ width: "380px", height: "600px" }}>
        <ChatWrapper />
      </div>
    </div>
  );
};

export default memo(ChatModalComponent);
