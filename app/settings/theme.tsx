import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '../../hooks/useColorScheme';

const ThemeScreen = () => {
  const { t } = useTranslation();
  const { theme, setTheme, isLoading } = useSettings();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const themes = [
    { id: 'system', name: t('settings.system'), icon: 'brightness-auto' },
    { id: 'light', name: t('settings.light'), icon: 'wb-sunny' },
    { id: 'dark', name: t('settings.dark'), icon: 'nights-stay' },
  ];

  const handleThemeChange = async (newTheme: string) => {
    await setTheme(newTheme as 'system' | 'light' | 'dark');
    router.back();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#34568B'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {themes.map((themeOption) => (
        <TouchableOpacity
          key={themeOption.id}
          onPress={() => handleThemeChange(themeOption.id)}
          style={[styles.themeItem, isDark && styles.themeItemDark]}
        >
          <View style={styles.themeInfo}>
            <MaterialIcons
              name={themeOption.icon as keyof typeof MaterialIcons.glyphMap}
              size={24}
              color={isDark ? '#D1D5DB' : '#4B5563'}
              style={styles.icon}
            />
            <Text style={[styles.themeName, isDark && styles.themeNameDark]}>
              {themeOption.name}
            </Text>
          </View>
          {theme === themeOption.id && (
            <MaterialIcons
              name="check"
              size={24}
              color="#3B82F6"
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  themeItemDark: {
    borderBottomColor: '#374151',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  themeName: {
    fontSize: 16,
    color: '#1F2937',
  },
  themeNameDark: {
    color: '#F9FAFB',
  },
});

export default ThemeScreen; 