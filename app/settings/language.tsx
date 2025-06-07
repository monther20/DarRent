import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '../hooks/useColorScheme';

const LanguageScreen = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettings();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ];

  const handleLanguageChange = async (newLanguage: string) => {
    await setLanguage(newLanguage as 'en' | 'ar');
    router.back();
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => handleLanguageChange(lang.code)}
          style={[styles.languageItem, isDark && styles.languageItemDark]}
        >
          <View style={styles.languageInfo}>
            <Text style={[styles.languageName, isDark && styles.languageNameDark]}>
              {lang.nativeName}
            </Text>
            <Text style={[styles.languageNative, isDark && styles.languageNativeDark]}>
              ({lang.name})
            </Text>
          </View>
          {language === lang.code && <MaterialIcons name="check" size={24} color="#3B82F6" />}
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
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  languageItemDark: {
    borderBottomColor: '#374151',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    color: '#1F2937',
  },
  languageNameDark: {
    color: '#F9FAFB',
  },
  languageNative: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  languageNativeDark: {
    color: '#9CA3AF',
  },
});

export default LanguageScreen;
