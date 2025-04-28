import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filterModalType: 'price' | 'type' | 'rooms' | null;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  priceSort: 'asc' | 'desc' | null;
  setPriceSort: (sort: 'asc' | 'desc' | null) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  roomCount: number | null;
  setRoomCount: (count: number | null) => void;
  minPrice: number;
  maxPrice: number;
  t: (key: string, defaultText?: string) => string;
}

const propertyTypes = [
  { key: 'apartment', label: 'Apartment', icon: 'business' },
  { key: 'villa', label: 'Villa', icon: 'home' },
  { key: 'studio', label: 'Studio', icon: 'cube' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filterModalType,
  priceRange,
  setPriceRange,
  priceSort,
  setPriceSort,
  selectedTypes,
  setSelectedTypes,
  roomCount,
  setRoomCount,
  minPrice,
  maxPrice,
  t,
}) => {
  if (!filterModalType) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {filterModalType === 'price' && (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('search.price')}</Text>
              {/* Simulated slider UI */}
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>{priceRange[0]} JOD</Text>
                <View style={styles.sliderTrack}>
                  {/* Simulate a slider with two thumbs */}
                  <View
                    style={[
                      styles.sliderThumb,
                      { left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.sliderThumb,
                      { left: `${((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.sliderRange,
                      {
                        left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                        width: `${((priceRange[1] - priceRange[0]) / (maxPrice - minPrice)) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.sliderLabel}>{priceRange[1]} JOD</Text>
              </View>
              <View style={styles.priceSortRow}>
                <TouchableOpacity
                  style={[styles.sortBtn, priceSort === 'asc' && styles.sortBtnActive]}
                  onPress={() => setPriceSort('asc')}
                >
                  <Ionicons
                    name="arrow-down"
                    size={18}
                    color={priceSort === 'asc' ? '#fff' : '#34568B'}
                  />
                  <Text style={[styles.sortBtnText, priceSort === 'asc' && { color: '#fff' }]}>
                    {t('search.lowToHigh', 'Low to High')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortBtn, priceSort === 'desc' && styles.sortBtnActive]}
                  onPress={() => setPriceSort('desc')}
                >
                  <Ionicons
                    name="arrow-up"
                    size={18}
                    color={priceSort === 'desc' ? '#fff' : '#34568B'}
                  />
                  <Text style={[styles.sortBtnText, priceSort === 'desc' && { color: '#fff' }]}>
                    {t('search.highToLow', 'High to Low')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
                  <Text style={styles.modalBtnText}>{t('common.ok', 'OK')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnOutline}
                  onPress={() => {
                    setPriceRange([minPrice, maxPrice]);
                    setPriceSort(null);
                  }}
                >
                  <Text style={styles.modalBtnOutlineText}>{t('common.reset', 'Reset')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {filterModalType === 'type' && (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('search.type')}</Text>
              <View style={styles.typeRow}>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeChip,
                      selectedTypes.includes(type.key) && styles.typeChipActive,
                    ]}
                    onPress={() => {
                      setSelectedTypes(
                        selectedTypes.includes(type.key)
                          ? selectedTypes.filter((k) => k !== type.key)
                          : [...selectedTypes, type.key],
                      );
                    }}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={18}
                      color={selectedTypes.includes(type.key) ? '#fff' : '#34568B'}
                    />
                    <Text
                      style={[
                        styles.typeChipText,
                        selectedTypes.includes(type.key) && { color: '#fff' },
                      ]}
                    >
                      {t(`property.${type.key}`, type.label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
                  <Text style={styles.modalBtnText}>{t('common.ok', 'OK')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnOutline}
                  onPress={() => setSelectedTypes([])}
                >
                  <Text style={styles.modalBtnOutlineText}>{t('common.reset', 'Reset')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {filterModalType === 'rooms' && (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('search.rooms')}</Text>
              <View style={styles.roomsRow}>
                {[1, 2, 3, 4].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.roomChip, roomCount === n && styles.roomChipActive]}
                    onPress={() => setRoomCount(roomCount === n ? null : n)}
                  >
                    <Ionicons name="bed" size={18} color={roomCount === n ? '#fff' : '#34568B'} />
                    <Text style={[styles.roomChipText, roomCount === n && { color: '#fff' }]}>
                      {n}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
                  <Text style={styles.modalBtnText}>{t('common.ok', 'OK')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnOutline} onPress={() => setRoomCount(null)}>
                  <Text style={styles.modalBtnOutlineText}>{t('common.reset', 'Reset')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 260,
  },
  modalContent: {},
  modalTitle: { fontWeight: 'bold', fontSize: 18, color: '#34568B', marginBottom: 16 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  sliderLabel: { color: '#34568B', fontWeight: 'bold', fontSize: 15 },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e6f7',
    borderRadius: 2,
    marginHorizontal: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E67E22',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  sliderRange: {
    position: 'absolute',
    top: 0,
    height: 4,
    backgroundColor: '#E67E22',
    borderRadius: 2,
    zIndex: 1,
  },
  priceSortRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34568B',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  sortBtnActive: { backgroundColor: '#34568B', borderColor: '#34568B' },
  sortBtnText: { marginLeft: 6, color: '#34568B', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 },
  modalBtn: {
    backgroundColor: '#34568B',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginLeft: 8,
  },
  modalBtnText: { color: '#fff', fontWeight: 'bold' },
  modalBtnOutline: {
    borderWidth: 1,
    borderColor: '#34568B',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginLeft: 8,
  },
  modalBtnOutlineText: { color: '#34568B', fontWeight: 'bold' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#34568B',
    marginBottom: 8,
  },
  typeChipActive: { backgroundColor: '#34568B', borderColor: '#34568B' },
  typeChipText: { marginLeft: 6, color: '#34568B', fontWeight: 'bold' },
  roomsRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  roomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#34568B',
  },
  roomChipActive: { backgroundColor: '#34568B', borderColor: '#34568B' },
  roomChipText: { marginLeft: 6, color: '#34568B', fontWeight: 'bold' },
});
