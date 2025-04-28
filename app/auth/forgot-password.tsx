import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define validation schema with zod
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { t, i18n } = useTranslation();
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setIsSuccess(false);

      const success = await forgotPassword(data.email);

      if (success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(t('auth.resetPasswordFailed'));
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrorMessage(t('common.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const isRTL = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView style={styles.scrollView}>
        {/* Forgot Password Form */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.title}>{t('auth.forgotPassword')}</ThemedText>

          <ThemedText style={styles.description}>{t('auth.resetPasswordDescription')}</ThemedText>

          {isSuccess ? (
            // Success Message
            <View style={styles.successContainer}>
              <ThemedText style={styles.successText}>{t('auth.resetPasswordSuccess')}</ThemedText>
              <ThemedText style={styles.successSubText}>
                {t('auth.resetPasswordCheckEmail')}
              </ThemedText>
            </View>
          ) : (
            // Email Input
            <>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField
                    label={t('auth.email')}
                    placeholder={t('auth.emailPlaceholder')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onChangeText={onChange}
                    value={value}
                    icon="envelope-o"
                    error={
                      errors.email ? t(errors.email.message || 'auth.invalidEmail') : undefined
                    }
                    isRTL={isRTL}
                  />
                )}
              />

              {/* Error Message */}
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
                </View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>{t('auth.sendResetLink')}</ThemedText>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Back to Login */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
            <ThemedText style={styles.backButtonText}>{t('auth.backToLogin')}</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#34568B',
    marginBottom: 24,
  },
  description: {
    color: '#666',
    marginBottom: 32,
  },
  successContainer: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
  },
  successText: {
    color: '#166534',
    fontWeight: '500',
    textAlign: 'center',
  },
  successSubText: {
    color: '#15803d',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: '#ef4444',
  },
  submitButton: {
    backgroundColor: '#34568B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  backButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    color: '#34568B',
    fontWeight: '500',
  },
});
