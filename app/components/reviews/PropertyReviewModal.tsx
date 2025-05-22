import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyReviewForm } from './PropertyReviewForm';

interface PropertyReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  contractId: string;
  propertyId: string;
  propertyName: string;
  landlordId: string;
  landlordName: string;
  leaseEnd: string;
}

export const PropertyReviewModal = ({
  visible,
  onClose,
  onSubmit,
  contractId,
  propertyId,
  propertyName,
  landlordId,
  landlordName,
  leaseEnd,
}: PropertyReviewModalProps) => {
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
          
          <PropertyReviewForm
            contractId={contractId}
            propertyId={propertyId}
            propertyName={propertyName}
            landlordId={landlordId}
            landlordName={landlordName}
            leaseEnd={leaseEnd}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
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
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 5,
  },
}); 