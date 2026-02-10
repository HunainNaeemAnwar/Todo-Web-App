import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { TaskProvider } from "../context/TaskContext";
import { ThemeProvider } from "../context/ThemeContext";
import ChatLayoutClient from "@/components/chat/ChatLayoutClient";

export const metadata: Metadata = {
  title: "TaskFlow Luxury | AI Conversational Todo",
  description: "Experience premium task management with AI-powered conversations in a luxury glassmorphism interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Polyfill for crypto.randomUUID - required for non-HTTPS contexts
              (function() {
                if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
                  crypto.randomUUID = function() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                      return v.toString(16);
                    });
                  };
                }
                // Also ensure window.crypto is available
                if (typeof window !== 'undefined' && !window.crypto) {
                  window.crypto = crypto;
                }
              })();
            `,
          }}
        />
        <script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
        />
      </head>
      <body className="min-h-screen bg-background font-body antialiased selection:bg-accent-primary/30">
        <ThemeProvider defaultTheme="luxury">
          <AuthProvider>
            <TaskProvider>
              <div className="relative min-h-screen overflow-hidden bg-main">
                {/* Global Luxury Background Detail */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                  <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent-primary/5 blur-[160px]" />
                  <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent-secondary/5 blur-[160px]" />
                </div>

                <div className="relative z-10">
                  <ChatLayoutClient>
                    {children}
                  </ChatLayoutClient>
                </div>
              </div>
            </TaskProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


