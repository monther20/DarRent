import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DrawerToggleButton } from '@react-navigation/drawer';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

export default function RenterDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <DrawerToggleButton 
          tintColor={Colors.light.text}
        />
        <Text style={styles.welcomeText}>
          {t('dashboard.welcome', { name: user?.fullName })}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, styles.statBoxLeft]}>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Active Rental</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMiddle]}>
          <Text style={styles.statValue}>$0</Text>
          <Text style={styles.statLabel}>Due This Month</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxRight]}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Maintenance Requests</Text>
        </View>
      </View>

      {/* Content Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.card}>
          <Text>No recent activity</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  statBoxLeft: {
    marginRight: 8,
  },
  statBoxMiddle: {
    marginHorizontal: 4,
  },
  statBoxRight: {
    marginLeft: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
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
}); 