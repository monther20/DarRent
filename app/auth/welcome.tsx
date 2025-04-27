import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { changeLanguage } from '../../localization/i18n';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    await changeLanguage(lang);
  };

  const handleGetStarted = () => {
    router.push('/auth/register');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        {/* Logo and Header */}
        <View style={styles.headerContainer}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.title}>
            Welcome to DarRent
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Find your perfect home in Jordan
          </ThemedText>
        </View>

        {/* Language Toggle */}
        <View style={styles.languageToggleContainer}>
          <TouchableOpacity 
            style={[
              styles.languageOption,
              selectedLanguage === 'en' && styles.activeLanguage,
              { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <ThemedText style={[
              styles.languageText,
              selectedLanguage === 'en' && styles.activeLanguageText
            ]}>
              EN
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.languageOption,
              selectedLanguage === 'ar' && styles.activeLanguage,
              { borderTopRightRadius: 20, borderBottomRightRadius: 20 }
            ]}
            onPress={() => handleLanguageChange('ar')}
          >
            <ThemedText style={[
              styles.languageText,
              selectedLanguage === 'ar' && styles.activeLanguageText
            ]}>
              عربي
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <ThemedText style={styles.getStartedButtonText}>
              Get Started
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <ThemedText style={styles.loginButtonText}>
              Login
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Terms and Privacy */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Link href="/terms" style={styles.link}>Terms of Service And Privacy Policy</Link>
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#34568B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  languageToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F6F8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 32,
    overflow: 'hidden',
  },
  languageOption: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLanguage: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageText: {
    fontSize: 16,
    color: '#666',
  },
  activeLanguageText: {
    color: '#34568B',
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: '#E67E22',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#34568B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  link: {
    color: '#E67E22',
    textDecorationLine: 'none',
  },
}); 