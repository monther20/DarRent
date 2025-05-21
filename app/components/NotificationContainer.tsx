import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import NotificationToast from './NotificationToast';
import useNotifications from '../hooks/useNotifications';

const NotificationContainer: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);
  const [showingNotification, setShowingNotification] = useState<boolean>(false);

  // Check for new notifications
  useEffect(() => {
    // If we're not already showing a notification
    if (!showingNotification) {
      // Find the first unread notification
      const unreadNotification = notifications.find(
        n => !n.read && !visibleNotifications.includes(n.id)
      );
      
      if (unreadNotification) {
        setVisibleNotifications(prev => [...prev, unreadNotification.id]);
        setShowingNotification(true);
      }
    }
  }, [notifications, showingNotification, visibleNotifications]);

  const handleClose = (id: string) => {
    markAsRead(id);
    setVisibleNotifications(prev => prev.filter(notifId => notifId !== id));
    setShowingNotification(false);
  };

  // Use type assertion to allow pointerEvents prop
  const OverlayView = View as any;
  const CenteredView = View as any;

  return (
    <OverlayView style={styles.overlay} pointerEvents="box-none">
      {notifications
        .filter(notification => visibleNotifications.includes(notification.id))
        .map(notification => (
          <CenteredView key={notification.id} style={styles.centered} pointerEvents="auto">
            <NotificationToast
              notification={notification}
              onClose={handleClose}
            />
          </CenteredView>
        ))}
    </OverlayView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  centered: {
    width: '100%',
    alignItems: 'center',
  },
});

export default NotificationContainer; 