import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { router, Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from '@/app/components/Checkbox';

type UserRole = 'landlord' | 'renter';

// Define validation schema with zod
const registerSchema = z
  .object({
    fullName: z.string().min(1, { message: 'Full name is required' }),
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email address' }),
    phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('landlord');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!agreeToTerms) {
      setErrorMessage('Please agree to the Terms and Conditions');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const success = await register({
        name: data.fullName,
        email: data.email,
        phone: data.phoneNumber,
        password: data.password,
        role: selectedRole,
      });

      if (success) {
        router.replace('/(tabs)');
      } else {
        setErrorMessage('Failed to create account');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Create Account</ThemedText>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* User Type Selection */}
          <ThemedText style={styles.sectionTitle}>I am a...</ThemedText>
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                selectedRole === 'landlord' && styles.userTypeButtonActive,
                { marginRight: 8 },
              ]}
              onPress={() => setSelectedRole('landlord')}
            >
              <ThemedText
                style={[
                  styles.userTypeText,
                  selectedRole === 'landlord' && styles.userTypeTextActive,
                ]}
              >
                Landlord
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                selectedRole === 'renter' && styles.userTypeButtonActive,
              ]}
              onPress={() => setSelectedRole('renter')}
            >
              <ThemedText
                style={[
                  styles.userTypeText,
                  selectedRole === 'renter' && styles.userTypeTextActive,
                ]}
              >
                Renter
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Full Name Input */}
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <InputField
                  placeholder="Enter your full name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.fullName?.message}
                  label="Full Name"
                />
              </View>
            )}
          />

          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <InputField
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  label="Email"
                />
              </View>
            )}
          />

          {/* Phone Number Input */}
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <InputField
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.phoneNumber?.message}
                  label="Phone Number"
                />
              </View>
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <InputField
                  placeholder="Enter your password"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  label="Password"
                />
              </View>
            )}
          />

          {/* Confirm Password Input */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <InputField
                  placeholder="Confirm your password"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                  label="Confirm Password"
                />
              </View>
            )}
          />

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Checkbox checked={agreeToTerms} onPress={() => setAgreeToTerms(!agreeToTerms)} />
            <ThemedText style={styles.termsText}>
              I agree to the{' '}
              <Link href="/terms" style={styles.termsLink}>
                Terms And Conditions
              </Link>
            </ThemedText>
          </View>

          {/* Error Message */}
          {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.createButtonText}>Create Account</ThemedText>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>
              Already have an account?{' '}
              <Link href="/auth/login" style={styles.loginLink}>
                Login
              </Link>
            </ThemedText>
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
  header: {
    backgroundColor: '#34568B',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#34568B',
    marginBottom: 12,
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  userTypeButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  userTypeButtonActive: {
    backgroundColor: '#E67E22',
  },
  userTypeText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  userTypeTextActive: {
    color: 'white',
  },
  inputContainer: {
    // marginBottom: 20,
  },

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  termsText: {
    marginLeft: 8,
    color: '#34568B',
  },
  termsLink: {
    color: '#E67E22',
    textDecorationLine: 'none',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#34568B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    color: '#6B7280',
  },
  loginLink: {
    color: '#E67E22',
    fontWeight: '600',
    textDecorationLine: 'none',
  },
});
