import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedButton } from '@/components/ThemedButton';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LandlordProfileScreen() {
  const { user } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Profile Header */}
          <ThemedCard style={styles.profileHeader} colorName="primary">
            <View style={styles.profileHeaderRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={26} color="#fff" />
              </TouchableOpacity>
              <ThemedText style={styles.profileHeaderTitle}>Profile</ThemedText>
              <View style={{ width: 32 }} />
            </View>
            <Image
              source={require('@/assets/images/profile-placeholder.jpg')}
              style={styles.profileImage}
            />
            <ThemedText style={styles.profileName}>{user?.fullName}</ThemedText>
            <ThemedText style={styles.profileEmail}>{user?.email}</ThemedText>
          </ThemedCard>

          {/* Account Settings */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Account Settings</ThemedText>
            <ThemedCard style={styles.settingsCard} colorName="card">
              <ThemedButton
                title="Edit Profile"
                colorName="secondary"
                textColorName="text"
                style={styles.settingsButton}
              />
              <ThemedButton
                title="Change Password"
                colorName="secondary"
                textColorName="text"
                style={styles.settingsButton}
              />
              <ThemedButton
                title="Notification Settings"
                colorName="secondary"
                textColorName="text"
                style={styles.settingsButton}
              />
            </ThemedCard>
          </View>

          {/* Preferences (placeholder) */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
            <ThemedCard style={styles.preferencesCard} colorName="card">
              <ThemedText style={styles.preferenceTitle}>Preferred Locations</ThemedText>
              <ThemedText style={styles.preferenceValue}>-</ThemedText>
              <ThemedText style={styles.preferenceTitle}>Budget Range</ThemedText>
              <ThemedText style={styles.preferenceValue}>-</ThemedText>
              <ThemedText style={styles.preferenceTitle}>Property Type</ThemedText>
              <ThemedText style={styles.preferenceValue}>-</ThemedText>
            </ThemedCard>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

export const options = { headerShown: false };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    colorName: 'primary',
    marginBottom: 12,
  },
  settingsCard: {
    padding: 16,
  },
  settingsButton: {
    marginBottom: 12,
  },
  preferencesCard: {
    padding: 16,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    colorName: 'text',
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 14,
    colorName: 'text',
    opacity: 0.8,
    marginBottom: 16,
  },
});
