import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface LoaderProps {
  style?: ViewStyle;
  size?: number;
}

/**
 * Loading animation component using Lottie
 */
export const Loader: React.FC<LoaderProps> = ({ style, size = 100 }) => {
  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={require('../../assets/animations/loading.json')}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
