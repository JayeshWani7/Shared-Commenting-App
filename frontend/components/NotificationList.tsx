import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { notificationsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Check, CheckCheck, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'comment_reply' | 'comment_mention';
  commentId?: string;
  triggeredByUser?: {
    id: string;
    username: string;
  };
}

export default function NotificationList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const { data, isLoading, refetch } = useQuery(
    ['notifications'],
    () => notificationsApi.getNotifications().then(res => res.data),
    {
      enabled: !!user,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const markAsReadMutation = useMutation(
    (id: string) => notificationsApi.markAsRead(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['notifications', 'unread-count']);
      },
    }
  );

  const markAllAsReadMutation = useMutation(
    () => notificationsApi.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['notifications', 'unread-count']);
      },
    }
  );

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to the comment if it exists
    if (notification.commentId) {
      router.push(`/?comment=${notification.commentId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.notifications?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>No notifications yet</p>
      </div>
    );
  }

  const unreadCount = data.notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <div className="max-h-96 overflow-y-auto">
      {unreadCount > 0 && (
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isLoading}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4 inline mr-1" />
              Mark all as read
            </button>
          </div>
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {data.notifications.map((notification: Notification) => (
          <div
            key={notification.id}
            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
              !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-400' : ''
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {notification.type === 'comment_reply' ? (
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Bell className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        disabled={markAsReadMutation.isLoading}
                        className="flex-shrink-0 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {!notification.isRead && (
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
