import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedIcon } from '@/components/ThemedIcon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import { mockApi } from '../app/services/mockApi';

const requiredDocuments = [
  { label: 'ID/Passport', key: 'idCard' },
  { label: 'Proof of Income', key: 'proofOfIncome' },
  { label: 'Bank Statement', key: 'bankStatement' },
];

export default function ApplicationsScreen() {
  const [selectedTab, setSelectedTab] = useState<'active' | 'complete'>('active');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const primary = useThemeColor({}, 'primary');
  const secondary = useThemeColor({}, 'secondary');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const grey = useThemeColor({}, 'grey');

  useEffect(() => {
    setLoading(true);
    mockApi.getApplicationsDetailed().then((data: any[]) => {
      setApplications(data);
      setLoading(false);
    });
  }, []);

  // Split applications by status
  const activeApplications = applications.filter((app) => app.status === 'pending');
  const completedApplications = applications.filter((app) => app.status === 'approved');

  // For stats
  const total = applications.length;
  const activeCount = activeApplications.length;
  const completeCount = completedApplications.length;

  // For required documents, show status for the first active application (or fallback)
  const docStatus = activeApplications[0]?.documents || {
    idCard: false,
    proofOfIncome: false,
    bankStatement: false,
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <ThemedCard style={[styles.statsCard, { borderColor: border }]}>
            <ThemedIcon
              name="assignment"
              size={28}
              colorName="secondary"
              style={styles.statsIcon}
            />
            <ThemedText style={styles.statsNumber}>{activeCount}</ThemedText>
            <ThemedText style={styles.statsLabel}>Active</ThemedText>
          </ThemedCard>
          <ThemedCard style={[styles.statsCard, { borderColor: border }]}>
            <ThemedIcon
              name="check-circle"
              size={28}
              colorName="success"
              style={styles.statsIcon}
            />
            <ThemedText style={styles.statsNumber}>{completeCount}</ThemedText>
            <ThemedText style={styles.statsLabel}>Complete</ThemedText>
          </ThemedCard>
          <ThemedCard style={[styles.statsCard, { borderColor: border }]}>
            <ThemedIcon name="list" size={28} colorName="primary" style={styles.statsIcon} />
            <ThemedText style={styles.statsNumber}>{total}</ThemedText>
            <ThemedText style={styles.statsLabel}>Total</ThemedText>
          </ThemedCard>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['active', 'complete'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab as 'active' | 'complete')}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Applications List */}
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={primary} style={{ marginTop: 32 }} />
          ) : selectedTab === 'active' ? (
            activeApplications.length === 0 ? (
              <ThemedText style={{ textAlign: 'center', marginTop: 32, color: grey }}>
                No active applications.
              </ThemedText>
            ) : (
              activeApplications.map((app, idx) => (
                <ThemedCard key={app.id} style={styles.appCard}>
                  <View style={styles.appCardHeader}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.appTitle}>{app.propertyId}</ThemedText>
                      <ThemedText style={styles.appStatus}>
                        Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </ThemedText>
                    </View>
                    <View style={styles.progressContainer}>
                      <ThemedText style={[styles.progressText, { color: warning }]}>
                        {app.progress}%
                      </ThemedText>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${app.progress}%`, backgroundColor: warning },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                  <ThemedButton
                    title="Continue"
                    colorName="primary"
                    textColorName="card"
                    style={styles.appButton}
                    onPress={() => router.push(`/applications/continue/${app.id}`)}
                  />
                </ThemedCard>
              ))
            )
          ) : completedApplications.length === 0 ? (
            <ThemedText style={{ textAlign: 'center', marginTop: 32, color: grey }}>
              No completed applications.
            </ThemedText>
          ) : (
            completedApplications.map((app, idx) => (
              <ThemedCard key={app.id} style={styles.appCard}>
                <View style={styles.appCardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.appTitle}>{app.propertyId}</ThemedText>
                    <ThemedText style={[styles.appStatus, { color: success }]}>
                      Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </ThemedText>
                  </View>
                  <ThemedIcon name="check-circle" size={28} colorName="success" />
                </View>
                <ThemedButton
                  title="View Details"
                  colorName="secondary"
                  textColorName="card"
                  style={styles.appButton}
                  onPress={() => router.push(`/applications/view/${app.id}`)}
                />
              </ThemedCard>
            ))
          )}
        </View>

        {/* Required Documents */}
        <ThemedCard style={styles.documentsCard}>
          <ThemedText style={styles.documentsTitle}>Required Documents</ThemedText>
          {requiredDocuments.map((doc, idx) => (
            <View key={idx} style={styles.documentItem}>
              <ThemedText style={styles.documentLabel}>{doc.label}</ThemedText>
              {docStatus[doc.key] ? (
                <ThemedIcon name="check" size={20} colorName="success" />
              ) : (
                <TouchableOpacity onPress={() => router.push('/applications/upload')}>
                  <ThemedIcon name="add" size={20} colorName="primary" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 16,
    minWidth: 90,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    backgroundColor: 'white',
  },
  statsIcon: {
    marginBottom: 4,
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 13,
    color: '#666',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#34568B',
  },
  tabText: {
    color: '#34568B',
    fontWeight: '500',
    fontSize: 16,
  },
  tabTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  appCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 18,
  },
  appCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  appStatus: {
    color: '#7F8C8D',
    fontSize: 14,
    marginBottom: 2,
  },
  progressContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  progressBar: {
    width: 80,
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 9999,
    marginTop: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 9999,
  },
  appButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  documentsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 18,
  },
  documentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  documentLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
});
