import React, { useState } from 'react';
import { View, ScrollView, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

// Custom header for settings
function SettingsHeader({ primary }: { primary: string }) {
  const { t } = useTranslation(['settings']);
  return (
    <View style={[styles.header, { backgroundColor: primary }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
        <MaterialIcons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>{t('title')}</ThemedText>
      <View style={{ width: 40 }} />
    </View>
  );
}

type SettingItemProps = {
  title: string;
  value?: string;
  onPress: () => void;
  icon: keyof typeof MaterialIcons.glyphMap;
  showArrow?: boolean;
  primary: string;
  text: string;
  grey: string;
  border: string;
};

type SettingToggleProps = {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: keyof typeof MaterialIcons.glyphMap;
  primary: string;
  text: string;
  border: string;
  background: string;
};

export default function LandlordSettingsScreen() {
  const { t } = useTranslation(['settings', 'common']);
  const { signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Theme colors
  const primary = useThemeColor({}, 'primary');
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const error = useThemeColor({}, 'error');
  const text = useThemeColor({}, 'text');
  const grey = useThemeColor({}, 'grey');

  const SettingItem = ({
    title,
    value,
    onPress,
    icon,
    showArrow = true,
    primary,
    text,
    grey,
    border,
  }: SettingItemProps) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.settingItem, { borderBottomColor: border }]}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <MaterialIcons name={icon} size={22} color={primary} />
        <ThemedText style={[styles.settingText, { color: text }]}>{title}</ThemedText>
      </View>
      <View style={styles.settingItemRight}>
        {value && <ThemedText style={[styles.settingValue, { color: grey }]}>{value}</ThemedText>}
        {showArrow && <MaterialIcons name="chevron-right" size={22} color={primary} />}
      </View>
    </TouchableOpacity>
  );

  const SettingToggle = ({
    title,
    value,
    onValueChange,
    icon,
    primary,
    text,
    border,
    background,
  }: SettingToggleProps) => (
    <View style={[styles.settingItem, { borderBottomColor: border }]}>
      <View style={styles.settingItemLeft}>
        <MaterialIcons name={icon} size={22} color={primary} />
        <ThemedText style={[styles.settingText, { color: text }]}>{title}</ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: border, true: primary }}
        thumbColor={value ? '#fff' : background}
      />
    </View>
  );

  const handleLogout = async () => {
    try {
      await signOut();
      setTimeout(() => {
        router.replace('/auth/welcome');
      }, 0);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <SettingsHeader primary={primary} />
      <ScrollView style={styles.scrollContent}>
        {/* Account Settings */}
        <View style={[styles.sectionCard, { backgroundColor: card, shadowColor: primary }]}>
          <ThemedText style={[styles.sectionTitle, { color: primary }]}>
            {t('account')}
          </ThemedText>
          <SettingItem
            title={t('profile')}
            icon="person"
            onPress={() => router.push('/settings/profile')}
            primary={primary}
            text={text}
            grey={grey}
            border={border}
          />
          <SettingItem
            title={t('security')}
            icon="security"
            onPress={() => router.push('/settings/security')}
            primary={primary}
            text={text}
            grey={grey}
            border={border}
          />
          <SettingItem
            title={t('paymentMethods')}
            icon="payment"
            onPress={() => router.push('/settings/payment')}
            primary={primary}
            text={text}
            grey={grey}
            border={border}
          />
        </View>

        {/* Notifications */}
        <View style={[styles.sectionCard, { backgroundColor: card, shadowColor: primary }]}>
          <ThemedText style={[styles.sectionTitle, { color: primary }]}>{t('notifications')}</ThemedText>
          <SettingToggle
            title={t('pushNotifications')}
            value={pushNotifications}
            onValueChange={setPushNotifications}
            icon="notifications"
            primary={primary}
            text={text}
            border={border}
            background={background}
          />
          <SettingToggle
            title={t('emailNotifications')}
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            icon="email"
            primary={primary}
            text={text}
            border={border}
            background={background}
          />
        </View>

        {/* Preferences */}
        <View style={[styles.sectionCard, { backgroundColor: card, shadowColor: primary }]}>
          <ThemedText style={[styles.sectionTitle, { color: primary }]}>{t('preferences')}</ThemedText>
          <SettingItem
            title={t('language')}
            value={t('english')}
            icon="language"
            onPress={() => router.push('/settings/language')}
            primary={primary}
            text={text}
            grey={grey}
            border={border}
          />
          <SettingToggle
            title={t('darkMode')}
            value={darkMode}
            onValueChange={setDarkMode}
            icon="dark-mode"
            primary={primary}
            text={text}
            border={border}
            background={background}
          />
        </View>

        {/* Support */}
        <View style={[styles.sectionCard, { backgroundColor: card, shadowColor: primary }]}>
          <ThemedText style={[styles.sectionTitle, { color: primary }]}>{t('support')}</ThemedText>
          <SettingItem
            title={t('helpCenter')}
            icon="help"
            onPress={() => router.push('/help')}
            primary={primary}
            text={text}
            grey={grey}
            border={border}
          />
          <SettingItem
            title={t('contactSupport')}
            icon="contact-support"
            onPress={() => router.push('/contact-support')}
            primary={primary}
            text={text}
            grey={grey}
            border={border}
          />
          <SettingItem
            title={t('termsAndConditions')}
            icon="description"
            onPress={() => router.push('/terms')}
            primary={primary}
            text={text}
            grey={grey}
            border={border}
          />
          <SettingItem
            title={t('privacyPolicy')}
            icon="privacy-tip"
            onPress={() => router.push('/privacy')}
            primary={primary}
            text={text}
            grey={grey}
            border={border}
          />
        </View>

        {/* App Info */}
        <View style={[styles.sectionCard, { backgroundColor: card, shadowColor: primary }]}>
          <ThemedText style={[styles.sectionTitle, { color: primary }]}>{t('about')}</ThemedText>
          <SettingItem
            title={t('version')}
            value="1.0.0"
            icon="info"
            showArrow={false}
            onPress={() => {}}
            primary={primary}
            text={text}
            grey={grey}
            border={border}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: error }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.logoutText}>{t('common.logout')}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    // paddingTop: 18,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionCard: {
    borderRadius: 14,
    marginBottom: 18,
    paddingHorizontal: 0,
    paddingVertical: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    marginLeft: 18,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
