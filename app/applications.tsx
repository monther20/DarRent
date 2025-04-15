import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ApplicationsScreen() {
  const [selectedTab, setSelectedTab] = useState('active');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Applications</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Text style={styles.statsNumber}>3</Text>
          <View style={styles.statsBadges}>
            <View style={styles.badgeWarning}>
              <Text style={styles.badgeText}>2 Active</Text>
            </View>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeText}>1 Complete</Text>
            </View>
          </View>
        </View>
        <Text style={styles.statsLabel}>Total Applications</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['Active', 'Complete'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab.toLowerCase())}
            style={[
              styles.tab,
              selectedTab === tab.toLowerCase() && styles.tabActive
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.toLowerCase() && styles.tabTextActive
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView}>
        {selectedTab === 'active' ? (
          <>
            {/* Active Applications */}
            <View style={styles.contentContainer}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>Modern Villa</Text>
                    <Text style={styles.cardPrice}>1,800 JOD/month</Text>
                    <Text style={styles.cardStatus}>Status: Document Review</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>50%</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '50%' }]} />
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => router.push('/applications/continue')}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>Garden Apartment</Text>
                    <Text style={styles.cardPrice}>950 JOD/month</Text>
                    <Text style={styles.cardStatus}>Status: Background Check</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>70%</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '70%' }]} />
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => router.push('/applications/continue')}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Completed Applications */}
            <View style={styles.contentContainer}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>Downtown Studio</Text>
                    <Text style={styles.cardPrice}>650 JOD/month</Text>
                    <Text style={[styles.cardStatus, styles.statusSuccess]}>Status: Approved</Text>
                  </View>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color="#059669"
                  />
                </View>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => router.push('/applications/view')}
                >
                  <Text style={styles.buttonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Required Documents */}
      <View style={styles.documentsContainer}>
        <Text style={styles.documentsTitle}>Required Documents</Text>
        <View style={styles.documentsList}>
          <View style={styles.documentItem}>
            <Text>ID/Passport</Text>
            <MaterialCommunityIcons name="check" size={20} color="#059669" />
          </View>
          <View style={styles.documentItem}>
            <Text>Proof of Income</Text>
            <MaterialCommunityIcons name="check" size={20} color="#059669" />
          </View>
          <TouchableOpacity 
            style={styles.documentItem}
            onPress={() => router.push('/applications/upload')}
          >
            <Text>Bank Statement</Text>
            <MaterialCommunityIcons name="plus" size={20} color="#1e40af" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    backgroundColor: '#1e3a8a',
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsBadges: {
    flexDirection: 'row',
  },
  badgeWarning: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginRight: 8,
  },
  badgeSuccess: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    color: '#FFFFFF',
  },
  statsLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    textAlign: 'center',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardPrice: {
    color: '#1e40af',
  },
  cardStatus: {
    color: '#4B5563',
    marginTop: 4,
  },
  statusSuccess: {
    color: '#059669',
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressText: {
    color: '#D97706',
  },
  progressBar: {
    width: 80,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    marginTop: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 9999,
  },
  button: {
    backgroundColor: '#2563EB',
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  documentsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  documentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  documentsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
}); 