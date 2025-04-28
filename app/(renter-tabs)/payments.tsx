import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function PaymentsScreen() {
  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Payments" />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Balance</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>$0.00</Text>
            <Text style={styles.balanceLabel}>Due on: N/A</Text>
            <TouchableOpacity style={styles.button}>
              <FontAwesome name="credit-card" size={16} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Make Payment</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, styles.marginTop]}>
          <Text style={styles.cardTitle}>Payment History</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No payment history</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: Colors.light.primary,
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  marginTop: {
    marginTop: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.light.text,
  },
  balanceContainer: {
    alignItems: 'center',
    padding: 16,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: Colors.light.grey,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.grey,
  },
});
