import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { ViewingFeedback, ViewingFeedbackForm } from './ViewingFeedbackForm';

interface ViewingFeedbackModalProps {
  visible: boolean;
  propertyId: string;
  propertyTitle: string;
  viewingId: string;
  onClose: () => void;
  onSubmit: (feedback: ViewingFeedback) => void;
}

export const ViewingFeedbackModal = ({
  visible,
  propertyId,
  propertyTitle,
  viewingId,
  onClose,
  onSubmit,
}: ViewingFeedbackModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ViewingFeedbackForm
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          viewingId={viewingId}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 