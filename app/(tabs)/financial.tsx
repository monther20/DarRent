import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#34568B',
    padding: 16,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2C3E50',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#7F8C8D',
  },
  value: {
    color: '#2C3E50',
    fontWeight: '600',
  },
  statusBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  received: {
    backgroundColor: '#E8F5E9',
  },
  pending: {
    backgroundColor: '#FFF3E0',
  },
  overdue: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  receivedText: {
    color: '#2E7D32',
  },
  pendingText: {
    color: '#F57C00',
  },
  overdueText: {
    color: '#C62828',
  },
});

export default function FinancialScreen() {
  const { t } = useTranslation();
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    received: 0,
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        const currentUser = await api.users.getCurrentUser();
        const data = await api.transactions.getFinancialSummary(currentUser.id);
        setFinancialData(data);
      } catch (error) {
        console.error('Error loading financial data:', error);
      }
    };

    loadFinancialData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText} children={t('financial.monthlyOverview')} />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle} children={t('financial.totalRevenue')} />
        <ThemedText style={[styles.value, { fontSize: 32 }]} children={`${financialData.totalRevenue} JOD`} />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle} children={t('financial.paymentStatus')} />
        
        <View style={[styles.statusBox, styles.received]}>
          <ThemedText style={[styles.statusText, styles.receivedText]} children={`${t('financial.received')}: ${financialData.received} JOD`} />
        </View>
        
        <View style={[styles.statusBox, styles.pending]}>
          <ThemedText style={[styles.statusText, styles.pendingText]} children={`${t('financial.pending')}: ${financialData.pending} JOD`} />
        </View>
        
        <View style={[styles.statusBox, styles.overdue]}>
          <ThemedText style={[styles.statusText, styles.overdueText]} children={`${t('financial.overdue')}: ${financialData.overdue} JOD`} />
        </View>
      </View>
    </ScrollView>
  );
} 