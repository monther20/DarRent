import React, { useState } from 'react';
import { View, ScrollView, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    textSize,
    setTextSize,
    initialPreferences,
    isLoading
  } = useSettings();
  
  // Default values for push and email notifications using initialPreferences
  const [pushNotifications, setPushNotifications] = useState(
    initialPreferences?.notifications ?? true
  );
  const [emailNotifications, setEmailNotifications] = useState(
    initialPreferences?.emailUpdates ?? true
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <MaterialIcons name="settings" size={48} color="#ccc" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const SettingItem = ({ 
    title, 
    value, 
    onPress, 
    icon, 
    showArrow = true 
  }: { 
    title: string; 
    value?: string; 
    onPress: () => void; 
    icon: keyof typeof MaterialIcons.glyphMap;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.settingItem}
    >
      <View style={styles.settingItemLeft}>
        <MaterialIcons name={icon} size={24} style={styles.settingIcon} />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      <View style={styles.settingItemRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showArrow && (
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            style={styles.settingArrow} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const SettingToggle = ({ 
    title, 
    value, 
    onValueChange, 
    icon 
  }: { 
    title: string; 
    value: boolean; 
    onValueChange: (value: boolean) => void; 
    icon: keyof typeof MaterialIcons.glyphMap;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <MaterialIcons name={icon} size={24} style={styles.settingIcon} />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#34568B' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('settings.account')}
        </Text>
        <SettingItem
          title={t('settings.changePassword')}
          onPress={() => router.push('/settings/change-password')}
          icon="lock"
        />
        <SettingItem
          title={t('settings.language')}
          value={language === 'en' ? 'English' : 'العربية'}
          onPress={() => router.push('/settings/language')}
          icon="language"
        />
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('settings.notifications')}
        </Text>
        <SettingToggle
          title={t('settings.pushNotifications')}
          value={pushNotifications}
          onValueChange={setPushNotifications}
          icon="notifications"
        />
        <SettingToggle
          title={t('settings.emailNotifications')}
          value={emailNotifications}
          onValueChange={setEmailNotifications}
          icon="email"
        />
      </View>

      {/* Display Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('settings.display')}
        </Text>
        <SettingItem
          title={t('settings.theme')}
          value={theme === 'system' ? t('settings.system') : theme === 'dark' ? t('settings.dark') : t('settings.light')}
          onPress={() => router.push('/settings/theme')}
          icon="brightness-6"
        />
        <SettingItem
          title={t('settings.textSize')}
          value={`${Math.round(textSize * 100)}%`}
          onPress={() => router.push('/settings/text-size')}
          icon="format-size"
        />
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('settings.privacy')}
        </Text>
        <SettingItem
          title={t('settings.privacyPolicy')}
          onPress={() => router.push('/settings/privacy-policy')}
          icon="privacy-tip"
        />
        <SettingItem
          title={t('settings.termsOfService')}
          onPress={() => router.push('/settings/terms')}
          icon="description"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 16,
    color: '#4B5563',
  },
  settingText: {
    fontSize: 16,
    color: '#1F2937',
  },
  settingValue: {
    marginRight: 8,
    color: '#6B7280',
  },
  settingArrow: {
    color: '#9CA3AF',
  },
});

export default SettingsScreen; 