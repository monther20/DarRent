import React, { useState } from 'react';
import { View, ScrollView, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useAuth } from '@/contexts/AuthContext';

export default function RenterSettingsScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const SettingItem = ({
    title,
    value,
    onPress,
    icon,
    showArrow = true,
  }: {
    title: string;
    value?: string;
    onPress: () => void;
    icon: keyof typeof MaterialIcons.glyphMap;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <MaterialIcons name={icon} size={24} style={styles.settingIcon} />
        <ThemedText style={styles.settingText}>{title}</ThemedText>
      </View>
      <View style={styles.settingItemRight}>
        {value && <ThemedText style={styles.settingValue}>{value}</ThemedText>}
        {showArrow && <MaterialIcons name="chevron-right" size={24} style={styles.settingArrow} />}
      </View>
    </TouchableOpacity>
  );

  const SettingToggle = ({
    title,
    value,
    onValueChange,
    icon,
  }: {
    title: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon: keyof typeof MaterialIcons.glyphMap;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <MaterialIcons name={icon} size={24} style={styles.settingIcon} />
        <ThemedText style={styles.settingText}>{title}</ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#34568B' : '#f4f3f4'}
      />
    </View>
  );

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {/* Account Settings */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.account')}</ThemedText>
          <SettingItem
            title={t('settings.profile')}
            icon="person"
            onPress={() => router.push('/settings/profile')}
          />
          <SettingItem
            title={t('settings.security')}
            icon="security"
            onPress={() => router.push('/settings/security')}
          />
          <SettingItem
            title={t('settings.paymentMethods')}
            icon="payment"
            onPress={() => router.push('/settings/payment')}
          />
        </ThemedView>

        {/* Notifications */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.notifications')}</ThemedText>
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
        </ThemedView>

        {/* Preferences */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.preferences')}</ThemedText>
          <SettingItem
            title={t('settings.language')}
            value={t('settings.english')}
            icon="language"
            onPress={() => router.push('/settings/language')}
          />
          <SettingToggle
            title={t('settings.darkMode')}
            value={darkMode}
            onValueChange={setDarkMode}
            icon="dark-mode"
          />
        </ThemedView>

        {/* Support */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.support')}</ThemedText>
          <SettingItem
            title={t('settings.helpCenter')}
            icon="help"
            onPress={() => router.push('/help')}
          />
          <SettingItem
            title={t('settings.contactSupport')}
            icon="contact-support"
            onPress={() => router.push('/contact-support')}
          />
          <SettingItem
            title={t('settings.termsAndConditions')}
            icon="description"
            onPress={() => router.push('/terms')}
          />
          <SettingItem
            title={t('settings.privacyPolicy')}
            icon="privacy-tip"
            onPress={() => router.push('/privacy')}
          />
        </ThemedView>

        {/* App Info */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.about')}</ThemedText>
          <SettingItem
            title={t('settings.version')}
            value="1.0.0"
            icon="info"
            showArrow={false}
            onPress={() => {}}
          />
        </ThemedView>

        {/* Logout Button */}
        <ThemedButton
          title={t('common.logout')}
          colorName="error"
          textColorName="text"
          style={styles.logoutButton}
          onPress={handleLogout}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'card',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    colorName: 'text',
    opacity: 0.7,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'border',
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
    colorName: 'primary',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    colorName: 'text',
  },
  settingValue: {
    fontSize: 14,
    colorName: 'text',
    opacity: 0.7,
    marginRight: 8,
  },
  settingArrow: {
    colorName: 'text',
    opacity: 0.7,
  },
  logoutButton: {
    margin: 16,
  },
});
