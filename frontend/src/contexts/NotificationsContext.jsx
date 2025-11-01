/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const NotificationsContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    try {
      setNotificationsLoading(true);
      const response = await api.get('/api/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      // Ignore errors caused by unauthenticated requests
      if (error.response?.status === 401) {
        setNotifications([]);
      }
    } finally {
      setNotificationsLoading(false);
    }
  }, [userId]);

  const markNotificationRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      // Silent fail - notifications are non-critical convenience features
      // State is already updated optimistically on frontend
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    } catch (error) {
      // Silent fail - notifications are non-critical convenience features
      // State is already updated optimistically on frontend
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const value = {
    notifications,
    notificationsLoading,
    unreadNotificationCount,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;
