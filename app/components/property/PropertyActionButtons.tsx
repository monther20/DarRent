import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PropertyActionButtonsProps {
  onSave: () => void;
  onRentRequest: () => void;
  isSaved: boolean;
  isAvailable: boolean;
  isRTL: boolean;
}

export const PropertyActionButtons: React.FC<PropertyActionButtonsProps> = ({
  onSave,
  onRentRequest,
  isSaved,
  isAvailable,
  isRTL,
}) => {
  const { t } = useTranslation(['propertyDetails', 'common']);

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={onSave}>
        <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color="#34568B" />
        <Text style={styles.saveButtonText}>
          {isSaved ? t('saved', { ns: 'propertyDetails' }) : t('save', { ns: 'propertyDetails' })}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.rentButton, !isAvailable && styles.disabledButton]}
        onPress={isAvailable ? onRentRequest : undefined}
      >
        <Ionicons name="home-outline" size={20} color="#fff" />
        <Text style={styles.rentButtonText}>{t('rentRequest', { ns: 'propertyDetails' })}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-between',
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#e0e0e0',
    flex: 1,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#34568B',
    fontWeight: '600',
    marginLeft: 6,
  },
  rentButton: {
    backgroundColor: '#34568B',
    flex: 2,
  },
  rentButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: '#94a3bd',
  },
});
