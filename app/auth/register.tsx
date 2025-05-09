import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { Link, useRouter } from 'expo-router';
import { IconSymbol } from '../../components/ui/IconSymbol';

export default function RegisterScreen() {
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
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <RegisterForm />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/auth/login" style={styles.loginLink}>
          Login
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
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
  loginLink: {
    color: '#F2994A',
    fontWeight: '600',
    fontSize: 15,
  },
});
