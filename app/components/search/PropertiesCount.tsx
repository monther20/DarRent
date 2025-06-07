import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface PropertiesCountProps {
  count: number;
  label?: string;
}

export const PropertiesCount: React.FC<PropertiesCountProps> = ({ count, label }) => (
  <Text style={styles.countText}>
    {count} {label}
  </Text>
);

const styles = StyleSheet.create({
  countText: {
    fontWeight: 'bold',
    color: '#34568B',
    fontSize: 15,
    marginLeft: 18,
    marginBottom: 8,
    marginTop: 12,
  },
});
