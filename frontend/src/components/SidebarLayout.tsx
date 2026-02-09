'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { NotificationBell, NotificationCenter } from './notifications/NotificationCenter';
import { ThemeToggleButton } from './common/ThemeToggleButton';
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
  const [isAnimating, setIsAnimating] = useState(false);

  // Check mobile and set initial sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle sidebar toggle with animation lock
  const toggleSidebar = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSidebarOpen(!sidebarOpen);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Handle navigation - only close on mobile, don't reopen
  const handleNavigation = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    // Desktop pe sidebar open hi rehta hai, koi animation nahi
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
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
    <div className="min-h-screen bg-main flex">
      {/* Mobile Overlay - Click to close only */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen z-50
          bg-secondary border-r border-white/5
          transition-all duration-300 ease-out
          flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-16'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b border-white/5 flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/5 text-secondary hover:text-primary transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          
          {sidebarOpen && (
            <span className="ml-3 font-display font-bold text-lg text-primary tracking-tight truncate">
              TaskFlow
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavigation}
                className={`
                  relative flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                  transition-all duration-200 group
                  ${isActive
                    ? 'text-accent-primary bg-accent-primary/5'
                    : 'text-secondary hover:text-primary hover:bg-white/5'
                  }
                `}
              >
                {/* Active Indicator - Left Side Straight Line (Quote Style) */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent-primary rounded-full"
                    style={{
                      boxShadow: '0 0 8px var(--accent-primary)'
                    }}
                  />
                )}
                
                {/* Icon */}
                <item.icon 
                  className={`
                    w-5 h-5 flex-shrink-0 transition-transform duration-200
                    ${isActive ? 'text-accent-primary' : 'group-hover:scale-110'}
                  `} 
                />
                
                {/* Label */}
                {sidebarOpen && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - User & Sign Out */}
        <div className="flex-shrink-0 p-4 border-t border-white/5 mt-auto">
          {/* User Profile */}
          <div 
            className={`
              flex flex-col items-center gap-3 mb-3 p-2 rounded-lg
              ${sidebarOpen ? 'bg-white/5' : ''}
            `}
          >
            <div className="w-9 h-9 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-accent-primary" />
            </div>
            
            {sidebarOpen && (
              <div className="flex-1 min-w-0 overflow-hidden text-center">
                <p className="text-sm font-medium text-primary truncate">
                  {user?.name || 'Explorer'}
                </p>
                <p className="text-xs text-tertiary truncate">
                  {user?.email || 'Verified'}
                </p>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              signOut();
              router.push('/');
            }}
            className={`
              flex items-center justify-center gap-2 
              rounded-lg transition-colors
              text-status-error hover:bg-status-error/10
              ${sidebarOpen ? 'w-full px-3 py-2.5 text-sm font-medium' : 'w-full p-2'}
            `}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`
          flex-1 flex flex-col min-h-screen
          transition-all duration-300 ease-out
          ${sidebarOpen ? 'md:pl-64' : 'md:pl-16'}
        `}
      >
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-main/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Only show when sidebar closed */}
            {isMobile && !sidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-white/5 text-secondary"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Status
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-status-success/10 text-status-success text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell onOpenChange={setNotificationOpen} />
            <ThemeToggleButton />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 overflow-auto">
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