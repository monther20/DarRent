import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'ar';

type Settings = {
  theme: Theme;
  language: Language;
  textSize: number;
  initialPreferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    pushAlerts: boolean;
  };
};

type SettingsContextType = Settings & {
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setTextSize: (size: number) => void;
  isLoading: boolean;
};

const defaultSettings: Settings = {
  theme: 'system',
  language: 'en',
  textSize: 1,
  initialPreferences: {
    notifications: true,
    emailUpdates: true,
    pushAlerts: true,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved settings
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const savedSettings = await AsyncStorage.getItem('userSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Ensure initialPreferences exists
          if (!parsedSettings.initialPreferences) {
            parsedSettings.initialPreferences = defaultSettings.initialPreferences;
          }
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const setTheme = async (theme: Theme) => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const setLanguage = async (language: Language) => {
    const newSettings = { ...settings, language };
    setSettings(newSettings);
    await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const setTextSize = async (textSize: number) => {
    const newSettings = { ...settings, textSize };
    setSettings(newSettings);
    await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setTheme,
        setLanguage,
        setTextSize,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default SettingsProvider;
