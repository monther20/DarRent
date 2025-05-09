import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView as RNScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

interface PropertyGalleryProps {
  images: string[];
  onImagePress?: (index: number) => void;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, onImagePress }) => {
  const { t } = useTranslation(['propertyDetails']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingIndexes, setLoadingIndexes] = useState<{ [key: number]: boolean }>(
    Object.fromEntries(images.map((_, i) => [i, true])),
  );

  console.log('images', images);

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };

  const getImageSource = (image: string) => {
    if (!image) return require('../../../assets/images/property-placeholder.jpg');
    if (image.startsWith('http')) return { uri: image };
    if (image.startsWith('/assets')) return require(`@/assets/images/property-placeholder.jpg`);
    return { uri: image }; // fallback, but probably never reached
  };

  const handleImageLoad = (index: number) => {
    setLoadingIndexes((prev) => ({ ...prev, [index]: false }));
  };

  return (
    <View style={styles.outerContainer}>
      <RNScrollView
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            style={styles.slide}
            activeOpacity={0.85}
            onPress={() => onImagePress && onImagePress(index)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {loadingIndexes[index] && (
                <LottieView
                  source={require('../../../assets/animations/image-loading.json')}
                  autoPlay
                  loop
                  style={styles.lottie}
                />
              )}
              <Image
                source={getImageSource(image)}
                style={styles.image}
                resizeMode="cover"
                onLoadEnd={() => handleImageLoad(index)}
              />
              {/* {index === 0 && onImagePress && (
                <View style={styles.expandIconContainer}>
                  <Ionicons name="expand" size={28} color="#F2994A" />
                </View>
              )} */}
            </View>
          </TouchableOpacity>
        ))}
      </RNScrollView>

      {/* Image Counter */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {currentIndex + 1}/{images.length}
        </Text>
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[styles.paginationDot, index === currentIndex && styles.paginationDotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    height: 250,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  container: {
    position: 'relative',
  },
  slide: {
    width,
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  lottie: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: '35%',
    left: 0,
    right: 0,
    alignSelf: 'center',
    zIndex: 2,
  },
  expandIconContainer: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    padding: 2,
    zIndex: 10,
  },
  counter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#F2994A',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
