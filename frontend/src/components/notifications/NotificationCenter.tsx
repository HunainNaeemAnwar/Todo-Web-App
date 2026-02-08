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
      className="relative p-2 md:p-3 rounded-xl glass text-neutral-grey hover:text-accent-primary transition-colors"
    >
      <Bell className="w-5 h-5 md:w-6 md:h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-error rounded-full text-[10px] md:text-xs flex items-center justify-center text-white font-bold animate-pulse">
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
        className="fixed inset-0 bg-black/70 z-40 animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed right-2  md:right-6 md:left-auto top-20 w-72 md:w-96 max-h-[50vh] md:max-h-[70vh] glass border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-display font-bold text-text-secondary flex items-center gap-2">
            <Bell className="w-4 h-4 text-neutral-grey" />
            Notifications
            {totalCount > 0 && (
              <span className="text-xs bg-error/20 text-error px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-accent-primary hover:text-accent-secondary"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-grey hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(50vh-80px)] md:max-h-96 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-neutral-grey">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50 text-neutral-grey" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-white/5 transition-colors ${
                    !notification.read ? 'bg-accent-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                         <p className={`font-medium ${!notification.read ? 'text-text-secondary' : 'text-neutral-grey'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-accent-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-neutral-grey truncate">{notification.message}</p>
                      <p className="text-xs text-neutral-grey/60 mt-1">{formatTime(notification.created_at)}</p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-grey hover:text-status-success transition-colors"
                        title="Mark as read"
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
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => fetchNotifications(false)}
              disabled={loading}
              className="w-full py-2 text-sm text-accent-primary hover:text-accent-secondary disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
