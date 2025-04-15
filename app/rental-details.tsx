import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RentalDetailsScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Property Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/garden-apt.jpg')}
          style={styles.propertyImage}
          contentFit="cover"
        />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Property Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Garden Apartment</Text>
        <Text style={styles.price}>850 JOD/month</Text>
        <Text style={styles.leaseInfo}>Lease ends March 15, 2025</Text>
      </View>

      {/* Next Payment */}
      <View style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>Next Payment</Text>
        <View style={styles.paymentContent}>
          <View>
            <Text style={styles.paymentLabel}>May Rent Due</Text>
            <Text style={styles.paymentAmount}>850 JOD</Text>
            <Text style={styles.paymentDue}>Due in 5 days</Text>
          </View>
          <TouchableOpacity 
            style={styles.payButton}
            onPress={() => router.push('/payments')}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Utilities and Bills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Utilities And Bills</Text>
        <View style={styles.utilitiesContainer}>
          <View style={styles.utilityCard}>
            <Text style={styles.utilityLabel}>Electricity</Text>
            <Text style={styles.utilityAmount}>45 JOD</Text>
            <Text style={styles.utilityDue}>Due in 10 days</Text>
          </View>
          <View style={styles.utilityCard}>
            <Text style={styles.utilityLabel}>Water</Text>
            <Text style={styles.utilityAmount}>25 JOD</Text>
            <Text style={styles.utilityDue}>Due in 15 days</Text>
          </View>
        </View>
      </View>

      {/* Maintenance Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Maintenance Requests</Text>
        <View style={styles.maintenanceCard}>
          <View style={styles.maintenanceContent}>
            <View>
              <Text style={styles.maintenanceTitle}>AC Maintenance</Text>
              <Text style={styles.maintenanceStatus}>Status: Scheduled for tomorrow</Text>
            </View>
            <TouchableOpacity 
              style={styles.trackButton}
              onPress={() => router.push('/maintenance/track')}
            >
              <Text style={styles.trackButtonText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.newRequestButton}
          onPress={() => router.push('/maintenance/new')}
        >
          <Text style={styles.newRequestText}>New Maintenance Request</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/message-owner')}
        >
          <MaterialCommunityIcons name="message" size={24} color="#1e40af" />
          <Text style={styles.actionText}>Message Owner</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonMiddle]}
          onPress={() => router.push('/report-issue')}
        >
          <MaterialCommunityIcons name="alert" size={24} color="#1e40af" />
          <Text style={styles.actionText}>Report Issue</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/view-lease')}
        >
          <MaterialCommunityIcons name="file-document" size={24} color="#1e40af" />
          <Text style={styles.actionText}>View Lease</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 256,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  price: {
    color: '#1e40af',
    fontSize: 18,
  },
  leaseInfo: {
    color: '#4B5563',
    marginTop: 4,
  },
  paymentCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 18,
  },
  paymentAmount: {
    color: '#1e40af',
    fontSize: 20,
    fontWeight: '600',
  },
  paymentDue: {
    color: '#4B5563',
  },
  payButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  payButtonText: {
    color: '#FFFFFF',
  },
  section: {
    padding: 16,
  },
  utilitiesContainer: {
    flexDirection: 'row',
  },
  utilityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  utilityLabel: {
    color: '#4B5563',
  },
  utilityAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  utilityDue: {
    color: '#4B5563',
  },
  maintenanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  maintenanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maintenanceTitle: {
    fontWeight: '600',
  },
  maintenanceStatus: {
    color: '#4B5563',
  },
  trackButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  trackButtonText: {
    color: '#FFFFFF',
  },
  newRequestButton: {
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  newRequestText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  quickActions: {
    padding: 16,
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonMiddle: {
    marginHorizontal: 8,
  },
  actionText: {
    color: '#1e40af',
    marginTop: 4,
  },
}); 