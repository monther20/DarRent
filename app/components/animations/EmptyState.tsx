import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  style?: ViewStyle;
  message?: string;
  animationSize?: number;
  type?: 'noData' | 'noResults' | 'noSaved';
}

/**
 * Empty state animation component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  style,
  message,
  animationSize = 150,
  type = 'noData',
}) => {
  const { t } = useTranslation(['common']);

  const getAnimationSource = () => {
    switch (type) {
      case 'noResults':
        return require('../../assets/animations/no-results.json');
      case 'noSaved':
        return require('../../assets/animations/no-saved.json');
      case 'noData':
      default:
        return require('../../assets/animations/empty-box.json');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={getAnimationSource()}
        autoPlay
        loop={false}
        style={{ width: animationSize, height: animationSize }}
      />
      <Text style={styles.message}>{message || t('noDataAvailable', { ns: 'common' })}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
