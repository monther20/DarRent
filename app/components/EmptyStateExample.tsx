import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Loader, EmptyState, SuccessAnimation } from './animations';

/**
 * Example component that showcases all the Lottie animations
 */
export const EmptyStateExample: React.FC = () => {
  const { t } = useTranslation(['common']);
  const [currentAnimation, setCurrentAnimation] = useState<
    'loader' | 'emptyData' | 'noResults' | 'noSaved' | 'success' | null
  >(null);

  const renderAnimation = () => {
    switch (currentAnimation) {
      case 'loader':
        return <Loader size={150} />;
      case 'emptyData':
        return <EmptyState type="noData" message={t('noDataAvailable', { ns: 'common' })} />;
      case 'noResults':
        return <EmptyState type="noResults" message="No search results found" />;
      case 'noSaved':
        return <EmptyState type="noSaved" message="You haven't saved any properties yet" />;
      case 'success':
        return (
          <SuccessAnimation
            message="Operation completed successfully!"
            onAnimationFinish={() => setTimeout(() => setCurrentAnimation(null), 500)}
          />
        );
      default:
        return (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructions}>Select an animation to preview</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>{renderAnimation()}</View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, currentAnimation === 'loader' && styles.activeButton]}
          onPress={() => setCurrentAnimation('loader')}
        >
          <Text style={styles.buttonText}>Loading</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, currentAnimation === 'emptyData' && styles.activeButton]}
          onPress={() => setCurrentAnimation('emptyData')}
        >
          <Text style={styles.buttonText}>Empty Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, currentAnimation === 'noResults' && styles.activeButton]}
          onPress={() => setCurrentAnimation('noResults')}
        >
          <Text style={styles.buttonText}>No Results</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, currentAnimation === 'noSaved' && styles.activeButton]}
          onPress={() => setCurrentAnimation('noSaved')}
        >
          <Text style={styles.buttonText}>No Saved</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, currentAnimation === 'success' && styles.activeButton]}
          onPress={() => setCurrentAnimation('success')}
        >
          <Text style={styles.buttonText}>Success</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  animationContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    margin: 8,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#34568B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
