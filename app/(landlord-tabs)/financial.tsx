import React from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '../components/ScreenHeader';

export default function FinancialScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Financial" />
      <ScrollView style={styles.content}>
        {/* Monthly Overview */}
        <ThemedText style={styles.sectionTitle}>Monthly Overview</ThemedText>
        <View style={styles.overviewCard}>
          <View style={styles.revenueContainer}>
            <View>
              <ThemedText style={styles.revenueLabel}>Total Revenue</ThemedText>
              <ThemedText style={styles.revenueAmount}>6,025 JOD</ThemedText>
            </View>
            <View style={styles.percentageTag}>
              <ThemedText style={styles.percentageText}>+12%</ThemedText>
            </View>
          </View>
          <View style={styles.graphContainer}>
            {/* Simple line representation */}
            <View style={styles.graph} />
          </View>
        </View>

        {/* Payment Status */}
        <ThemedText style={styles.sectionTitle}>Payment Status</ThemedText>
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            <ThemedText style={styles.statusLabel}>Received</ThemedText>
            <ThemedText style={styles.statusAmount}>3,685 JOD</ThemedText>
          </View>
          <View style={styles.statusCard}>
            <ThemedText style={styles.statusLabel}>Pending</ThemedText>
            <ThemedText style={styles.statusAmount}>1,490 JOD</ThemedText>
          </View>
          <View style={styles.statusCard}>
            <ThemedText style={styles.statusLabel}>Overdue</ThemedText>
            <ThemedText style={styles.statusAmount}>850 JOD</ThemedText>
          </View>
        </View>

        {/* Recent Transactions */}
        <ThemedText style={styles.sectionTitle}>Recent Transactions</ThemedText>
        <View style={styles.transactionsList}>
          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <Image 
                source={require('@/assets/images/property-placeholder.jpg')}
                style={styles.propertyImage}
              />
              <View>
                <ThemedText style={styles.propertyName}>Garden Apartment</ThemedText>
                <ThemedText style={styles.tenantInfo}>John Doe • May Rent</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.transactionAmount}>850 JOD</ThemedText>
          </View>

          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <Image 
                source={require('@/assets/images/property-placeholder.jpg')}
                style={styles.propertyImage}
              />
              <View>
                <ThemedText style={styles.propertyName}>City View Condo</ThemedText>
                <ThemedText style={styles.tenantInfo}>Sarah Parker • May Rent</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.transactionAmount}>1,065 JOD</ThemedText>
          </View>

          <View style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <Image 
                source={require('@/assets/images/property-placeholder.jpg')}
                style={styles.propertyImage}
              />
              <View>
                <ThemedText style={styles.propertyName}>Mountain Villa</ThemedText>
                <ThemedText style={styles.tenantInfo}>Mike Johnson • May Rent</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.transactionAmount}>1,770 JOD</ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34568B',
    marginBottom: 12,
  },
  overviewCard: {
    backgroundColor: '#34568B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  revenueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  revenueLabel: {
    fontSize: 14,
    color: 'white',
    marginBottom: 4,
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  percentageTag: {
    backgroundColor: '#E67E22',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  percentageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  graphContainer: {
    height: 60,
    justifyContent: 'center',
  },
  graph: {
    height: 2,
    backgroundColor: 'white',
    opacity: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#34568B',
    borderRadius: 8,
    padding: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: 'white',
    marginBottom: 4,
  },
  statusAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  transactionsList: {
    gap: 1,
    backgroundColor: '#34568B',
    borderRadius: 8,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#34568B',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  propertyImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff20',
  },
  propertyName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  tenantInfo: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
}); 