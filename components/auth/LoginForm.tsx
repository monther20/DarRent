import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useMockUserData } from '../../hooks/useMockUserData';

// Define types that include the missing props
interface CustomTextInputProps extends TextInputProps {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
}

// Create a component that uses our extended props
const TextInput = (props: CustomTextInputProps) => <RNTextInput {...props} />;

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, session } = useAuth();
  const { userRole, isLoading: userRoleLoading } = useMockUserData();
  const router = useRouter();

  // Watch for session changes and user role to handle navigation
  useEffect(() => {
    if (session && !userRoleLoading) {
      console.log('Session detected, checking user role...', userRole);

      if (userRole === 'landlord') {
        console.log('Landlord role detected, navigating to landlord home...');
        router.replace('/(landlord-tabs)');
      } else if (userRole === 'renter') {
        console.log('Renter role detected, navigating to renter home...');
        router.replace('/(renter-tabs)');
      } else if (userRole === 'unknown') {
        console.log('No role detected, navigating to role selection...');
        router.replace('/auth/select-role');
      }
    }
  }, [session, userRole, userRoleLoading]);

  const validateEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async () => {
    try {
      // Reset error state
      setError(null);

      // Validate email
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate password
      if (!validatePassword(password)) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      const { error } = await signIn(email, password);
      

      if (error) {
        console.error('Login error:', error);
        setError(error.message || 'Failed to sign in. Please try again.');
      }
      // Note: Navigation is handled in the useEffect hook
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={[styles.input, !email || validateEmail(email) ? null : styles.inputError]}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError(null);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[styles.input, !password || validatePassword(password) ? null : styles.inputError]}
        placeholder="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError(null);
        }}
        secureTextEntry
      />

      {/* Remember me and Forgot Password row */}
      <View style={styles.rowBetween}>
        <View style={styles.rowCenter}>
          <Checkbox
            value={rememberMe}
            onValueChange={setRememberMe}
            color={rememberMe ? '#34568B' : undefined}
            style={styles.checkbox}
          />
          <Text style={styles.rememberMeText}>Remember me</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          loading ? styles.buttonDisabled : styles.buttonActive,
          !validateEmail(email) || !validatePassword(password) ? styles.buttonDisabled : null,
        ]}
        onPress={handleSubmit}
        disabled={loading || !validateEmail(email) || !validatePassword(password)}
      >
        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
    borderRadius: 4,
    borderColor: '#34568B',
  },
  rememberMeText: {
    color: '#34568B',
    fontSize: 14,
  },
  forgotPassword: {
    color: '#F2994A',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#34568B',
  },
  buttonDisabled: {
    backgroundColor: '#ddd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ff3b30',
    marginBottom: 15,
    textAlign: 'center',
  },
});
