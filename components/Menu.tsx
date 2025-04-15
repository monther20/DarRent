import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../app/contexts/AuthContext';
import Colors from '../constants/Colors';
import { Modal } from 'react-native';

interface MenuProps {
  visible: boolean;
  onClose: () => void;
}

export function Menu({ visible, onClose }: MenuProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const isRTL = language === 'ar';

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
      onPress: logout,
    },
  ];

  const handlePress = (item: typeof menuItems[0]) => {
    if (item.onPress) {
      item.onPress();
    } else {
      router.push(item.route);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.menuContainer, isRTL ? styles.menuRTL : styles.menuLTR]}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{t('menu.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={24} color={Colors.light.text} />
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
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