import React, { useState } from 'react';
import { View, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  key: string;
  defaultValue: boolean;
};

const notificationSettings: NotificationSetting[] = [
  {
    id: 'payments',
    title: 'Payment Reminders',
    description: 'Get notified about upcoming rent and utility payments',
    key: 'notifications_payments',
    defaultValue: true,
  },
  {
    id: 'lease',
    title: 'Lease Updates',
    description: 'Receive alerts about lease renewals and important dates',
    key: 'notifications_lease',
    defaultValue: true,
  },
  {
    id: 'maintenance',
    title: 'Maintenance Updates',
    description: 'Stay informed about maintenance request status changes',
    key: 'notifications_maintenance',
    defaultValue: true,
  },
  {
    id: 'applications',
    title: 'Application Status',
    description: 'Get updates about your rental applications',
    key: 'notifications_applications',
    defaultValue: true,
  },
  {
    id: 'messages',
    title: 'New Messages',
    description: 'Be notified when you receive new messages',
    key: 'notifications_messages',
    defaultValue: true,
  },
];

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<Record<string, boolean>>({});

  const toggleSetting = async (key: string) => {
    const newValue = !settings[key];
    try {
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
      setSettings((prev) => ({ ...prev, [key]: newValue }));
    } catch (error) {
      console.error('Error saving notification setting:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Push Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <View style={styles.card}>
            {notificationSettings.map((setting) => (
              <View key={setting.id} style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Switch
                  value={settings[setting.key] ?? setting.defaultValue}
                  onValueChange={() => toggleSetting(setting.key)}
                  trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                  thumbColor={
                    (settings[setting.key] ?? setting.defaultValue) ? '#2563EB' : '#F3F4F6'
                  }
                />
              </View>
            ))}
          </View>
        </View>

        {/* Email Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive notifications via email</Text>
              </View>
              <Switch
                value={settings.email_notifications ?? true}
                onValueChange={() => toggleSetting('email_notifications')}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={(settings.email_notifications ?? true) ? '#2563EB' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Notification Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Frequency</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.frequencyItem}
              onPress={() => router.push('/settings/notification-frequency')}
            >
              <View>
                <Text style={styles.settingTitle}>Frequency Settings</Text>
                <Text style={styles.settingDescription}>
                  Customize how often you receive notifications
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontWeight: '600',
  },
  settingDescription: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 4,
  },
  frequencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
});
