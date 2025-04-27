import React, { useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions, LayoutChangeEvent } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '../components/ScreenHeader';
import { LineChart } from 'react-native-chart-kit';

// Mock function to generate user-specific data
function getUserRevenueData(userId: string) {
  // For demonstration, use userId to seed different data
  const base = userId ? userId.length * 1000 : 5000;
  return [
    base + Math.floor(Math.random() * 200),
    base + 400 + Math.floor(Math.random() * 200),
    base + 800 + Math.floor(Math.random() * 200),
    base + 1200 + Math.floor(Math.random() * 200),
    base + 1800 + Math.floor(Math.random() * 200),
    base + 2025 + Math.floor(Math.random() * 200),
  ];
}

const userId = 'user123'; // Replace with actual user id from context/auth
const revenueData = getUserRevenueData(userId);

export default function FinancialScreen() {
  const [cardWidth, setCardWidth] = useState(Dimensions.get('window').width - 32);

  const handleCardLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setCardWidth(width);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Financial" />
      <ScrollView style={styles.content}>
        {/* Monthly Overview */}
        <ThemedText style={styles.sectionTitle}>Monthly Overview</ThemedText>
        <View style={styles.overviewCard} onLayout={handleCardLayout}>
          <View style={styles.revenueContainer}>
            <View>
              <ThemedText style={styles.revenueLabel}>Total Revenue</ThemedText>
              <ThemedText style={styles.revenueAmount}>6,025 JOD</ThemedText>
            </View>
            <View style={styles.percentageTag}>
              <ThemedText style={styles.percentageText}>+12%</ThemedText>
            </View>
          </View>
          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                labels: ['', '', '', '', '', ''],
                datasets: [
                  {
                    data: revenueData,
                    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={Math.max(cardWidth - 0, 0)}
              height={100}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              chartConfig={{
                backgroundGradientFrom: '#34568B',
                backgroundGradientTo: '#34568B',
                color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                strokeWidth: 2,
                propsForBackgroundLines: {
                  stroke: 'transparent',
                },
              }}
              bezier
            />
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
    overflow: 'hidden',
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
  chartWrapper: {
    width: '100%',
    height: 80,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  chart: {
    marginTop: 0,
    marginBottom: -8,
    borderRadius: 8,
    // backgroundColor: '#34568B',
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