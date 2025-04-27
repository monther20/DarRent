import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';

interface FilterModalProps {
  visible: boolean;
  selectedFilter: string | null;
  activeFilters: Record<string, string>;
  filterOptions: {
    id: string;
    label: string;
    options?: string[];
  }[];
  onClose: () => void;
  onApplyFilter: (filterId: string, option: string) => void;
}

export function FilterModal({
  visible,
  selectedFilter,
  activeFilters,
  filterOptions,
  onClose,
  onApplyFilter,
}: FilterModalProps) {
  const selectedFilterOption = filterOptions.find(f => f.id === selectedFilter);

  if (!visible || !selectedFilterOption) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedFilterOption.label} Options
          </Text>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={selectedFilterOption.options || []}
          renderItem={({ item }: { item: string }) => (
            <TouchableOpacity
              style={[
                styles.modalOption,
                activeFilters[selectedFilter] === item && styles.modalOptionActive
              ]}
              onPress={() => onApplyFilter(selectedFilter, item)}
            >
              <Text style={[
                styles.modalOptionText,
                activeFilters[selectedFilter] === item && styles.modalOptionTextActive
              ]}>
                {item}
              </Text>
              {activeFilters[selectedFilter] === item && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item: string) => item}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34568B',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionActive: {
    backgroundColor: '#34568B',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
}); 