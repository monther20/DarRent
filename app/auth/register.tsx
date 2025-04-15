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
const registerSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  phone: z.string().min(8, { message: 'Phone number must be at least 8 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['landlord', 'renter']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'renter',
    },
  });

  const currentRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const success = await register(data);
      
      if (success) {
        // Navigate to home on successful registration
        router.replace('/(tabs)');
      } else {
        setErrorMessage(t('auth.registrationFailed'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(t('common.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const isRTL = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView}>
        {/* Register Form */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.title}>
            {t('auth.createAccount')}
          </ThemedText>
          
          <ThemedText style={styles.description}>
            {t('auth.registerDescription')}
          </ThemedText>
          
          {/* Full Name Input */}
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label={t('auth.fullName')}
                placeholder={t('auth.fullNamePlaceholder')}
                autoCapitalize="words"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                icon="user"
                error={errors.fullName ? t(errors.fullName.message || 'auth.invalidName') : undefined}
                isRTL={isRTL}
              />
            )}
          />

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

          {/* Phone Input */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <InputField
                label={t('auth.phone')}
                placeholder={t('auth.phonePlaceholder')}
                keyboardType="phone-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                icon="phone"
                error={errors.phone ? t(errors.phone.message || 'auth.invalidPhone') : undefined}
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

          {/* User Type Selection */}
          <View style={styles.roleContainer}>
            <ThemedText style={styles.roleLabel}>
              {t('auth.accountType')}
            </ThemedText>
            
            <View style={styles.roleSelector}>
              <TouchableOpacity 
                style={[
                  styles.roleButton,
                  currentRole === 'renter' && styles.roleButtonActive
                ]}
                onPress={() => setValue('role', 'renter')}
              >
                <ThemedText style={[
                  styles.roleButtonText,
                  currentRole === 'renter' && styles.roleButtonTextActive
                ]}>
                  {t('auth.renter')}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.roleButton,
                  currentRole === 'landlord' && styles.roleButtonActive
                ]}
                onPress={() => setValue('role', 'landlord')}
              >
                <ThemedText style={[
                  styles.roleButtonText,
                  currentRole === 'landlord' && styles.roleButtonTextActive
                ]}>
                  {t('auth.landlord')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                {errorMessage}
              </ThemedText>
            </View>
          ) : null}

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.registerButtonText}>
                {t('auth.register')}
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>
              {t('auth.alreadyHaveAccount')}
            </ThemedText>
            <TouchableOpacity onPress={handleLogin}>
              <ThemedText style={styles.loginLink}>
                {t('auth.login')}
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
    color: '#666',
    marginBottom: 32,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#34568B',
  },
  roleButtonText: {
    color: '#374151',
  },
  roleButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
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
  registerButton: {
    backgroundColor: '#34568B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: '#4B5563',
  },
  loginLink: {
    color: '#34568B',
    fontWeight: 'bold',
    marginLeft: 4,
  },
}); 