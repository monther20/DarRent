import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';

interface FilterOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  options?: string[];
}

interface FiltersBarProps {
  filterOptions: FilterOption[];
  activeFilters: Record<string, string>;
  onFilterPress: (filterId: string) => void;
  onClearFilters: () => void;
}

export function FiltersBar({
  filterOptions,
  activeFilters,
  onFilterPress,
  onClearFilters,
}: FiltersBarProps) {
  return (
    <View style={styles.filterSection}>
      <FlatList
        data={filterOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilters[item.id] ? styles.filterButtonActive : null,
            ]}
            onPress={() => onFilterPress(item.id)}
          >
            <Ionicons 
              name={item.icon} 
              size={18} 
              color={activeFilters[item.id] ? '#fff' : '#34568B'} 
            />
            <Text style={[
              styles.filterText,
              activeFilters[item.id] && styles.filterTextActive,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
      {Object.keys(activeFilters).length > 0 && (
        <TouchableOpacity 
          style={styles.clearFiltersButton}
          onPress={onClearFilters}
        >
          <Ionicons name="close-circle" size={20} color="#FF6B6B" />
          <Text style={styles.clearFiltersText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  filtersContainer: {
    maxHeight: 50,
    flex: 1,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#34568B',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#34568B',
    borderColor: '#34568B',
  },
  filterText: {
    color: '#34568B',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  clearFiltersText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
}); 