import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { Text } from '@/components/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import notificationService, { NotificationPreferences, NotificationChannelPreferences } from '../services/notifications';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );
  const [channelPreferences, setChannelPreferences] = useState<NotificationChannelPreferences>(
    notificationService.getChannelPreferences()
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setLoading(true);
    const permissionGranted = await notificationService.requestPermissions();
    setLoading(false);
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: any) => {
    await notificationService.updatePreference(key, value);
    setPreferences({ ...preferences, [key]: value });
  };

  const handleChannelPreferenceChange = async (
    category: string,
    channel: 'push' | 'email' | 'sms',
    value: boolean
  ) => {
    await notificationService.updateChannelPreference(category, channel, value);
    setChannelPreferences({
      ...channelPreferences,
      [category]: {
        ...channelPreferences[category],
        [channel]: value,
      },
    });
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const renderCategorySection = (
    category: string,
    title: string,
    description: string,
    iconName: string
  ) => (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <MaterialCommunityIcons name={iconName} size={24} color="#3B82F6" />
        <Text style={styles.categoryTitle}>{title}</Text>
      </View>
      <Text style={styles.categoryDescription}>{description}</Text>
      
      <View style={styles.channelsContainer}>
        {/* Push Channel */}
        <View style={styles.channelRow}>
          <View style={styles.channelInfo}>
            <MaterialCommunityIcons name="bell-outline" size={20} color="#4B5563" />
            <Text style={styles.channelText}>{t('Push')}</Text>
          </View>
          <Switch
            value={channelPreferences[category]?.push ?? false}
            onValueChange={(value) => handleChannelPreferenceChange(category, 'push', value)}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={channelPreferences[category]?.push ? '#2563EB' : '#F3F4F6'}
          />
        </View>
        
        {/* Email Channel */}
        <View style={styles.channelRow}>
          <View style={styles.channelInfo}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#4B5563" />
            <Text style={styles.channelText}>{t('Email')}</Text>
          </View>
          <Switch
            value={channelPreferences[category]?.email ?? false}
            onValueChange={(value) => handleChannelPreferenceChange(category, 'email', value)}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={channelPreferences[category]?.email ? '#2563EB' : '#F3F4F6'}
          />
        </View>
        
        {/* SMS Channel */}
        <View style={styles.channelRow}>
          <View style={styles.channelInfo}>
            <MaterialCommunityIcons name="message-text-outline" size={20} color="#4B5563" />
            <Text style={styles.channelText}>{t('SMS')}</Text>
          </View>
          <Switch
            value={channelPreferences[category]?.sms ?? false}
            onValueChange={(value) => handleChannelPreferenceChange(category, 'sms', value)}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={channelPreferences[category]?.sms ? '#2563EB' : '#F3F4F6'}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Notification Settings')}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Main Notification Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Notification Channels')}</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('Push Notifications')}</Text>
                <Text style={styles.settingDescription}>
                  {t('Receive notifications on your device')}
                </Text>
              </View>
              <Switch
                value={preferences.push}
                onValueChange={(value) => handlePreferenceChange('push', value)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={preferences.push ? '#2563EB' : '#F3F4F6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('Email Notifications')}</Text>
                <Text style={styles.settingDescription}>{t('Receive notifications via email')}</Text>
              </View>
              <Switch
                value={preferences.email}
                onValueChange={(value) => handlePreferenceChange('email', value)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={preferences.email ? '#2563EB' : '#F3F4F6'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('SMS Notifications')}</Text>
                <Text style={styles.settingDescription}>{t('Receive notifications via SMS')}</Text>
              </View>
              <Switch
                value={preferences.sms}
                onValueChange={(value) => handlePreferenceChange('sms', value)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={preferences.sms ? '#2563EB' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Quiet Hours')}</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('Enable Quiet Hours')}</Text>
                <Text style={styles.settingDescription}>
                  {t('Pause push notifications during specified hours')}
                </Text>
              </View>
              <Switch
                value={preferences.quietHoursEnabled}
                onValueChange={(value) => handlePreferenceChange('quietHoursEnabled', value)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={preferences.quietHoursEnabled ? '#2563EB' : '#F3F4F6'}
              />
            </View>

            {preferences.quietHoursEnabled && (
              <TouchableOpacity
                style={styles.timePicker}
                onPress={() => router.push('/settings/quiet-hours')}
              >
                <View>
                  <Text style={styles.settingTitle}>{t('Quiet Hours Schedule')}</Text>
                  <Text style={styles.timeRange}>
                    {`${preferences.quietHoursStart}:00 - ${preferences.quietHoursEnd}:00`}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Email Digest */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Email Notification Frequency')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[
                styles.digestOption,
                preferences.emailDigestFrequency === 'immediate' && styles.selectedDigest,
              ]}
              onPress={() => handlePreferenceChange('emailDigestFrequency', 'immediate')}
            >
              <View style={styles.digestOptionContent}>
                <MaterialCommunityIcons
                  name={
                    preferences.emailDigestFrequency === 'immediate'
                      ? 'radiobox-marked'
                      : 'radiobox-blank'
                  }
                  size={24}
                  color={
                    preferences.emailDigestFrequency === 'immediate' ? '#2563EB' : '#6B7280'
                  }
                />
                <View style={styles.digestTextContainer}>
                  <Text style={styles.settingTitle}>{t('Immediate')}</Text>
                  <Text style={styles.settingDescription}>
                    {t('Send email notifications as they happen')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.digestOption,
                preferences.emailDigestFrequency === 'daily' && styles.selectedDigest,
              ]}
              onPress={() => handlePreferenceChange('emailDigestFrequency', 'daily')}
            >
              <View style={styles.digestOptionContent}>
                <MaterialCommunityIcons
                  name={
                    preferences.emailDigestFrequency === 'daily'
                      ? 'radiobox-marked'
                      : 'radiobox-blank'
                  }
                  size={24}
                  color={preferences.emailDigestFrequency === 'daily' ? '#2563EB' : '#6B7280'}
                />
                <View style={styles.digestTextContainer}>
                  <Text style={styles.settingTitle}>{t('Daily Digest')}</Text>
                  <Text style={styles.settingDescription}>
                    {t('Receive a daily summary of notifications')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.digestOption,
                preferences.emailDigestFrequency === 'weekly' && styles.selectedDigest,
              ]}
              onPress={() => handlePreferenceChange('emailDigestFrequency', 'weekly')}
            >
              <View style={styles.digestOptionContent}>
                <MaterialCommunityIcons
                  name={
                    preferences.emailDigestFrequency === 'weekly'
                      ? 'radiobox-marked'
                      : 'radiobox-blank'
                  }
                  size={24}
                  color={preferences.emailDigestFrequency === 'weekly' ? '#2563EB' : '#6B7280'}
                />
                <View style={styles.digestTextContainer}>
                  <Text style={styles.settingTitle}>{t('Weekly Digest')}</Text>
                  <Text style={styles.settingDescription}>
                    {t('Receive a weekly summary of notifications')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Notification Categories')}</Text>
          <View style={styles.categoriesCard}>
            {/* Payments category */}
            {renderCategorySection(
              'payments',
              t('Payment Notifications'),
              t('Rent payments, utility bills, and payment confirmations'),
              'cash-multiple'
            )}

            {/* Lease category */}
            {renderCategorySection(
              'lease',
              t('Lease Notifications'),
              t('Contract updates, renewals, and expiration reminders'),
              'file-document-outline'
            )}

            {/* Maintenance category */}
            {renderCategorySection(
              'maintenance',
              t('Maintenance Notifications'),
              t('Request updates and scheduling information'),
              'tools'
            )}

            {/* Applications category */}
            {renderCategorySection(
              'applications',
              t('Application Notifications'),
              t('Rent request statuses and property application updates'),
              'home-outline'
            )}

            {/* Messages category */}
            {renderCategorySection(
              'messages',
              t('Message Notifications'),
              t('Chat and direct message alerts'),
              'message-text-outline'
            )}
          </View>
        </View>

        {/* System permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('System Permissions')}</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.permissionButton} onPress={openSettings}>
              <View style={styles.permissionContent}>
                <MaterialCommunityIcons name="cog-outline" size={24} color="#3B82F6" />
                <Text style={styles.permissionText}>
                  {t('Open system notification settings')}
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
    fontSize: 16,
  },
  settingDescription: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 4,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  timeRange: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  digestOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedDigest: {
    backgroundColor: '#EFF6FF',
  },
  digestOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  digestTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  categoriesCard: {
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
    overflow: 'hidden',
  },
  categorySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  categoryDescription: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 16,
  },
  channelsContainer: {
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
  },
}); 