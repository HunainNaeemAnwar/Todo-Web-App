"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function LandingPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const result = await signUp(email, password, name);
        if (result.error) {
          setError(result.error);
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            AI Conversational Todo
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Manage your tasks with AI-powered conversations. Built with Next.js, FastAPI, and OpenAI.
          </p>
        </div>

        {/* Auth Form */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isSignUp ? "Create Account" : "Sign In"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                  {isSignUp && <span className="text-xs text-gray-500 ml-1">(min 8 characters)</span>}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="text-xl font-medium text-gray-900">🤖 AI-Powered</div>
              <div className="mt-2 text-gray-500">
                Use natural language to manage tasks through conversational AI.
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="text-xl font-medium text-gray-900">🔧 Full-Stack</div>
              <div className="mt-2 text-gray-500">
                Built with Next.js frontend and FastAPI backend with PostgreSQL.
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="text-xl font-medium text-gray-900">🛡️ Secure</div>
              <div className="mt-2 text-gray-500">
                JWT authentication with user isolation and secure API endpoints.
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-16 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-green-800 mb-2">✅ Ready to Use</h3>
            <p className="text-green-700">
              Backend running on <a href="http://localhost:8000" className="text-blue-600 hover:text-blue-800" target="_blank">http://localhost:8000</a> |
              API docs at <a href="http://localhost:8000/docs" className="text-blue-600 hover:text-blue-800" target="_blank">/docs</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}