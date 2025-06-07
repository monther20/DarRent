import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from 'expo-modules-core';
import { ViewingPreparationChecklist } from './ViewingPreparationChecklist';

interface ChecklistItem {
  id: string;
  text: string;
  category: 'documents' | 'questions' | 'inspection' | 'custom';
  checked: boolean;
}

interface PropertyFeature {
  name: string;
  value: string | number | boolean;
}

interface ViewingPreparationModalProps {
  visible: boolean;
  propertyId: string;
  propertyTitle: string;
  propertyFeatures?: PropertyFeature[];
  onClose: () => void;
  onSave?: (items: ChecklistItem[]) => void;
}

export const ViewingPreparationModal = ({
  visible,
  propertyId,
  propertyTitle,
  propertyFeatures,
  onClose,
  onSave,
}: ViewingPreparationModalProps) => {
  return (
    visible ? (
      <View style={styles.container}>
        <ViewingPreparationChecklist
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          propertyFeatures={propertyFeatures}
          onClose={onClose}
          onSave={onSave}
        />
      </View>
    ) : null
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 