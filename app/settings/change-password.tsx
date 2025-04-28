import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const ChangePasswordScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = t('validation.required');
    }

    if (!newPassword) {
      newErrors.newPassword = t('validation.required');
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t('validation.passwordLength');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.required');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await changePassword(currentPassword, newPassword);
      window.alert(t('settings.passwordChangedMessage'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.somethingWentWrong');
      window.alert(`${t('error')}: ${errorMessage}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t('settings.changePassword')}</Text>
        <Text style={styles.headerDescription}>{t('settings.changePasswordDescription')}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('settings.currentPassword')}</Text>
        <TextInput
          style={[styles.input, errors.currentPassword ? styles.inputError : styles.inputNormal]}
          type="password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder={t('settings.currentPassword')}
          placeholderTextColor="#9CA3AF"
        />
        {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('settings.newPassword')}</Text>
        <TextInput
          style={[styles.input, errors.newPassword ? styles.inputError : styles.inputNormal]}
          type="password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t('settings.newPassword')}
          placeholderTextColor="#9CA3AF"
        />
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('settings.confirmPassword')}</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword ? styles.inputError : styles.inputNormal]}
          type="password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t('settings.confirmPassword')}
          placeholderTextColor="#9CA3AF"
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>{t('settings.saveChanges')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  headerContainer: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  inputNormal: {
    borderColor: '#D1D5DB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ChangePasswordScreen;
