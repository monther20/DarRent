import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { SuccessAnimation } from '../../components/animations';

export default function RentRequestSuccessScreen() {
  const { t } = useTranslation(['propertyDetails', 'common']);
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('requestSent.title', { ns: 'propertyDetails' }),
          headerStyle: {
            backgroundColor: '#34568B',
          },
          headerTintColor: '#fff',
          headerBackVisible: false,
        }}
      />

      <View style={styles.content}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>

        <Text style={styles.title}>{t('requestSent.title', { ns: 'propertyDetails' })}</Text>

        <Text style={styles.message}>{t('requestSent.message', { ns: 'propertyDetails' })}</Text>

        <SuccessAnimation
          size={200}
          message={t('requestSent.message', { ns: 'propertyDetails' })}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(renter-tabs)/properties')}
        >
          <Text style={styles.buttonText}>{t('requestSent.back', { ns: 'propertyDetails' })}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#34568B',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
