"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ChatProvider } from "@/context/ChatContext";

const ChatToggleButton = dynamic(
  () => import("@/components/chat/ChatToggleButton"),
  { ssr: false }
);

const ChatModal = dynamic(
  () => import("@/components/chat/ChatModal"),
  { ssr: false }
);

export default function ChatLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDedicatedChatPage = pathname === "/chat";

  return (
    <ChatProvider>
      {children}
      {!isDedicatedChatPage && (
        <>
          <ChatModal />
          <ChatToggleButton />
        </>
      )}
    </ChatProvider>
  );
}
