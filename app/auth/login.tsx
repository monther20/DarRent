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
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const success = await login(data.email, data.password);
      
      if (success) {
        // Navigate to home on successful login
        router.replace('/(tabs)');
      } else {
        setErrorMessage(t('auth.invalidCredentials'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(t('common.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const isRTL = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView}>
        {/* Login Form */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.title}>
            {t('auth.welcomeBack')}
          </ThemedText>
          
          <ThemedText style={styles.description}>
            {t('auth.loginDescription')}
          </ThemedText>
          
          {/* Email Input */}
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
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                icon="envelope-o"
                error={errors.email ? t(errors.email.message || 'auth.invalidEmail') : undefined}
                isRTL={isRTL}
              />
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label={t('auth.password')}
                placeholder={t('auth.passwordPlaceholder')}
                secureTextEntry={!passwordVisible}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                icon="lock"
                iconRight={passwordVisible ? "eye-slash" : "eye"}
                onIconRightPress={togglePasswordVisibility}
                error={errors.password ? t(errors.password.message || 'auth.invalidPassword') : undefined}
                isRTL={isRTL}
              />
            )}
          />

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPasswordButton} 
            onPress={handleForgotPassword}
          >
            <ThemedText style={styles.forgotPasswordText}>
              {t('auth.forgotPassword')}
            </ThemedText>
          </TouchableOpacity>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                {errorMessage}
              </ThemedText>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.loginButtonText}>
                {t('auth.login')}
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <ThemedText style={styles.signupText}>
              {t('auth.noAccount')}
            </ThemedText>
            <TouchableOpacity onPress={handleRegister}>
              <ThemedText style={styles.signupLink}>
                {t('auth.register')}
              </ThemedText>
            </TouchableOpacity>
          </View>
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
    color: '#4B5563',
    marginBottom: 32,
  },
  forgotPasswordButton: {
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#34568B',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: '#EF4444',
  },
  loginButton: {
    backgroundColor: '#34568B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signupText: {
    color: '#4B5563',
  },
  signupLink: {
    color: '#34568B',
    fontWeight: 'bold',
    marginLeft: 4,
  },
}); 