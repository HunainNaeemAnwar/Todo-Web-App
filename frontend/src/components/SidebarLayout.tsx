'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { NotificationBell, NotificationCenter } from './notifications/NotificationCenter';
import {
  Home,
  User as UserIcon,
  TrendingUp,
  Calendar,
  ChevronLeft,
  Menu,
  LogOut,
  Loader2,
} from 'lucide-react';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
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
    <div className="min-h-screen bg-main flex transition-colors duration-700">
      {/* Cinematic Background Detail */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-primary/5 rounded-full blur-[160px] animate-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-secondary/5 rounded-full blur-[140px] animate-glow" style={{ animationDelay: '-2s' }} />
      </div>

      <aside
        className={`${sidebarOpen ? 'w-64 md:w-72' : 'w-16 md:w-24'} glass border-r border-white/5 backdrop-blur-xl transition-all duration-500 flex flex-col fixed left-0 top-0 h-screen z-20 ${isMobile ? 'z-50 overflow-hidden' : ''}`}
      >
        <div className="p-4 md:p-8 flex items-center gap-3 md:gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 md:p-3 rounded-xl glass glass-interactive border-white/10 text-neutral-grey hover:text-accent-primary hover:border-accent-primary/40 group"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /> : <Menu className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-180 duration-500" />}
          </button>
        </div>

        <nav className="flex-1 px-2 md:px-4 py-4 md:py-8 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <li key={item.href} className="list-none">
                <Link
                  href={item.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 p-3 md:p-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'glass-elevated bg-accent-primary/10 text-accent-primary'
                      : 'text-neutral-grey hover:text-neutral-lavender hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-5 md:h-6 bg-accent-primary rounded-full blur-[2px] animate-pulse" />
                  )}
                  <item.icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && (
                    <span className="font-medium tracking-wide whitespace-nowrap overflow-hidden text-sm md:text-base">
                      {item.label}
                    </span>
                  )}
                  {isActive && sidebarOpen && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_oklch(0.82_0.12_85)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </nav>

        <div className="p-4 md:p-6 border-t border-white/5 bg-white/5 backdrop-blur-sm mt-auto">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 group cursor-pointer">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl glass glass-glow border-accent-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-accent-primary/10 group-hover:bg-accent-primary/20 transition-colors" />
              <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-accent-primary relative z-10" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-neutral-lavender font-bold truncate tracking-tight text-sm md:text-base">{user?.name || 'Explorer'}</p>
                <p className="text-neutral-grey text-xs truncate font-medium">Verified Account</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                signOut();
                router.push('/');
              }}
              className="w-full flex items-center justify-center gap-2 p-2 md:p-3 rounded-xl glass glass-interactive border-status-error/10 text-status-error/80 hover:text-status-error hover:border-status-error/30 hover:bg-status-error/5 transition-all group"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className={`flex-1 flex flex-col relative z-10 ${isMobile ? (sidebarOpen ? 'ml-64' : 'ml-16') : (sidebarOpen ? 'ml-64 md:ml-72' : 'ml-16 md:ml-24')}`}>
        <header className="p-6 flex items-center justify-between relative flex-shrink-0">
          <div className="absolute inset-0 glass-header border-b border-white/5 opacity-50 pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-grey">Status:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-status-success/10 border border-status-success/20 text-[10px] font-bold text-status-success uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success mr-2 animate-pulse" />
                Operational
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <NotificationBell onOpenChange={setNotificationOpen} />
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10 overflow-auto relative">
          {/* Internal Content Glow */}
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
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
