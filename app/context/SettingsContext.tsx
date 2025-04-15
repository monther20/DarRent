import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '../hooks/useColorScheme';
import i18n from '@/localization/i18n';

type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'en' | 'ar';

interface SettingsContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  pushNotifications: boolean;
  setPushNotifications: (enabled: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
  textSize: number;
  setTextSize: (size: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [language, setLanguage] = useState<Language>('en');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [textSize, setTextSize] = useState(1);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedLanguage = await AsyncStorage.getItem('language');
      const savedPushNotifications = await AsyncStorage.getItem('pushNotifications');
      const savedEmailNotifications = await AsyncStorage.getItem('emailNotifications');
      const savedTextSize = await AsyncStorage.getItem('textSize');

      if (savedTheme) setTheme(savedTheme as ThemeMode);
      if (savedLanguage) {
        setLanguage(savedLanguage as Language);
        i18n.changeLanguage(savedLanguage);
      }
      if (savedPushNotifications) setPushNotifications(JSON.parse(savedPushNotifications));
      if (savedEmailNotifications) setEmailNotifications(JSON.parse(savedEmailNotifications));
      if (savedTextSize) setTextSize(parseFloat(savedTextSize));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const updateLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('language', newLanguage);
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const updatePushNotifications = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('pushNotifications', JSON.stringify(enabled));
      setPushNotifications(enabled);
    } catch (error) {
      console.error('Error saving push notifications setting:', error);
    }
  };

  const updateEmailNotifications = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('emailNotifications', JSON.stringify(enabled));
      setEmailNotifications(enabled);
    } catch (error) {
      console.error('Error saving email notifications setting:', error);
    }
  };

  const updateTextSize = async (size: number) => {
    try {
      await AsyncStorage.setItem('textSize', size.toString());
      setTextSize(size);
    } catch (error) {
      console.error('Error saving text size:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme: updateTheme,
        language,
        setLanguage: updateLanguage,
        pushNotifications,
        setPushNotifications: updatePushNotifications,
        emailNotifications,
        setEmailNotifications: updateEmailNotifications,
        textSize,
        setTextSize: updateTextSize,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext; 