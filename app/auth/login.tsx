import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Image } from 'react-native';
import { LoginForm } from '../../components/auth/LoginForm';
import { Link, useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox';
import { IconSymbol } from '../../components/ui/IconSymbol';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            name="chevron.right"
            size={20}
            color="#fff"
            style={{ transform: [{ scaleX: -1 }] } as import('react-native').ViewStyle}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <LoginForm />
        {/* Password input is inside LoginForm */}

        <Text style={styles.orText}>Or continue with</Text>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.googleButton}>
            <MaterialCommunityIcons
              name="google"
              size={22}
              color="#EA4335"
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Google</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/auth/register" style={styles.signUpLink}>
          Sign up
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34568B',
    height: 80,
    paddingTop: 36,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#34568B',
    marginBottom: 4,
    marginTop: 16,
    fontWeight: '500',
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
  loginButton: {
    backgroundColor: '#34568B',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 16,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 48,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  googleIcon: {
    marginRight: 8,
  },
  googleButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 'auto',
  },
  footerText: {
    color: '#222',
    fontSize: 15,
  },
  signUpLink: {
    color: '#F2994A',
    fontWeight: '600',
    fontSize: 15,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 250,
  },
});
