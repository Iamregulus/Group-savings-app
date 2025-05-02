import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { formatDistanceToNow, parseISO } from 'date-fns';
import '../../styles/notifications.css';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0
  });

  // Fetch notifications with pagination
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications({
        limit: pagination.limit,
        offset: pagination.offset
      });
      
      setNotifications(response.data.notifications);
      setPagination(prev => ({
        ...prev,
        total: response.data.meta.total
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [pagination.offset, pagination.limit]);

  // Mark a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;
    
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit)
      }));
    }
  };

  // Get notification type display class
  const getNotificationTypeClass = (type) => {
    switch(type) {
      case 'contribution':
        return 'contribution';
      case 'withdrawal_request':
        return 'withdrawal_request';
      case 'withdrawal_completed':
        return 'withdrawal_completed';
      case 'withdrawal_rejected':
        return 'withdrawal_rejected';
      default:
        return '';
    }
  };

  // Get human-readable notification type
  const getNotificationTypeLabel = (type) => {
    switch(type) {
      case 'contribution':
        return 'Contribution';
      case 'withdrawal_request':
        return 'Withdrawal Request';
      case 'withdrawal_completed':
        return 'Withdrawal Approved';
      case 'withdrawal_rejected':
        return 'Withdrawal Rejected';
      default:
        return type.replace('_', ' ');
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-page-header">
        <h1>Notifications</h1>
        <Button 
          variant="outline" 
          onClick={handleMarkAllAsRead}
          disabled={notifications.length === 0 || notifications.every(n => n.isRead)}
        >
          Mark all as read
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <div className="notification-loading">Loading notifications...</div>
        </Card>
      ) : notifications.length > 0 ? (
        <div className="notifications-list">
          {notifications.map(notification => (
            <Card key={notification.id} className={`notification-card ${!notification.isRead ? 'unread' : ''}`}>
              {!notification.isRead && <div className="notification-indicator"></div>}
              <div className="notification-card-content">
                <p>{notification.message}</p>
                <div className="notification-card-meta">
                  <span className="notification-card-time">
                    {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                  </span>
                  <span className={`notification-card-type ${getNotificationTypeClass(notification.notificationType)}`}>
                    {getNotificationTypeLabel(notification.notificationType)}
                  </span>
                </div>
              </div>
              {!notification.isRead && (
                <div className="notification-actions">
                  <button 
                    className="notification-mark-read"
                    onClick={() => handleMarkAsRead(notification.id)}
                    aria-label="Mark as read"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="no-notifications">You don't have any notifications</div>
        </Card>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="notification-pagination">
          <button 
            className="pagination-button"
            onClick={handlePrevPage}
            disabled={pagination.offset === 0}
          >
            Previous
          </button>
          <span className="pagination-current">
            {Math.floor(pagination.offset / pagination.limit) + 1}
          </span>
          <button 
            className="pagination-button"
            onClick={handleNextPage}
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