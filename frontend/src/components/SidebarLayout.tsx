'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import type { UserData } from '../lib/auth-client';
import { NotificationBell, NotificationCenter } from './notifications/NotificationCenter';
import {
  Home,
  SquarePen,
  User as UserIcon,
  TrendingUp,
  Calendar,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
  Loader2,
} from 'lucide-react';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/user', icon: UserIcon, label: 'Profile' },
    { href: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { href: '/calendar', icon: Calendar, label: 'Calendar' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 flex">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} glass-effect transition-all duration-300 flex flex-col relative z-10 ${isMobile ? 'fixed left-0 top-0 h-full z-50' : ''}`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <SquarePen className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <h1 className="text-xl font-display font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent whitespace-nowrap">
              TaskFlow
            </h1>
          )}
        </div>

        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-slate-700/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-text-secondary text-sm truncate">{user?.email || 'user@example.com'}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col relative z-10">
        <header className="glass-effect p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg glass-effect text-text-primary hover:bg-accent-light-orange transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell onOpenChange={setNotificationOpen} />
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </div>
      </main>

      <NotificationCenter
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        onNotificationRead={() => {}}
      />
    </div>
  );
}
