import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  withSpring, 
  interpolate,
  useAnimatedStyle 
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedCard } from '@/components/ThemedCard';
import { ThemedButton } from '@/components/ThemedButton';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { FiltersBar } from '@/components/search/FiltersBar';
import { FilterModal } from '@/components/search/FilterModal';
import { MenuButton } from '@/components/MenuButton';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenHeader } from '@/components/ScreenHeader';

interface Property {
  id: string;
  title: string;
  price: number;
  details: {
    beds: number;
    baths: number;
    area: number;
    type: 'apartment' | 'villa' | 'studio' | 'house';
  };
  location: string;
  image: any;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Mock data for properties
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment',
    price: 950,
    details: {
      beds: 2,
      baths: 1,
      area: 120,
      type: 'apartment'
    },
    location: 'Abdoun, Amman',
    image: require('@/assets/images/modern-apt.jpg'),
    coordinates: {
      latitude: 31.957389,
      longitude: 35.912897,
    },
  },
  {
    id: '2',
    title: 'Luxury Villa',
    price: 1800,
    details: {
      beds: 4,
      baths: 3,
      area: 300,
      type: 'villa'
    },
    location: 'Dabouq, Amman',
    image: require('@/assets/images/luxury-villa.jpg'),
    coordinates: {
      latitude: 31.957589,
      longitude: 35.913897,
    },
  },
  {
    id: '3',
    title: 'Cozy Studio',
    price: 450,
    details: {
      beds: 1,
      baths: 1,
      area: 45,
      type: 'studio'
    },
    location: 'Jabal Amman',
    image: require('@/assets/images/studio-apt.jpg'),
    coordinates: {
      latitude: 31.956389,
      longitude: 35.911897,
    },
  },
  {
    id: '4',
    title: 'Family House',
    price: 1200,
    details: {
      beds: 3,
      baths: 2,
      area: 180,
      type: 'house'
    },
    location: 'Khalda, Amman',
    image: require('@/assets/images/garden-apt.jpg'),
    coordinates: {
      latitude: 31.958389,
      longitude: 35.914897,
    },
  },
  {
    id: '5',
    title: 'Penthouse Suite',
    price: 2200,
    details: {
      beds: 3,
      baths: 3,
      area: 250,
      type: 'apartment'
    },
    location: 'Abdoun, Amman',
    image: require('@/assets/images/luxury-apt.jpg'),
    coordinates: {
      latitude: 31.959389,
      longitude: 35.915897,
    },
  }
];

interface FilterOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  options?: string[];
}

