import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  maxStars?: number;
  color?: string;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onChange,
  size = 24,
  maxStars = 5,
  color = '#F2994A',
  readOnly = false,
}) => {
  const handlePress = (index: number) => {
    if (readOnly) return;
    // Convert to 1-based index for rating
    const newRating = index + 1;
    // If clicking the same star twice, clear rating
    if (newRating === rating) {
      onChange?.(0);
    } else {
      onChange?.(newRating);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const filled = index < rating;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(index)}
            disabled={readOnly}
            style={[styles.star, { padding: Math.max(size / 8, 4) }]}
          >
            <Ionicons
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={color}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  star: {
    padding: 4,
  },
});

export default StarRating; 