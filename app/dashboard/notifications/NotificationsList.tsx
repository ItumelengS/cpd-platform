'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
  type: string;
}

type FilterType = 'all' | 'unread';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const router = useRouter();

  const fetchNotifications = async (currentFilter: FilterType) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notifications?filter=${currentFilter}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);

        // Auto-mark unread as read when viewing the page
        const unreadIds = data.notifications
          .filter((n: Notification) => !n.read)
          .map((n: Notification) => n.id);

        if (unreadIds.length > 0) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds: unreadIds }),
          });

          // Update local state to mark as read
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter]);

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) {
      return;
    }

    setIsClearingAll(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications([]);
      } else {
        alert('Failed to clear notifications');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      alert('Failed to clear notifications');
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_FOLLOWER':
        return '👤';
      case 'NEW_COURSE':
      case 'COURSE_PUBLISHED':
        return '📚';
      case 'COURSE_APPROVED':
        return '✅';
      case 'COURSE_REJECTED':
        return '❌';
      default:
        return '🔔';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Unread
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
            >
              {isClearingAll ? 'Clearing...' : 'Clear All'}
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? "You're all caught up!"
                : "We'll notify you when something important happens"}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-6 transition-colors ${
                notification.link ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-3xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {notification.link && (
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
