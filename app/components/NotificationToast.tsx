import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { Notification } from '../services/mockApi';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  duration = 5000,
}) => {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-100);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    // Show the notification
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });

    // Hide after duration
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withSequence(
        withTiming(-100, { duration: 300 }, (isFinished) => {
          if (isFinished) {
            runOnJS(onClose)(notification.id);
          }
        })
      );
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.id, opacity, translateY, duration, onClose]);

  const handlePress = () => {
    // Navigate based on notification type
    if (notification.type === 'rent_accepted' && notification.data?.propertyId) {
      if (notification.data.contractAvailable) {
        router.push({
          pathname: '/(renter-tabs)/ContractReview',
          params: { 
            propertyId: notification.data.propertyId,
            requestId: notification.data.requestId
          }
        });
      } else {
        router.push({
          pathname: '/PropertyDetails',
          params: { id: notification.data.propertyId }
        });
      }
    }
    onClose(notification.id);
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'rent_accepted':
        return <Ionicons name="checkmark-circle" size={24} color="#10b981" />;
      case 'rent_rejected':
        return <Ionicons name="close-circle" size={24} color="#ef4444" />;
      case 'maintenance_update':
        return <Ionicons name="construct" size={24} color="#3b82f6" />;
      default:
        return <Ionicons name="notifications" size={24} color="#6b7280" />;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity style={styles.content} onPress={handlePress}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {notification.type === 'rent_accepted' ? 'Rent Request Accepted!' : 'Notification'}
          </Text>
          <Text style={styles.message}>{notification.message}</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => onClose(notification.id)}
        >
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
  },
  closeButton: {
    padding: 4,
  },
});

export default NotificationToast; 