import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MenuButton } from '@/components/MenuButton';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TermsScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Terms & Conditions</ThemedText>
        <View style={styles.headerIcon}>
          <MenuButton position="right" />
        </View>
      </ThemedView>

      <ScrollView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText style={styles.termsText}>
            {`1. Acceptance of Terms\nBy accessing or using DarRent, you agree to be bound by these terms.\n\n2. User Responsibilities\nYou are responsible for maintaining the confidentiality of your account and password.\n\n3. Property Listings\nAll property information must be accurate and not misleading.\n\n4. Payments\nAll payments are processed securely. DarRent is not responsible for third-party payment issues.\n\n5. Termination\nWe reserve the right to terminate accounts that violate our terms.\n\n6. Changes to Terms\nWe may update these terms at any time. Continued use of the app means you accept the new terms.\n\nFor full details, please contact support@darrent.com.`}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#34568B',
  },
  headerIcon: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2C3E50',
  },
  termsText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 22,
    marginBottom: 12,
  },
}); 