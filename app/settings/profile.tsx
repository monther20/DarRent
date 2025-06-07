import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';

interface CustomTextInputProps extends React.ComponentProps<typeof RNTextInput> {
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'number-pad'
    | 'decimal-pad'
    | 'url'
    | 'web-search';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const TextInput = (props: CustomTextInputProps) => {
  return <RNTextInput {...props} />;
};

const ProfileScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      window.alert(`${t('error')}: ${t('settings.permissionDenied')}`);
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name) {
      newErrors.name = t('validation.required');
    }

    if (!email) {
      newErrors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.invalidEmail');
    }

    if (!phone) {
      newErrors.phone = t('validation.required');
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = t('validation.invalidPhone');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await updateProfile({
        fullName: name,
        email,
        phone,
        profileImage: profileImage || undefined,
      });
      window.alert(`${t('settings.profileUpdated')}\n${t('settings.profileUpdatedMessage')}`);
    } catch (error) {
      window.alert(`${t('error')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.profileImageButton}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <MaterialIcons name="person" size={48} style={styles.profilePlaceholder} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
          <Text style={styles.changePhotoText}>{t('settings.changePhoto')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('settings.name')}</Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : styles.inputNormal]}
          value={name}
          onChangeText={setName}
          placeholder={t('settings.name')}
          placeholderTextColor="#9CA3AF"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('settings.email')}</Text>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : styles.inputNormal]}
          value={email}
          onChangeText={setEmail}
          placeholder={t('settings.email')}
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('settings.phone')}</Text>
        <TextInput
          style={[styles.input, errors.phone ? styles.inputError : styles.inputNormal]}
          value={phone}
          onChangeText={setPhone}
          placeholder={t('settings.phone')}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
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
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    color: '#9CA3AF',
  },
  changePhotoButton: {
    marginTop: 8,
  },
  changePhotoText: {
    color: '#2563EB',
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

export default ProfileScreen;
