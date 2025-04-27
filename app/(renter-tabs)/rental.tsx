import React from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import { Text } from '@/components/Text';
import { Card } from '@/components/ui/Card';
import { UtilitiesSection } from '@/components/rental/UtilitiesSection';
import { MaintenanceSection } from '@/components/rental/MaintenanceSection';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedButton } from '@/components/ThemedButton';
import { ScreenHeader } from '@/components/ScreenHeader';

// Mock data for utilities
const UTILITIES = [
  {
    id: '1',
    type: 'Electricity',
    amount: '45 JOD',
    dueIn: '10 days',
  },
  {
    id: '2',
    type: 'Water',
    amount: '25 JOD',
    dueIn: '15 days',
  },
];

const QUICK_ACTIONS = [
  {
    id: '1',
    title: 'Message Owner',
    path: '/message-owner',
  },
  {
    id: '2',
    title: 'Report Issue',
    path: '/report-issue',
  },
  {
    id: '3',
    title: 'View Lease',
    path: '/view-lease',
  },
];

export default function RentalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Current Rental" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Property Details */}
          <ThemedCard style={styles.propertyCard} colorName="primary">
            <Image
              source={require('@/assets/images/property-placeholder.jpg')}
              style={styles.propertyImage}
            />
            <ThemedText style={styles.propertyTitle}>Garden Apartment</ThemedText>
            <ThemedText style={styles.propertyAddress}>123 Main St, Downtown</ThemedText>
            <View style={styles.propertyDetails}>
              <ThemedText style={styles.detailText}>2 Beds</ThemedText>
              <ThemedText style={styles.detailText}>1 Bath</ThemedText>
              <ThemedText style={styles.detailText}>850 sqft</ThemedText>
            </View>
          </ThemedCard>

          {/* Lease Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Lease Information</ThemedText>
            <ThemedCard style={styles.leaseCard} colorName="card">
              <View style={styles.leaseRow}>
                <ThemedText style={styles.leaseLabel}>Monthly Rent</ThemedText>
                <ThemedText style={styles.leaseValue}>$850</ThemedText>
              </View>
              <View style={styles.leaseRow}>
                <ThemedText style={styles.leaseLabel}>Lease Start</ThemedText>
                <ThemedText style={styles.leaseValue}>Jan 1, 2024</ThemedText>
              </View>
              <View style={styles.leaseRow}>
                <ThemedText style={styles.leaseLabel}>Lease End</ThemedText>
                <ThemedText style={styles.leaseValue}>Dec 31, 2024</ThemedText>
              </View>
            </ThemedCard>
          </View>

          {/* Payment History */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Payment History</ThemedText>
            <ThemedCard style={styles.paymentCard} colorName="card">
              <View style={styles.paymentRow}>
                <ThemedText style={styles.paymentDate}>March 2024</ThemedText>
                <ThemedText style={styles.paymentStatus}>Paid</ThemedText>
              </View>
              <View style={styles.paymentRow}>
                <ThemedText style={styles.paymentDate}>February 2024</ThemedText>
                <ThemedText style={styles.paymentStatus}>Paid</ThemedText>
              </View>
              <View style={styles.paymentRow}>
                <ThemedText style={styles.paymentDate}>January 2024</ThemedText>
                <ThemedText style={styles.paymentStatus}>Paid</ThemedText>
              </View>
            </ThemedCard>
          </View>

          {/* Contact Landlord */}
          <ThemedButton
            title="Contact Landlord"
            colorName="secondary"
            textColorName="text"
            style={styles.contactButton}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

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
  propertyCard: {
    marginBottom: 24,
    padding: 16,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: '600',
    colorName: 'text',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    colorName: 'text',
    opacity: 0.8,
    marginBottom: 12,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailText: {
    fontSize: 14,
    colorName: 'text',
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
  leaseCard: {
    padding: 16,
  },
  leaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leaseLabel: {
    fontSize: 14,
    colorName: 'text',
    opacity: 0.8,
  },
  leaseValue: {
    fontSize: 14,
    fontWeight: '600',
    colorName: 'text',
  },
  paymentCard: {
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentDate: {
    fontSize: 14,
    colorName: 'text',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '600',
    colorName: 'success',
  },
  contactButton: {
    marginTop: 8,
  },
}); 