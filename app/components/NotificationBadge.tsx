import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useNotifications from '../hooks/useNotifications';
import NotificationCenter from './NotificationCenter';

interface NotificationBadgeProps {
  size?: number;
  color?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 24,
  color = '#4B5563',
}) => {
  const { unreadCount } = useNotifications();
  const [isNotificationCenterVisible, setIsNotificationCenterVisible] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (unreadCount > 0) {
      // Create a pulse animation when new notifications arrive
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [unreadCount, pulseAnim]);

  const toggleNotificationCenter = () => {
    setIsNotificationCenterVisible(!isNotificationCenterVisible);
  };

  return (
    <>
      <TouchableOpacity onPress={toggleNotificationCenter} style={styles.container}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
        </Animated.View>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <NotificationCenter
        visible={isNotificationCenterVisible}
        onClose={() => setIsNotificationCenterVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationBadge; 