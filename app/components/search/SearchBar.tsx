import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onClear, placeholder }) => (
  <View style={styles.searchBarContainer}>
    <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
    <TextInput
      style={styles.searchBar}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
        <Ionicons name="close-circle" size={18} color="#888" />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: { marginRight: 8 },
  searchBar: { flex: 1, fontSize: 16, backgroundColor: 'transparent', paddingVertical: 8 },
  clearBtn: { marginLeft: 4 },
});
