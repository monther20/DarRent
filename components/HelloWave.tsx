import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

export function HelloWave() {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isAnimating) {
      setIsAnimating(true);

      // Simple animation using setInterval
      let count = 0;
      const interval = setInterval(() => {
        if (count % 2 === 0) {
          setRotation(25);
        } else {
          setRotation(0);
        }
        count++;

        if (count >= 8) {
          // 4 complete cycles (2 steps per cycle)
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, 150);

      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  return (
    <View style={[styles.container, { transform: [{ rotate: `${rotation}deg` }] }]}>
      <ThemedText style={styles.text} children="👋" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Add any container styles here
  },
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
