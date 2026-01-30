import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { TaskProvider } from "../contexts/TaskContext";
import ChatLayoutClient from "@/components/chat/ChatLayoutClient";

export const metadata: Metadata = {
  title: "AI Conversational Todo",
  description: "Manage tasks with AI-powered conversations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: any;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.platform.openai.com/deployments/chatkit/chatkit.css"
        />
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <AuthProvider>
          <TaskProvider>
            <ChatLayoutClient>
              {children}
            </ChatLayoutClient>
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


