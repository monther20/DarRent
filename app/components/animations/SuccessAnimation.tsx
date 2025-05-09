import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface SuccessAnimationProps {
  style?: ViewStyle;
  message?: string;
  onAnimationFinish?: () => void;
  size?: number;
}

/**
 * Success animation component with optional callback
 */
export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  style,
  message,
  onAnimationFinish,
  size = 150,
}) => {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // If we need to do something when animation finishes
    if (onAnimationFinish) {
      const timer = setTimeout(() => {
        onAnimationFinish();
      }, 2000); // Typical animation duration

      return () => clearTimeout(timer);
    }
  }, [onAnimationFinish]);

  return (
    <View style={[styles.container, style]}>
      <LottieView
        ref={animationRef}
        source={require('../../assets/animations/success.json')}
        autoPlay
        loop={false}
        style={{ width: size, height: size }}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#34568B',
    textAlign: 'center',
  },
});
