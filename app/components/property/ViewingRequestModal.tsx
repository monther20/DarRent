import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ViewingRequestForm } from './ViewingRequestForm';
import { Ionicons } from '@expo/vector-icons';

type ViewingRequestModalProps = {
  visible: boolean;
  propertyId: string;
  propertyTitle: string;
  onClose: () => void;
  onSubmit: (dates: string[], notes: string) => void;
};

export const ViewingRequestModal = ({
  visible,
  propertyId,
  propertyTitle,
  onClose,
  onSubmit,
}: ViewingRequestModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          
          <ScrollView style={styles.scrollView}>
            <ViewingRequestForm
              propertyId={propertyId}
              propertyTitle={propertyTitle}
              onSubmit={onSubmit}
              onCancel={onClose}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    marginTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 5,
  },
}); 