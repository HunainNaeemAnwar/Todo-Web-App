import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
  ],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: "task-manager",
  },
});
