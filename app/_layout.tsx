import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { I18nextProvider } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import i18n from '../localization/i18n';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <SettingsProvider>
          <ThemeProvider>
            <AuthProvider>
              <LanguageProvider>
                <RootLayoutNav />
              </LanguageProvider>
            </AuthProvider>
          </ThemeProvider>
        </SettingsProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {user?.role === 'landlord' && (
        <Stack.Screen name="(landlord-tabs)" options={{ headerShown: false }} />
      )}
      {user?.role === 'renter' && (
        <Stack.Screen name="(renter-tabs)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}

