/**
 * Responsive header component using Tailwind CSS.
 */

import React from 'react';
import Link from 'next/link';
import { signOut, useSession } from '@/lib/better-auth-client';

const Header: React.FC = () => {
  const { data: session, isPending } = useSession();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">Task Manager</span>
            </Link>
            <nav className="ml-6 hidden md:flex space-x-4">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/tasks"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Tasks
                  </Link>
                </>
              ) : null}
            </nav>
          </div>

          <div className="flex items-center">
            {isPending ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : session?.user ? (
              <div className="flex items-center space-x-4">
                <span className="hidden md:inline text-sm text-gray-700">
                  Welcome, {session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-indigo-600 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-indigo-600 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Register
                </Link>
              </div>
            )}

            <div className="md:hidden flex items-center ml-4">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

        <div className="md:hidden hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tasks"
                  className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  My Tasks
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
    </header>
  );
};

export default Header;
