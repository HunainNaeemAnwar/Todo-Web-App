'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, Loader2 } from 'lucide-react';
import { userService, type Notification } from '@/services/userService';

interface NotificationBellProps {
  onOpenChange: (open: boolean) => void;
}

export function NotificationBell({ onOpenChange }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await userService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  useEffect(() => {
    const initNotifications = async () => {
      await userService.triggerNotificationCheck();
      await fetchUnreadCount();
    };
    initNotifications();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <button
      onClick={() => onOpenChange(true)}
      className="relative p-3 rounded-xl glass-panel glass-interactive border-white/5 text-secondary hover:text-accent-primary transition-all group"
    >
      <Bell className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:scale-110" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-error rounded-full text-[10px] flex items-center justify-center text-primary font-bold animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationRead: () => void;
}

export function NotificationCenter({ isOpen, onClose, onNotificationRead }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const currentCursor = reset ? undefined : cursor;
      const response = await userService.getNotifications(20, currentCursor);
      setTotalCount(response.total_count);

      if (reset || !cursor) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }

      setCursor(response.next_cursor);
      setHasMore(!!response.next_cursor);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true);
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await userService.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setTotalCount(prev => Math.max(0, prev - 1));
      onNotificationRead();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await userService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setTotalCount(0);
      onNotificationRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'due_soon':
        return '⏰';
      case 'overdue':
        return '⚠️';
      case 'streak':
        return '🔥';
      case 'task_completed':
        return '✅';
      default:
        return '📢';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed right-4 md:right-8 top-24 w-[calc(100vw-32px)] md:w-[420px] max-h-[70vh] glass-panel border-white/10 rounded-[32px] shadow-2xl z-50 overflow-hidden animate-scale-in bg-depth-950/80 backdrop-blur-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-foreground flex items-center gap-3">
            <Bell className="w-5 h-5 text-accent-primary" />
            Intelligence Feed
            {totalCount > 0 && (
              <span className="glass-badge glass-badge-error text-[10px] px-2 py-0.5 ml-2">
                {totalCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-4">
            {totalCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold uppercase tracking-widest text-accent-primary hover:text-accent-secondary transition-colors font-accent"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-panel glass-interactive border-white/5 text-secondary hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(70vh-100px)] overflow-y-auto glass-scroll">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Bell className="w-8 h-8 opacity-20 text-secondary" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary font-accent">Zero Signal Detected</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 transition-all duration-300 ${
                    !notification.read ? 'bg-accent-primary/5 hover:bg-accent-primary/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl drop-shadow-sm">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                         <p className={`font-bold tracking-tight text-sm ${!notification.read ? 'text-foreground' : 'text-secondary'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-accent-primary rounded-full flex-shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-secondary mt-1 leading-relaxed">{notification.message}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/40 mt-3 font-accent">{formatTime(notification.created_at)}</p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 rounded-lg glass-panel glass-interactive border-white/5 text-secondary hover:text-status-success transition-all"
                        title="Acknowledge"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {hasMore && (
          <div className="p-6 border-t border-white/5 bg-white/5">
            <button
              onClick={() => fetchNotifications(false)}
              disabled={loading}
              className="w-full py-3 glass-panel glass-interactive border-white/5 text-[10px] font-bold uppercase tracking-widest text-accent-primary font-accent"
            >
              {loading ? 'Fetching...' : 'Load Temporal Data'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
