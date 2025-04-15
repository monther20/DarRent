import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

import api from '../../services/api';
import { User } from '../../services/mockData';
import { changeLanguage } from '@/localization/i18n';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const currentUser = await api.users.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'ar' : 'en';
    changeLanguage(newLanguage);
  };

  const handleLogout = () => {
    // Simulate logout
    router.replace('/');
  };

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ActivityIndicator size="large" color="#34568B" />
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' }}>
        <ThemedText style={{ color: '#2C3E50' }}>{t('common.error')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {/* Profile Header */}
      <ThemedView
        style={{
          backgroundColor: '#34568B',
          padding: 20,
          alignItems: 'center',
        }}
      >
        <Image
          source={{ uri: `https://source.unsplash.com/featured/?portrait,${user.fullName}` }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            marginBottom: 10,
          }}
        />
        <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
          {user.fullName}
        </ThemedText>
        <ThemedText style={{ color: 'white', marginTop: 5 }}>{user.email}</ThemedText>
        <TouchableOpacity
          style={{
            backgroundColor: '#E67E22',
            paddingHorizontal: 15,
            paddingVertical: 5,
            borderRadius: 15,
            marginTop: 10,
          }}
        >
          <ThemedText style={{ color: 'white' }}>{t('profile.editProfile')}</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Personal Information */}
      <ThemedView style={{ padding: 15 }}>
        <ThemedText
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#7F8C8D',
            marginBottom: 10,
            textTransform: 'uppercase',
          }}
        >
          {t('profile.personalInfo')}
        </ThemedText>
        <ThemedView
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <ThemedView
            style={{
              flexDirection: 'row',
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#ECF0F1',
              alignItems: 'center',
            }}
          >
            <ThemedView style={{ width: 24, alignItems: 'center', marginRight: 10 }}>
              <FontAwesome name="phone" size={18} color="#34568B" />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ color: '#7F8C8D', fontSize: 12 }}>{t('common.phoneNumber')}</ThemedText>
              <ThemedText style={{ color: '#2C3E50', marginTop: 3 }}>{user.phone}</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView
            style={{
              flexDirection: 'row',
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#ECF0F1',
              alignItems: 'center',
            }}
          >
            <ThemedView style={{ width: 24, alignItems: 'center', marginRight: 10 }}>
              <FontAwesome name="language" size={18} color="#34568B" />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ color: '#7F8C8D', fontSize: 12 }}>{t('profile.language')}</ThemedText>
              <ThemedText style={{ color: '#2C3E50', marginTop: 3 }}>
                {i18n.language === 'en' ? 'English' : 'العربية'}
              </ThemedText>
            </ThemedView>
            <TouchableOpacity onPress={toggleLanguage}>
              <ThemedText style={{ color: '#34568B' }}>{t('common.change')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView
            style={{
              flexDirection: 'row',
              padding: 15,
              alignItems: 'center',
            }}
          >
            <ThemedView style={{ width: 24, alignItems: 'center', marginRight: 10 }}>
              <FontAwesome name="map-marker" size={18} color="#34568B" />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ color: '#7F8C8D', fontSize: 12 }}>{t('profile.location')}</ThemedText>
              <ThemedText style={{ color: '#2C3E50', marginTop: 3 }}>
                {user.location.city}, {user.location.country}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Account Settings */}
      <ThemedView style={{ padding: 15 }}>
        <ThemedText
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#7F8C8D',
            marginBottom: 10,
            textTransform: 'uppercase',
          }}
        >
          {t('profile.accountSettings')}
        </ThemedText>
        <ThemedView
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <ThemedView
            style={{
              flexDirection: 'row',
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#ECF0F1',
              alignItems: 'center',
            }}
          >
            <ThemedView style={{ width: 24, alignItems: 'center', marginRight: 10 }}>
              <FontAwesome name="lock" size={18} color="#34568B" />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ color: '#2C3E50' }}>{t('profile.changePassword')}</ThemedText>
            </ThemedView>
            <FontAwesome name="chevron-right" size={14} color="#7F8C8D" />
          </ThemedView>

          <ThemedView
            style={{
              flexDirection: 'row',
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#ECF0F1',
              alignItems: 'center',
            }}
          >
            <ThemedView style={{ width: 24, alignItems: 'center', marginRight: 10 }}>
              <FontAwesome name="bell" size={18} color="#34568B" />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ color: '#2C3E50' }}>{t('profile.notifications')}</ThemedText>
            </ThemedView>
            <TouchableOpacity>
              <ThemedText style={{ color: '#34568B' }}>{t('common.manage')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView
            style={{
              flexDirection: 'row',
              padding: 15,
              alignItems: 'center',
            }}
          >
            <ThemedView style={{ width: 24, alignItems: 'center', marginRight: 10 }}>
              <FontAwesome name="shield" size={18} color="#34568B" />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ color: '#2C3E50' }}>{t('profile.privacySettings')}</ThemedText>
            </ThemedView>
            <FontAwesome name="chevron-right" size={14} color="#7F8C8D" />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Preferences */}
      <ThemedView style={{ padding: 15 }}>
        <ThemedText
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#7F8C8D',
            marginBottom: 10,
            textTransform: 'uppercase',
          }}
        >
          {t('profile.preferences')}
        </ThemedText>
        <ThemedView
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <ThemedView
            style={{
              flexDirection: 'row',
              padding: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#ECF0F1',
              alignItems: 'center',
            }}
          >
            <ThemedView style={{ width: 24, alignItems: 'center', marginRight: 10 }}>
              <FontAwesome name="money" size={18} color="#34568B" />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ color: '#2C3E50' }}>{t('profile.currency')}</ThemedText>
              <ThemedText style={{ color: '#7F8C8D', marginTop: 3, fontSize: 12 }}>JOD</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView
            style={{
              flexDirection: 'row',
              padding: 15,
              alignItems: 'center',
            }}
          >
            <ThemedView style={{ width: 24, alignItems: 'center', marginRight: 10 }}>
              <FontAwesome name="moon-o" size={18} color="#34568B" />
            </ThemedView>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={{ color: '#2C3E50' }}>{t('profile.darkMode')}</ThemedText>
            </ThemedView>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? '#E67E22' : '#f4f3f4'}
              trackColor={{ false: '#ECF0F1', true: '#F39C12' }}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Logout Button */}
      <TouchableOpacity
        style={{
          margin: 15,
          backgroundColor: '#E74C3C',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
        }}
        onPress={handleLogout}
      >
        <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>{t('common.logout')}</ThemedText>
      </TouchableOpacity>

      {/* App Info */}
      <ThemedView
        style={{
          padding: 15,
          alignItems: 'center',
        }}
      >
        <ThemedText style={{ color: '#7F8C8D', fontSize: 12 }}>DarRent v1.0.0</ThemedText>
        <ThemedText style={{ color: '#7F8C8D', fontSize: 10, marginTop: 5 }}>
          © 2023 DarRent. {t('common.allRightsReserved')}
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
} 