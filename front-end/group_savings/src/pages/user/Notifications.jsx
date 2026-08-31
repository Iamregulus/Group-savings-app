import React, { useState, useEffect } from 'react';
import { HiCheck } from 'react-icons/hi2';
import { notificationService } from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const TYPE_LABELS = {
  contribution: 'Contribution',
  withdrawal_request: 'Withdrawal Request',
  withdrawal_vote: 'Vote Needed',
  withdrawal_completed: 'Withdrawal Approved',
  withdrawal_rejected: 'Withdrawal Rejected',
  promoted_admin: 'Promoted to Admin',
  cashflow: 'Cash Flow',
};

const labelFor = (type) =>
  TYPE_LABELS[type] || type.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

const Notifications = () => {
  const { markAsRead, markAllAsRead, fetchUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ limit: 10, offset: 0, total: 0 });

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications({
        limit: pagination.limit,
        offset: pagination.offset,
      });
      setNotifications(response.notifications || []);
      setPagination((prev) => ({ ...prev, total: response.meta?.total || 0 }));
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.offset, pagination.limit]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={handleMarkAllAsRead}
          disabled={notifications.length === 0 || notifications.every((n) => n.isRead)}
        >
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <Loader centered size="large" />
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 flex items-start gap-3 ${!notification.isRead ? 'border-l-4 border-l-emerald-500' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {labelFor(notification.notificationType)}
                  </span>
                </div>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  aria-label="Mark as read"
                >
                  <HiCheck className="h-5 w-5" />
                </button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          You don't have any notifications
        </Card>
      )}

      {pagination.total > pagination.limit && (
        <div className="flex justify-center items-center gap-4 pt-2">
          <button
            className="text-sm text-emerald-600 dark:text-emerald-400 disabled:text-gray-300 dark:disabled:text-gray-600"
            onClick={() => setPagination((p) => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}
            disabled={pagination.offset === 0}
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {Math.floor(pagination.offset / pagination.limit) + 1}
          </span>
          <button
            className="text-sm text-emerald-600 dark:text-emerald-400 disabled:text-gray-300 dark:disabled:text-gray-600"
            onClick={() => setPagination((p) => ({ ...p, offset: p.offset + p.limit }))}
            disabled={pagination.offset + pagination.limit >= pagination.total}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
