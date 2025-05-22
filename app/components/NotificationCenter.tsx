import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView,
  Text
} from 'react-native';
// import { Text } from './Text';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { mockApi, Notification } from '../services/mockApi';
import useNotifications from '../hooks/useNotifications';

// Define notification categories
type NotificationCategory = 'all' | 'payments' | 'lease' | 'maintenance' | 'applications' | 'messages';

interface NotificationCenterProps {
  onClose: () => void;
  visible: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose, visible }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notifications, markAsRead, refresh, loading } = useNotifications();
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    
    // Map notification types to categories
    const typeToCategory: Record<string, NotificationCategory> = {
      'rent_accepted': 'applications',
      'rent_rejected': 'applications',
      'payment_reminder': 'payments',
      'payment_received': 'payments',
      'lease_update': 'lease',
      'lease_expiry': 'lease',
      'maintenance_update': 'maintenance',
      'maintenance_scheduled': 'maintenance',
      'new_message': 'messages',
    };
    
    const category = typeToCategory[notification.type] || 'all';
    return category === activeTab;
  });

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      // If all are selected, deselect all
      setSelectedNotifications([]);
    } else {
      // Otherwise, select all
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(prev => prev.filter(notifId => notifId !== id));
    } else {
      setSelectedNotifications(prev => [...prev, id]);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
    setIsSelectMode(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (isSelectMode) {
      handleToggleSelect(notification.id);
      return;
    }
    
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type (can expand this logic)
    if (notification.data?.path) {
      onClose(); // Close notification center before navigation
      // router.push(notification.data.path);
    }
  };

  // Category tabs
  const categoryTabs: Array<{id: NotificationCategory, icon: string, label: string}> = [
    { id: 'all', icon: 'bell-outline', label: t('All') },
    { id: 'payments', icon: 'cash-multiple', label: t('Payments') },
    { id: 'lease', icon: 'file-document-outline', label: t('Lease') },
    { id: 'maintenance', icon: 'tools', label: t('Maintenance') },
    { id: 'applications', icon: 'home-outline', label: t('Applications') },
    { id: 'messages', icon: 'message-outline', label: t('Messages') },
  ];

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Notifications')}</Text>
          <View style={styles.headerActions}>
            {isSelectMode ? (
              <>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleSelectAll}
                >
                  <Text style={styles.actionText}>
                    {selectedNotifications.length === filteredNotifications.length ? 
                      t('Deselect All') : t('Select All')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.markReadButton]} 
                  onPress={handleMarkSelectedAsRead}
                  disabled={selectedNotifications.length === 0}
                >
                  <MaterialCommunityIcons name="check-all" size={20} color="white" />
                  <Text style={styles.markReadText}>{t('Mark Read')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={() => setIsSelectMode(true)}
                >
                  <MaterialCommunityIcons name="checkbox-multiple-outline" size={24} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={onClose}>
                  <MaterialCommunityIcons name="close" size={24} color="#4B5563" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {categoryTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <MaterialCommunityIcons 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.id ? '#2563EB' : '#6B7280'} 
              />
              <Text 
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.activeTabLabel
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refresh} />
            }
            contentContainerStyle={styles.notificationsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="bell-off-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyText}>{t('No notifications')}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.notificationItem,
                  !item.read && styles.unreadNotification,
                  selectedNotifications.includes(item.id) && styles.selectedNotification
                ]}
                onPress={() => handleNotificationPress(item)}
                onLongPress={() => {
                  setIsSelectMode(true);
                  handleToggleSelect(item.id);
                }}
              >
                {isSelectMode && (
                  <View style={styles.checkboxContainer}>
                    <View style={[
                      styles.checkbox,
                      selectedNotifications.includes(item.id) && styles.checkboxSelected
                    ]}>
                      {selectedNotifications.includes(item.id) && (
                        <MaterialCommunityIcons name="check" size={16} color="white" />
                      )}
                    </View>
                  </View>
                )}
                
                <View style={styles.iconContainer}>
                  {item.type === 'rent_accepted' && (
                    <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                  )}
                  {item.type === 'rent_rejected' && (
                    <MaterialCommunityIcons name="close-circle" size={24} color="#EF4444" />
                  )}
                  {item.type === 'maintenance_update' && (
                    <MaterialCommunityIcons name="tools" size={24} color="#3B82F6" />
                  )}
                  {(item.type === 'payment_reminder' || item.type === 'payment_received') && (
                    <MaterialCommunityIcons name="cash" size={24} color="#F59E0B" />
                  )}
                  {(item.type === 'lease_update' || item.type === 'lease_expiry') && (
                    <MaterialCommunityIcons name="file-document" size={24} color="#8B5CF6" />
                  )}
                  {item.type === 'new_message' && (
                    <MaterialCommunityIcons name="message" size={24} color="#EC4899" />
                  )}
                  {!['rent_accepted', 'rent_rejected', 'maintenance_update', 'payment_reminder', 'payment_received', 'lease_update', 'lease_expiry', 'new_message'].includes(item.type) && (
                    <MaterialCommunityIcons name="bell" size={24} color="#6B7280" />
                  )}
                </View>
                
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                  <Text style={styles.notificationTime}>
                    {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
                  </Text>
                </View>
                
                {!isSelectMode && !item.read && (
                  <View style={styles.unreadDot} />
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#F9FAFB',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  markReadButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  markReadText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomColor: '#2563EB',
  },
  tabLabel: {
    marginLeft: 6,
    fontWeight: '500',
    color: '#6B7280',
    fontSize: 14,
  },
  activeTabLabel: {
    color: '#2563EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  unreadNotification: {
    backgroundColor: '#EFF6FF',
  },
  selectedNotification: {
    backgroundColor: '#DBEAFE',
  },
  checkboxContainer: {
    justifyContent: 'center',
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  iconContainer: {
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationTime: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginLeft: 8,
  },
});

export default NotificationCenter; 