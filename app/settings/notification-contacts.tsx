import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Text } from '@/components/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import notificationService from '../services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

export default function NotificationContactsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    setLoading(true);
    try {
      const storedEmail = await AsyncStorage.getItem('user_email');
      const storedPhone = await AsyncStorage.getItem('user_phone_number');
      const emailVerifiedStatus = await AsyncStorage.getItem('email_verified');
      const phoneVerifiedStatus = await AsyncStorage.getItem('phone_verified');
      
      // Use user email from auth if available and no stored email
      if (user?.email && !storedEmail) {
        setEmail(user.email);
      } else if (storedEmail) {
        setEmail(storedEmail);
      }
      
      if (storedPhone) {
        setPhone(storedPhone);
      }
      
      setEmailVerified(emailVerifiedStatus === 'true');
      setPhoneVerified(phoneVerifiedStatus === 'true');
    } catch (error) {
      console.error('Error loading contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContactInfo = async () => {
    setLoading(true);
    try {
      // Simple email validation
      if (email && !validateEmail(email)) {
        Alert.alert(t('Invalid Email'), t('Please enter a valid email address'));
        setLoading(false);
        return;
      }
      
      // Simple phone validation
      if (phone && !validatePhone(phone)) {
        Alert.alert(t('Invalid Phone Number'), t('Please enter a valid phone number'));
        setLoading(false);
        return;
      }
      
      // Save to notification service and storage
      await notificationService.setEmailAddress(email);
      await notificationService.setPhoneNumber(phone);
      
      Alert.alert(t('Success'), t('Contact information updated successfully'));
      router.back();
    } catch (error) {
      console.error('Error saving contact info:', error);
      Alert.alert(t('Error'), t('Failed to save contact information'));
    } finally {
      setLoading(false);
    }
  };
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePhone = (phone: string) => {
    // Basic phone validation - at least 8 digits
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    return phoneRegex.test(phone);
  };
  
  const sendEmailVerification = async () => {
    if (!validateEmail(email)) {
      Alert.alert(t('Invalid Email'), t('Please enter a valid email address'));
      return;
    }
    
    try {
      // In a real app, this would send a verification code
      // For now, we'll simulate it with a mock success
      Alert.alert(
        t('Verification Code Sent'),
        t('A verification code has been sent to your email address')
      );
      
      // Mock verification - in a real app this would happen after user enters the verification code
      setTimeout(() => {
        mockVerifyEmail();
      }, 2000);
    } catch (error) {
      console.error('Error sending email verification:', error);
      Alert.alert(t('Error'), t('Failed to send verification code'));
    }
  };
  
  const mockVerifyEmail = async () => {
    try {
      await AsyncStorage.setItem('email_verified', 'true');
      setEmailVerified(true);
      Alert.alert(t('Success'), t('Email address verified successfully'));
    } catch (error) {
      console.error('Error verifying email:', error);
    }
  };
  
  const sendPhoneVerification = async () => {
    if (!validatePhone(phone)) {
      Alert.alert(t('Invalid Phone Number'), t('Please enter a valid phone number'));
      return;
    }
    
    try {
      // In a real app, this would send a verification code
      // For now, we'll simulate it with a mock success
      Alert.alert(
        t('Verification Code Sent'),
        t('A verification code has been sent to your phone number')
      );
      
      // Mock verification - in a real app this would happen after user enters the verification code
      setTimeout(() => {
        mockVerifyPhone();
      }, 2000);
    } catch (error) {
      console.error('Error sending phone verification:', error);
      Alert.alert(t('Error'), t('Failed to send verification code'));
    }
  };
  
  const mockVerifyPhone = async () => {
    try {
      await AsyncStorage.setItem('phone_verified', 'true');
      setPhoneVerified(true);
      Alert.alert(t('Success'), t('Phone number verified successfully'));
    } catch (error) {
      console.error('Error verifying phone:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Notification Contacts')}</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveContactInfo}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{t('Save')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Contact Information')}</Text>
          <Text style={styles.sectionDescription}>
            {t('Update your email and phone number for notifications')}
          </Text>

          <View style={styles.card}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('Email Address')}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('Enter your email address')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailVerified ? (
                  <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                    <Text style={styles.verifiedText}>{t('Verified')}</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.verifyButton} 
                    onPress={sendEmailVerification}
                  >
                    <Text style={styles.verifyButtonText}>{t('Verify')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('Phone Number')}</Text>
              <Text style={styles.inputHint}>
                {t('Include country code e.g. +1 555-123-4567')}
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('Enter your phone number')}
                  keyboardType="phone-pad"
                />
                {phoneVerified ? (
                  <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                    <Text style={styles.verifiedText}>{t('Verified')}</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.verifyButton} 
                    onPress={sendPhoneVerification}
                  >
                    <Text style={styles.verifyButtonText}>{t('Verify')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <View style={styles.noteCard}>
            <MaterialCommunityIcons name="information-outline" size={24} color="#3B82F6" />
            <Text style={styles.noteText}>
              {t('Verification is required to receive email and SMS notifications. Your contact information is kept secure and only used for notifications.')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#1F2937',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  verifyButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  verifiedBadge: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
  },
  verifiedText: {
    color: '#065F46',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  noteCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
}); 