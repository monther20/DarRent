import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MenuButton } from '@/components/MenuButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface ScreenHeaderProps {
  title: string;
  showAddButton?: boolean;
  onAddPress?: () => void;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({
  title,
  showAddButton,
  onAddPress,
  rightElement,
}: ScreenHeaderProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <View style={styles.rightContainer}>
            {rightElement}
            {showAddButton && (
              <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            )}
            <View style={styles.menuButtonContainer}>
              {isRTL ? <MenuButton position="left" /> : <MenuButton position="right" />}
            </View>
          </View>
        </View>
      </View>
      <View style={styles.shadowLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#34568B',
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#E67E22',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  menuButtonContainer: {
    backgroundColor: '#E67E22',
    borderRadius: 18,
    overflow: 'hidden',
  },
  shadowLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginTop: -1, // Overlap with the header to hide any gap
  },
});
