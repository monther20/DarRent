import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Text';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export default function PaymentConfirmationScreen() {
  const { t } = useTranslation(['payments']);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed'>(
    'processing',
  );

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      // For demo purposes, we'll randomly succeed or fail
      setPaymentStatus(Math.random() > 0.3 ? 'success' : 'failed');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleBackToPayments = () => {
    router.replace('/(renter-tabs)/payments');
  };

  const handleTryAgain = () => {
    setPaymentStatus('processing');
    // Simulate payment processing again
    setTimeout(() => {
      setPaymentStatus(Math.random() > 0.3 ? 'success' : 'failed');
    }, 2000);
  };

  const renderContent = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.statusText}>{t('processingPayment')}</Text>
          </View>
        );
      case 'success':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.successIconContainer}>
              <FontAwesome name="check-circle" size={64} color="#10B981" />
            </View>
            <Text style={styles.statusText}>{t('paymentSuccess')}</Text>
            <TouchableOpacity style={styles.button} onPress={handleBackToPayments}>
              <Text style={styles.buttonText}>{t('backToPayments')}</Text>
            </TouchableOpacity>
          </View>
        );
      case 'failed':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.errorIconContainer}>
              <FontAwesome name="times-circle" size={64} color="#EF4444" />
            </View>
            <Text style={styles.statusText}>{t('paymentFailed')}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.tryAgainButton]}
                onPress={handleTryAgain}
              >
                <Text style={styles.buttonText}>{t('tryAgain')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBackToPayments}
              >
                <Text style={[styles.buttonText, styles.backButtonText]}>
                  {t('backToPayments')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('paymentConfirmation')} />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    textAlign: 'center',
  },
  successIconContainer: {
    backgroundColor: '#D1FAE5',
    padding: 24,
    borderRadius: 50,
  },
  errorIconContainer: {
    backgroundColor: '#FEE2E2',
    padding: 24,
    borderRadius: 50,
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tryAgainButton: {
    backgroundColor: Colors.light.primary,
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: Colors.light.primary,
  },
});