const FILTER_OPTIONS: FilterOption[] = [
  { 
    id: 'price',
    label: 'Price',
    icon: 'cash-outline',
    options: ['Low to High', 'High to Low', 'Under 500', '500-1000', '1000-1500', 'Over 1500']
  },
  { 
    id: 'type',
    label: 'Type',
    icon: 'home-outline',
    options: ['All Types', 'Apartment', 'Villa', 'Studio', 'House']
  },
  { 
    id: 'rooms',
    label: 'Rooms',
    icon: 'bed-outline',
    options: ['Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms']
  },
  { 
    id: 'area',
    label: 'Area',
    icon: 'resize-outline',
    options: ['Under 100m²', '100-150m²', '150-200m²', 'Over 200m²']
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [filteredProperties, setFilteredProperties] = useState(MOCK_PROPERTIES);
  const mapAnimation = useSharedValue(showMap ? 1 : 0);

  const toggleMap = () => {
    const toValue = showMap ? 0 : 1;
    setShowMap(!showMap);
    mapAnimation.value = withSpring(toValue, {
      damping: 7,
      stiffness: 20
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(mapAnimation.value, [0, 1], [0, 200]),
      opacity: mapAnimation.value,
      marginBottom: interpolate(mapAnimation.value, [0, 1], [0, 16])
    };
  });

  const applyFilter = (filterId: string, option: string) => {
    const newFilters = { ...activeFilters, [filterId]: option };
    setActiveFilters(newFilters);
    
    let filtered = [...MOCK_PROPERTIES];
    
    Object.entries(newFilters).forEach(([id, value]) => {
      switch (id) {
        case 'price':
          filtered = filtered.filter(property => {
            switch (value) {
              case 'Low to High':
                return filtered.sort((a, b) => a.price - b.price);
              case 'High to Low':
                return filtered.sort((a, b) => b.price - a.price);
              case 'Under 500':
                return property.price < 500;
              case '500-1000':
                return property.price >= 500 && property.price <= 1000;
              case '1000-1500':
                return property.price >= 1000 && property.price <= 1500;
              case 'Over 1500':
                return property.price > 1500;
              default:
                return true;
            }
          });
          break;
        case 'type':
          if (value !== 'All Types') {
            filtered = filtered.filter(property => 
              property.details.type.toLowerCase() === value.toLowerCase()
            );
          }
          break;
        case 'rooms':
          filtered = filtered.filter(property => {
            switch (value) {
              case 'Studio':
                return property.details.beds === 0;
              case '1 Bedroom':
                return property.details.beds === 1;
              case '2 Bedrooms':
                return property.details.beds === 2;
              case '3 Bedrooms':
                return property.details.beds === 3;
              case '4+ Bedrooms':
                return property.details.beds >= 4;
              default:
                return true;
            }
          });
          break;
        case 'area':
          filtered = filtered.filter(property => {
            switch (value) {
              case 'Under 100m²':
                return property.details.area < 100;
              case '100-150m²':
                return property.details.area >= 100 && property.details.area <= 150;
              case '150-200m²':
                return property.details.area >= 150 && property.details.area <= 200;
              case 'Over 200m²':
                return property.details.area > 200;
              default:
                return true;
            }
          });
          break;
      }
    });
    
    setFilteredProperties(filtered);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setFilteredProperties(MOCK_PROPERTIES);
    setSelectedFilter(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Find Your Home" />
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
        />
      </View>

      <View style={styles.filtersWrapper}>
        <FiltersBar
          filterOptions={FILTER_OPTIONS}
          activeFilters={activeFilters}
          onFilterPress={(filterId) => {
            setSelectedFilter(filterId);
            setShowFilterModal(true);
          }}
          onClearFilters={clearFilters}
        />
        <LinearGradient
          colors={['rgba(245, 246, 248, 0)', 'rgba(245, 246, 248, 1)']}
          start={{ x: 0.9, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.filterGradient}
        />
      </View>

      <Animated.View style={[styles.mapWrapper, animatedStyle]}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 31.957389,
              longitude: 35.912897,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {filteredProperties.map((property) => (
              <Marker
                key={property.id}
                coordinate={property.coordinates}
                title={property.title}
                description={`${property.price} JOD/month`}
              />
            ))}
          </MapView>
        </View>
      </Animated.View>

      <View style={styles.listingsContainer}>
        <View style={styles.listingHeader}>
          <ThemedText style={styles.resultsText}>
            {filteredProperties.length} Properties Found
          </ThemedText>
          <ThemedButton
            title={showMap ? "List View" : "Map View"}
            colorName="primary"
            textColorName="text"
            style={styles.mapToggle}
            onPress={toggleMap}
          />
        </View>

        <FlatList
          data={filteredProperties}
          renderItem={({ item }: { item: Property }) => (
            <ThemedCard style={styles.propertyCard} colorName="primary">
              <Image source={item.image} style={styles.propertyImage} />
              <View style={styles.propertyInfo}>
                <ThemedText style={styles.propertyTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.propertyPrice}>{item.price} JOD/month</ThemedText>
                <View style={styles.propertyDetails}>
                  <ThemedText style={styles.detailText}>{item.details.beds} Beds</ThemedText>
                  <ThemedText style={styles.detailText}>{item.details.baths} Baths</ThemedText>
                  <ThemedText style={styles.detailText}>{item.details.area} sqft</ThemedText>
                </View>
                <ThemedText style={styles.propertyLocation}>{item.location}</ThemedText>
              </View>
            </ThemedCard>
          )}
          keyExtractor={(item: Property) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listingsContent}
        />
      </View>

      <FilterModal
        visible={showFilterModal}
        selectedFilter={selectedFilter}
        activeFilters={activeFilters}
        filterOptions={FILTER_OPTIONS}
        onClose={() => setShowFilterModal(false)}
        onApplyFilter={applyFilter}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'primary',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchIcon: {
    colorName: 'text',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    colorName: 'text',
  },
  filtersWrapper: {
    position: 'relative',
    marginTop: -1,
  },
  filterGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 32,
    zIndex: 1,
  },
  mapWrapper: {
    overflow: 'hidden',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  listingsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapToggle: {
    borderRadius: 20,
  },
  listingsContent: {
    gap: 16,
    paddingBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    colorName: 'primary',
  },
  propertyCard: {
    marginBottom: 16,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    colorName: 'text',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '500',
    colorName: 'text',
    marginBottom: 8,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    colorName: 'text',
    opacity: 0.8,
  },
  propertyLocation: {
    fontSize: 14,
    colorName: 'text',
    opacity: 0.8,
  },
}); 