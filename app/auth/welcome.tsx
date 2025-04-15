import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { changeLanguage } from '../../localization/i18n';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    await changeLanguage(lang);
  };

  const handleContinue = () => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Logo and Header */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('@/assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.title}>
          DarRent
        </ThemedText>
        <ThemedText style={styles.tagline}>
          {t('welcome.tagline')}
        </ThemedText>
      </View>
      
      {/* Language Selection */}
      <View style={styles.languageContainer}>
        <ThemedText style={styles.languageTitle}>
          {t('welcome.selectLanguage')}
        </ThemedText>
        
        <View style={styles.languageOptionsContainer}>
          <TouchableOpacity 
            style={[
              styles.languageOption,
              selectedLanguage === 'en' && styles.selectedLanguageOption
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <View style={styles.languageIconContainer}>
              <FontAwesome 
                name="globe" 
                size={20} 
                color={selectedLanguage === 'en' ? 'white' : '#34568B'} 
              />
            </View>
            <ThemedText 
              style={[
                styles.languageText,
                selectedLanguage === 'en' && styles.selectedLanguageText
              ]}
            >
              English
            </ThemedText>
            {selectedLanguage === 'en' && (
              <View style={styles.checkmarkContainer}>
                <FontAwesome name="check" size={18} color="white" />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={[
              styles.languageOption,
              selectedLanguage === 'ar' && styles.selectedLanguageOption
            ]}
            onPress={() => handleLanguageChange('ar')}
          >
            <View style={styles.languageIconContainer}>
              <FontAwesome 
                name="globe" 
                size={20} 
                color={selectedLanguage === 'ar' ? 'white' : '#34568B'} 
              />
            </View>
            <ThemedText 
              style={[
                styles.languageText,
                selectedLanguage === 'ar' && styles.selectedLanguageText
              ]}
            >
              العربية
            </ThemedText>
            {selectedLanguage === 'ar' && (
              <View style={styles.checkmarkContainer}>
                <FontAwesome name="check" size={18} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <ThemedText style={styles.continueButtonText}>
            {t('welcome.continue')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
    marginBottom: 48,
  },
  logo: {
    width: 128,
    height: 128,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34568B',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  languageContainer: {
    paddingHorizontal: 32,
    marginTop: 16,
  },
  languageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  languageOptionsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 32,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  selectedLanguageOption: {
    backgroundColor: '#34568B',
  },
  languageIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkmarkContainer: {
    marginLeft: 'auto',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonContainer: {
    paddingHorizontal: 32,
    marginTop: 'auto',
    marginBottom: 48,
  },
  continueButton: {
    backgroundColor: '#E67E22',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 