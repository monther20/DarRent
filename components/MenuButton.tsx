import React, { useState, useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  Animated,
  Image,
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

const { width } = Dimensions.get('window');

export function MenuButton({ position }: MenuButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const isRTL = language === 'ar';
  
  // Animation value
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Handle animation when menu visibility changes
  useEffect(() => {
    if (menuVisible) {
      // Reset position before animation starts if menu is becoming visible
      slideAnim.setValue(isRTL ? -100 : 100);
      
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: isRTL ? -100 : 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuVisible, isRTL]);

  const handleLogout = async () => {
    try {
      setMenuVisible(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      await logout();
      router.replace('/auth/welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      title: 'Profile',
      icon: 'user',
      route: '/profile',
    },
    {
      title: 'Home',
      icon: 'home',
      route: '/',
    },
    {
      title: 'Help & Support',
      icon: 'plus',
      route: '/help',
    },
    {
      title: 'Settings',
      icon: 'cog',
      route: '/settings',
    },
    {
      title: 'Terms & Conditions',
      icon: 'bars',
      route: '/terms',
    },
  ];

  const handlePress = (route: string) => {
    setMenuVisible(false);
    setTimeout(() => {
      router.push(route);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={styles.menuButton}
      >
        <FontAwesome name="bars" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Animated.View 
          style={[
            styles.modalContainer,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />
          <Animated.View
            style={[
              styles.menuContainer,
              isRTL ? styles.menuRTL : styles.menuLTR,
              { 
                transform: [{ translateX: slideAnim }] 
              }
            ]}
          >
            <View style={styles.profileSection}>
              <View style={styles.profileInfo}>
                <Image
                  source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
                  style={styles.profileImage}
                />
                <Text style={styles.profileName}>{user?.displayName || 'John Doe'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'john.doe@email.com'}</Text>
              </View>
            </View>

            <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handlePress(item.route)}
                >
                  <View style={styles.menuItemIconContainer}>
                    <FontAwesome name={item.icon as any} size={20} color={Colors.light.text} />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 999,
  },
  menuButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
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
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
  },
  menuLTR: {
    right: 0,
  },
  menuRTL: {
    left: 0,
  },
  profileSection: {
    backgroundColor: Colors.light.tint,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  menuItems: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  menuItemIconContainer: {
    width: 30,
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: Colors.light.text,
  },
});