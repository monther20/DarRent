import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '../components/ScreenHeader';
import { router } from 'expo-router';
import { ThemedButton } from '@/components/ThemedButton';
import { InputField } from '@/components/InputField';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';

const AddPropertyScreen: React.FC = () => {
  const [property, setProperty] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'JOD',
    city: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    areaSize: '',
    amenities: '',
    status: 'available',
    location: '', // for backward compatibility, not used in new fields
    images: [] as string[],
    furnished: false,
  });
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Validation logic
  const isValid =
    property.title.trim().length > 0 &&
    property.description.trim().length > 0 &&
    property.city.trim().length > 0 &&
    property.area.trim().length > 0 &&
    !!property.price && !isNaN(Number(property.price)) && Number(property.price) > 0 &&
    !!property.areaSize && !isNaN(Number(property.areaSize)) && Number(property.areaSize) > 0 &&
    !!property.bedrooms && !isNaN(Number(property.bedrooms)) && Number(property.bedrooms) > 0 &&
    !!property.bathrooms && !isNaN(Number(property.bathrooms)) && Number(property.bathrooms) > 0 &&
    property.currency.trim().length > 0 &&
    property.status.trim().length > 0;

  const handleAddImage = () => {
    // TODO: Implement image picker
    console.log('Add image');
  };

  const handleGetLocation = async () => {
    setLocLoading(true);
    setLocError(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Permission to access location was denied');
        setLocLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLocLoading(false);
    } catch (e) {
      setLocError('Could not get location');
      setLocLoading(false);
    }
  };

  const handleSubmit = () => {
    // TODO: Implement property submission
    console.log('Submit property:', property);
    router.back();
  };

  const handleFurnishedToggle = (value: boolean) => {
    setProperty({ ...property, furnished: value });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Add New Property"
        showAddButton={false}
      />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* Image Upload Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Property Images</ThemedText>
            <View style={styles.imageUploadContainer}>
              <TouchableOpacity 
                style={styles.imageUploadButton}
                onPress={handleAddImage}
              >
                <MaterialIcons name="add-a-photo" size={32} color="#34568B" />
                <ThemedText style={styles.imageUploadText}>Add Images</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
            <InputField
              label="Property Title"
              value={property.title}
              onChangeText={(text) => setProperty({...property, title: text})}
              placeholder="Enter property title"
              style={styles.inputFull}
            />
            <InputField
              label="Description"
              value={property.description}
              onChangeText={(text) => setProperty({...property, description: text})}
              placeholder="Enter property description"
              style={[styles.inputFull, styles.multilineInput]}
            />
          </View>

          {/* Location Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Location</ThemedText>
            <InputField
              label="City"
              value={property.city}
              onChangeText={(text) => setProperty({...property, city: text})}
              placeholder="Enter city"
              style={styles.inputFull}
            />
            <InputField
              label="Area / Neighborhood"
              value={property.area}
              onChangeText={(text) => setProperty({...property, area: text})}
              placeholder="Enter area/neighborhood"
              style={styles.inputFull}
            />
            <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation} disabled={locLoading}>
              <MaterialIcons name="my-location" size={22} color="#fff" style={{marginRight: 8}} />
              <ThemedText style={styles.locationButtonText}>
                {locLoading ? 'Getting Location...' : 'Use My Current Location'}
              </ThemedText>
            </TouchableOpacity>
            {coords && (
              <ThemedText style={styles.coordsText}>
                Location set: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              </ThemedText>
            )}
            {locError && (
              <ThemedText style={styles.coordsError}>{locError}</ThemedText>
            )}
          </View>

          {/* Property Details */}
          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>Property Details</ThemedText>
            <View style={styles.fieldGroup}>
              <InputField
                label="Price"
                value={property.price}
                onChangeText={(text) => setProperty({...property, price: text})}
                placeholder="Enter price"
                keyboardType="numeric"
                style={styles.inputFull}
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.inputLabel}>Currency</ThemedText>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={property.currency}
                  onValueChange={(itemValue) => setProperty({...property, currency: itemValue})}
                  style={styles.picker}
                  dropdownIconColor="#34568B"
                >
                  <Picker.Item label="JOD" value="JOD" />
                  <Picker.Item label="USD" value="USD" />
                  <Picker.Item label="EUR" value="EUR" />
                </Picker>
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <InputField
                label="Area (m²)"
                value={property.areaSize}
                onChangeText={(text) => setProperty({...property, areaSize: text})}
                placeholder="Enter area"
                keyboardType="numeric"
                style={styles.inputFull}
              />
            </View>
            <View style={styles.fieldGroup}>
              <InputField
                label="Bedrooms"
                value={property.bedrooms}
                onChangeText={(text) => setProperty({...property, bedrooms: text})}
                placeholder="Enter number"
                keyboardType="numeric"
                style={styles.inputFull}
              />
            </View>
            <View style={styles.fieldGroup}>
              <InputField
                label="Bathrooms"
                value={property.bathrooms}
                onChangeText={(text) => setProperty({...property, bathrooms: text})}
                placeholder="Enter number"
                keyboardType="numeric"
                style={styles.inputFull}
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.inputLabel}>Status</ThemedText>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={property.status}
                  onValueChange={(itemValue) => setProperty({...property, status: itemValue})}
                  style={styles.picker}
                  dropdownIconColor="#34568B"
                >
                  <Picker.Item label="Available" value="available" />
                  <Picker.Item label="Rented" value="rented" />
                  <Picker.Item label="Pending" value="pending" />
                </Picker>
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <View style={styles.furnishedRow}>
                <ThemedText style={styles.inputLabel}>Furnished Apartment?</ThemedText>
                <Switch
                  value={property.furnished}
                  onValueChange={handleFurnishedToggle}
                  thumbColor={property.furnished ? '#34568B' : '#ccc'}
                  trackColor={{ false: '#ccc', true: '#34568B55' }}
                />
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <InputField
                label="Amenities (comma separated)"
                value={property.amenities}
                onChangeText={(text) => setProperty({...property, amenities: text})}
                placeholder="e.g. Parking, Balcony, Air Conditioning"
                style={[styles.inputFull, property.furnished && { opacity: 0.5 }]}
                editable={!property.furnished}
              />
            </View>
          </View>

          {/* Submit Button */}
          <ThemedButton
            title="Add Property"
            onPress={handleSubmit}
            style={[styles.submitButton, !isValid && styles.disabledButton]}
            disabled={!isValid}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 16,
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34568B',
    marginBottom: 14,
  },
  imageUploadContainer: {
    backgroundColor: '#F5F6F8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  imageUploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  imageUploadText: {
    marginTop: 8,
    color: '#34568B',
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
  },
  inputFull: {
    width: '100%',
    height: 52,
    fontSize: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 0,
    textAlign: 'left',
  },
  inputHalf: {
    flex: 1,
    minWidth: 0,
    height: 52,
    fontSize: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 0,
    textAlign: 'left',
  },
  multilineInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 12,
    marginBottom: 0,
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0B8C1',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34568B',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  coordsText: {
    color: '#34568B',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
  },
  coordsError: {
    color: '#E67E22',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    color: '#34568B',
    marginBottom: 6,
    fontSize: 15,
    textAlign: 'left',
  },
  pickerWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    height: 52,
    justifyContent: 'center',
    marginBottom: 0,
  },
  picker: {
    width: '100%',
    height: 52,
    color: '#34568B',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  furnishedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

export default AddPropertyScreen; 