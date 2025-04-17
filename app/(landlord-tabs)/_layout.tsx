import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../contexts/AuthContext';
import { RoleGuard } from '../../components/RoleGuard';
import { useLanguage } from '../../contexts/LanguageContext';
import { MenuButton } from '../../components/MenuButton';
import Colors from '../../constants/Colors';
import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { BottomNavBar } from '../components/BottomNavBar';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function LandlordLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  content: {
    flex: 1,
  },
}); 