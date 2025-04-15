import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import Colors from '../constants/Colors';

interface MenuButtonProps {
  position: 'left' | 'right';
}

export function MenuButton({ position }: MenuButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const isRTL = language === 'ar';

  const handleLogout = async () => {
    try {
      setMenuVisible(false);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await logout();
      router.replace('/auth/welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      title: t('menu.messages'),
      icon: 'comments',
      route: '/chat',
    },
    {
      title: t('menu.profile'),
      icon: 'user',
      route: '/settings/profile',
    },
    {
      title: t('menu.settings'),
      icon: 'cog',
      route: '/settings',
    },
    {
      title: t('menu.language'),
      icon: 'language',
      route: '/settings/language',
    },
    {
      title: t('menu.theme'),
      icon: 'paint-brush',
      route: '/settings/theme',
    },
    {
      title: t('menu.signOut'),
      icon: 'sign-out',
      onPress: handleLogout,
    },
  ];

  const handlePress = async (item: typeof menuItems[0]) => {
    setMenuVisible(false);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    if (item.onPress) {
      await item.onPress();
    } else {
      router.push(item.route);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={styles.menuButton}>
        <FontAwesome name="bars" size={24} color="#fff" />
      </TouchableOpacity>

      {menuVisible && (
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.backdrop} 
            onPress={() => setMenuVisible(false)} 
            activeOpacity={1}
          />
          <View 
            style={[
              styles.menuContainer,
              isRTL ? styles.menuRTL : styles.menuLTR
            ]}>
            <View style={styles.header}>
              <Text style={styles.headerText}>{t('menu.title')}</Text>
              <TouchableOpacity 
                onPress={() => setMenuVisible(false)} 
                style={styles.closeButton}
              >
                <FontAwesome name="times" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handlePress(item)}>
                  <FontAwesome name={item.icon as any} size={20} color={Colors.light.text} />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
  },
  overlay: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    bottom: -50,
    zIndex: 1000,
    elevation: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuLTR: {
    right: 0,
  },
  menuRTL: {
    left: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.tint,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
}); 