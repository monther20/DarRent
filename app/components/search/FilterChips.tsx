import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface FilterChip {
  key: string;
  icon: string;
  label: string;
}

interface FilterChipsProps {
  activeFilter: string | null;
  onFilterChange: (key: string) => void;
  filterChips: FilterChip[];
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  activeFilter,
  onFilterChange,
  filterChips,
}) => (
  <View style={styles.filterRow}>
    <View style={{ flexDirection: 'row', flexWrap: 'nowrap', overflow: 'scroll' }}>
      {filterChips.map((chip, idx) => (
        <TouchableOpacity
          key={chip.key}
          style={[
            styles.filterChip,
            activeFilter === chip.key && styles.filterChipActive,
            idx === filterChips.length - 1 && { marginRight: 0 },
          ]}
          onPress={() => onFilterChange(chip.key)}
        >
          <Ionicons
            name={chip.icon as any}
            size={16}
            color={activeFilter === chip.key ? '#fff' : '#34568B'}
          />
          <Text style={[styles.filterChipText, activeFilter === chip.key && { color: '#fff' }]}>
            {chip.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 4,
    marginTop: 0,
    marginBottom: 0,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginRight: 14,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: '#34568B',
    height: 36,
  },
  filterChipActive: { backgroundColor: '#34568B', borderColor: '#34568B' },
  filterChipText: { marginLeft: 6, color: '#34568B', fontWeight: 'bold' },
});
