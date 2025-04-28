import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { mockProperties } from '../../services/mockData';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '../components/search/SearchBar';
import { FilterChips, FilterChip } from '../components/search/FilterChips';
import { PropertiesCount } from '../components/search/PropertiesCount';
import { PropertyList } from '../components/search/PropertyList';
import { FilterModal } from '../components/search/FilterModal';

const propertyTypes = [
  { key: 'apartment', label: 'Apartment', icon: 'business' },
  { key: 'villa', label: 'Villa', icon: 'home' },
  { key: 'studio', label: 'Studio', icon: 'cube' },
];

// --- Types for filter state ---
type PriceSort = 'asc' | 'desc' | null;
type FilterType = 'price' | 'type' | 'rooms' | null;
type PropertyTypeKey = 'apartment' | 'villa' | 'studio';

export default function PropertySearchScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2500]);
  const [priceSort, setPriceSort] = useState<PriceSort>(null);
  const [selectedTypes, setSelectedTypes] = useState<PropertyTypeKey[]>([]);
  const [roomCount, setRoomCount] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterModalType, setFilterModalType] = useState<FilterType>(null);

  // Get min/max price for slider
  const minPrice = Math.min(...mockProperties.map((p) => p.price));
  const maxPrice = Math.max(...mockProperties.map((p) => p.price));

  // Filtering logic
  const filteredProperties = useMemo(() => {
    let props = mockProperties;
    if (search) {
      props = props.filter(
        (p) =>
          p.location.city.toLowerCase().includes(search.toLowerCase()) ||
          p.location.area.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (priceRange) {
      props = props.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }
    if (selectedTypes.length > 0) {
      props = props.filter((p) =>
        selectedTypes.includes(
          p.features.bedrooms === 1 ? 'studio' : p.features.bedrooms === 4 ? 'villa' : 'apartment',
        ),
      );
    }
    if (roomCount) {
      props = props.filter((p) => p.features.bedrooms === roomCount);
    }
    if (priceSort === 'asc') {
      props = [...props].sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      props = [...props].sort((a, b) => b.price - a.price);
    }
    return props;
  }, [search, priceRange, selectedTypes, roomCount, priceSort]);

  const getImageSource = (image: string) => {
    if (!image) return require('../../assets/images/property-placeholder.jpg');
    if (image.startsWith('http')) return { uri: image };
    if (image.startsWith('/assets')) return require('../../assets/images/property-placeholder.jpg');
    return { uri: image }; // fallback, but probably never reached
  };

  const filterChips: FilterChip[] = [
    { key: 'price', icon: 'pricetag', label: t('search.price') },
    { key: 'type', icon: 'business', label: t('search.type') },
    { key: 'rooms', icon: 'bed', label: t('search.rooms') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <ScreenHeader title="Payments" />
      <SearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch('')}
        placeholder={t('search.searchByLocation')}
      />
      <FilterChips
        activeFilter={activeFilter}
        onFilterChange={(key: string) => {
          setShowFilterModal(true);
          setFilterModalType(key as FilterType);
          setActiveFilter(key as FilterType);
        }}
        filterChips={filterChips}
      />
      <PropertiesCount
        count={filteredProperties.length}
        label={t('search.propertiesFound', 'Properties Found')}
      />
      <PropertyList properties={filteredProperties} t={t as any} getImageSource={getImageSource} />
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filterModalType={filterModalType}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        priceSort={priceSort}
        setPriceSort={setPriceSort}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes as any}
        roomCount={roomCount}
        setRoomCount={setRoomCount}
        minPrice={minPrice}
        maxPrice={maxPrice}
        t={t as any}
      />
    </View>
  );
}
