import React, { useState, useEffect, useContext } from 'react';
// @ts-ignore TODO: Fix Platform import issue
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ScreenHeader } from '../components/ScreenHeader';
import { router } from 'expo-router';
import { ThemedButton } from '@/components/ThemedButton';
import { InputField } from '@/components/InputField';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { VideoUpload } from '@/app/components/VideoUpload';
import { useTranslation } from 'react-i18next';
import { mockApi } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { Property } from '../types'; // Import Property type for status casting

const AddPropertyScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth(); // Get user from AuthContext
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
    videoUrl: '', // Added for storing video URL
    requires_video: true, // Default to requiring video
  });
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation logic
  const isValid =
    property.title.trim().length > 0 &&
    property.description.trim().length > 0 &&
    property.city.trim().length > 0 &&
    property.area.trim().length > 0 &&
    !!property.price &&
    !isNaN(Number(property.price)) &&
    Number(property.price) > 0 &&
    !!property.areaSize &&
    !isNaN(Number(property.areaSize)) &&
    Number(property.areaSize) > 0 &&
    !!property.bedrooms &&
    !isNaN(Number(property.bedrooms)) &&
    Number(property.bedrooms) > 0 &&
    !!property.bathrooms &&
    !isNaN(Number(property.bathrooms)) &&
    Number(property.bathrooms) > 0 &&
    property.currency.trim().length > 0 &&
    property.status.trim().length > 0 &&
    // Add video validation - either video not required or video provided
    (!property.requires_video || property.videoUrl.trim().length > 0);

  const handleAddImage = async () => {
    // Request permissions
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        alert(t('Sorry, we need camera and media library permissions to make this work!'));
        return;
      }
    }

    // Ask user to choose between camera and gallery
    // For simplicity, let's start with gallery only and allow multiple selections
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true, // Consider if editing is needed
      // aspect: [4, 3], // Consider if aspect ratio lock is needed
      quality: 0.5, // Reduce quality to save space and upload time
      allowsMultipleSelection: true, // Allow multiple images
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setProperty(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5) // Limit to 5 images for now
      }));
    }
  };

  const handleRemoveImage = (uriToRemove: string) => {
    setProperty(prev => ({
      ...prev,
      images: prev.images.filter(uri => uri !== uriToRemove)
    }));
  };

  const handleVideoSelected = (uri: string) => {
    setProperty({ ...property, videoUrl: uri });
  };

  const handleGetLocation = async () => {
    setLocLoading(true);
    setLocError(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError(t('Permission to access location was denied'));
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
      setLocError(t('Could not get location'));
      setLocLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In real implementation, we would upload the video to a storage service
      // and get a permanent URL to save with the property
      
      if (!user) {
        console.error("User not authenticated");
        // Optionally, show an alert to the user
        setIsSubmitting(false);
        return;
      }

      // Create property data object matching the API's expected structure
      const propertyDataForApi = {
        ownerId: user.id, // Add ownerId here
        title: property.title,
        description: property.description,
        price: parseFloat(property.price),
        currency: property.currency,
        location: {
          city: property.city,
          area: property.area,
          coordinates: coords ? [coords.latitude, coords.longitude] as [number, number] : undefined,
          address: '', // Assuming address might be optional or derived
        },
        features: {
          bedrooms: parseInt(property.bedrooms, 10) || 0,
          bathrooms: parseInt(property.bathrooms, 10) || 0,
          size: parseFloat(property.areaSize) || 0,
          furnished: property.furnished,
          amenities: property.amenities.split(',').map(a => a.trim()).filter(a => a.length > 0),
        },
        images: property.images,
        status: property.status as Property['status'], // Cast to ensure type compatibility
        videoUrl: property.videoUrl,
        rules: [], // Assuming rules is an empty array for now
        // The API expects requires_video, not requiresVideo
        // Also, it's not part of the Property type used in Omit for createProperty
        // If it's needed by the backend, the Property type and mockApi.createProperty signature might need adjustment
        // For now, I'll assume it's handled by the backend or not strictly part of the core Property model for creation.
      };
      
      // Mock API call to create property
      // This would be replaced with a real API call in production
      // The second argument (ownerId) is removed as it's now part of propertyDataForApi
      await mockApi.createProperty(propertyDataForApi as Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'inquiries' | 'daysListed'>, user.id);
      
      // Navigate back after successful submission
      router.back();
    } catch (error) {
      console.error('Error creating property:', error);
      // Would show an error toast/alert here in a real implementation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFurnishedToggle = (value: boolean) => {
    setProperty({ ...property, furnished: value });
  };
  
  const handleVideoRequiredToggle = (value: boolean) => {
    setProperty({ ...property, requires_video: value });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('Add New Property')} showAddButton={false} />
      {/* @ts-ignore TODO: Fix ScrollView prop types */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* Image Upload Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('Property Images')}</ThemedText>
            <View style={styles.imageUploadContainer}>
              {property.images.length < 5 && ( // Show button only if less than 5 images
                <TouchableOpacity style={styles.imageUploadButton} onPress={handleAddImage}>
                  <MaterialIcons name="add-a-photo" size={32} color="#34568B" />
                  <ThemedText style={styles.imageUploadText}>{t('Add Images')} ({property.images.length}/5)</ThemedText>
                </TouchableOpacity>
              )}
            </View>
            {property.images.length > 0 && (
              // @ts-ignore TODO: Fix ScrollView prop types
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
                {property.images.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewItem}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity onPress={() => handleRemoveImage(uri)} style={styles.removeImageButton}>
                      <MaterialIcons name="cancel" size={24} color="rgba(0,0,0,0.7)" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
          
          {/* Video Upload Section - New */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>{t('Property Video')}</ThemedText>
              <View style={styles.videoRequiredToggle}>
                <ThemedText style={styles.toggleLabel}>{t('Required')}</ThemedText>
                <Switch
                  value={property.requires_video}
                  onValueChange={handleVideoRequiredToggle}
                  thumbColor={property.requires_video ? '#34568B' : '#ccc'}
                  trackColor={{ false: '#ccc', true: '#34568B55' }}
                />
              </View>
            </View>
            <VideoUpload
              onVideoSelected={handleVideoSelected}
              videoUri={property.videoUrl}
              verificationStatus={property.videoUrl ? 'pending' : null}
            />
            <ThemedText style={styles.videoNote}>
              {t('A verified property video can help attract more renters and increases trust.')}
            </ThemedText>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('Basic Information')}</ThemedText>
            <InputField
              label={t('Property Title')}
              value={property.title}
              onChangeText={(text) => setProperty({ ...property, title: text })}
              placeholder={t('Enter property title')}
              style={styles.inputFull}
            />
            <InputField
              label={t('Description')}
              value={property.description}
              onChangeText={(text) => setProperty({ ...property, description: text })}
              placeholder={t('Enter property description')}
              style={[styles.inputFull, styles.multilineInput]}
              // @ts-ignore TODO: Fix InputField prop types
              multiline={true}
            />
          </View>

          {/* Location Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('Location')}</ThemedText>
            <InputField
              label={t('City')}
              value={property.city}
              onChangeText={(text) => setProperty({ ...property, city: text })}
              placeholder={t('Enter city')}
              style={styles.inputFull}
            />
            <InputField
              label={t('Area / Neighborhood')}
              value={property.area}
              onChangeText={(text) => setProperty({ ...property, area: text })}
              placeholder={t('Enter area/neighborhood')}
              style={styles.inputFull}
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetLocation}
              // @ts-ignore TODO: Fix TouchableOpacity prop types
              disabled={locLoading}
            >
              <MaterialIcons name="my-location" size={22} color="#fff" style={{ marginRight: 8 }} />
              <ThemedText style={styles.locationButtonText}>
                {locLoading ? t('Getting Location...') : t('Use My Current Location')}
              </ThemedText>
            </TouchableOpacity>
            {coords && (
              <ThemedText style={styles.coordsText}>
                {t('Location set')}: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              </ThemedText>
            )}
            {locError && <ThemedText style={styles.coordsError}>{locError}</ThemedText>}
          </View>

          {/* Property Details */}
          <View style={styles.sectionCard}>
            <ThemedText style={styles.sectionTitle}>{t('Property Details')}</ThemedText>
            <View style={styles.fieldGroup}>
              <InputField
                label={t('Price')}
                value={property.price}
                onChangeText={(text) => setProperty({ ...property, price: text })}
                placeholder={t('Enter price')}
                keyboardType="numeric"
                style={styles.inputFull}
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.inputLabel}>{t('Currency')}</ThemedText>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={property.currency}
                  onValueChange={(itemValue) => setProperty({ ...property, currency: itemValue })}
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
                label={t('Area (m²)')}
                value={property.areaSize}
                onChangeText={(text) => setProperty({ ...property, areaSize: text })}
                placeholder={t('Enter area')}
                keyboardType="numeric"
                style={styles.inputFull}
              />
            </View>
            <View style={styles.fieldGroup}>
              <InputField
                label={t('Bedrooms')}
                value={property.bedrooms}
                onChangeText={(text) => setProperty({ ...property, bedrooms: text })}
                placeholder={t('Enter number')}
                keyboardType="numeric"
                style={styles.inputFull}
              />
            </View>
            <View style={styles.fieldGroup}>
              <InputField
                label={t('Bathrooms')}
                value={property.bathrooms}
                onChangeText={(text) => setProperty({ ...property, bathrooms: text })}
                placeholder={t('Enter number')}
                keyboardType="numeric"
                style={styles.inputFull}
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.inputLabel}>{t('Status')}</ThemedText>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={property.status}
                  onValueChange={(itemValue) => setProperty({ ...property, status: itemValue })}
                  style={styles.picker}
                  dropdownIconColor="#34568B"
                >
                  <Picker.Item label={t('Available')} value="available" />
                  <Picker.Item label={t('Rented')} value="rented" />
                  <Picker.Item label={t('Pending')} value="pending" />
                </Picker>
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <View style={styles.furnishedRow}>
                <ThemedText style={styles.inputLabel}>{t('Furnished Apartment?')}</ThemedText>
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
                label={t('Amenities (comma separated)')}
                value={property.amenities}
                onChangeText={(text) => setProperty({ ...property, amenities: text })}
                placeholder={t('e.g. Parking, Balcony, Air Conditioning')}
                style={[styles.inputFull, property.furnished && { opacity: 0.5 }]}
                // @ts-ignore TODO: Fix InputField prop types
                editable={!property.furnished}
              />
            </View>
          </View>

          {/* Submit Button */}
          <ThemedButton
            title={isSubmitting ? t('Creating...') : t('Add Property')}
            onPress={handleSubmit}
            style={[styles.submitButton, !isValid && styles.disabledButton]}
            // @ts-ignore TODO: Fix ThemedButton prop types
            disabled={!isValid || isSubmitting}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#34568B',
    marginBottom: 14,
  },
  videoRequiredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    marginRight: 8,
    fontSize: 14,
    color: '#4B5563',
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
    minHeight: 100, // Ensure a minimum height
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
  imagePreviewContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  imagePreviewItem: {
    marginRight: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
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
  videoNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default AddPropertyScreen;
