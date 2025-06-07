import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text } from '@/components/Text';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTranslation } from 'react-i18next';
import { mockBills } from '@/mockData/payments';
import { Bill } from '@/types/payment';
import { router } from 'expo-router';

export default function PaymentsScreen() {
  const { t } = useTranslation(['payments']);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  console.log(t('title'));
  const renderBillItem = ({ item }: { item: Bill }) => (
    <TouchableOpacity
      style={styles.billCard}
      onPress={() => {
        setSelectedBill(item);
        router.push({
          pathname: '/payment-details',
          params: { bill: JSON.stringify(item) },
        });
      }}
    >
      <View style={styles.billHeader}>
        <FontAwesome
          name={item.type === 'electricity' ? 'bolt' : item.type === 'water' ? 'tint' : 'home'}
          size={24}
          color={Colors.light.primary}
        />
        <View style={styles.billInfo}>
          <Text style={styles.billTitle}>{t(`billTypes.${item.type}`)}</Text>
          <Text style={styles.billDescription}>{item.description}</Text>
        </View>
      </View>
      <View style={styles.billDetails}>
        <View style={styles.billAmount}>
          <Text style={styles.amountLabel}>{t('amount')}</Text>
          <Text style={styles.amountValue}>${item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.billDueDate}>
          <Text style={styles.dueDateLabel}>{t('dueOn')}</Text>
          <Text style={styles.dueDateValue}>{new Date(item.dueDate).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, styles[`${item.status}Status`]]}>
        <Text style={styles.statusText}>{t(`${item.status}`)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title={t('title')} />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('currentBalance')}</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>
              $
              {mockBills
                .reduce((sum, bill) => sum + (bill.status === 'pending' ? bill.amount : 0), 0)
                .toFixed(2)}
            </Text>
            <Text style={styles.balanceLabel}>{t('dueOn')} 4/30/2025</Text>
          </View>
        </View>

        <View style={[styles.card, styles.marginTop]}>
          <Text style={styles.cardTitle}>{t('selectBill')}</Text>
          <FlatList
            data={mockBills}
            renderItem={renderBillItem}
            keyExtractor={(item: Bill) => item.id}
            scrollEnabled={false}
          />
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
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  billInfo: {
    marginLeft: 12,
    flex: 1,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  billDescription: {
    fontSize: 14,
    color: Colors.light.grey,
    marginTop: 2,
  },
  billDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billAmount: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.light.grey,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  billDueDate: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dueDateLabel: {
    fontSize: 12,
    color: Colors.light.grey,
  },
  dueDateValue: {
    fontSize: 14,
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pendingStatus: {
    backgroundColor: '#FEF3C7',
  },
  paidStatus: {
    backgroundColor: '#D1FAE5',
  },
  overdueStatus: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
