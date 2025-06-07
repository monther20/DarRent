import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Property } from '@/types';

interface PropertyInformationProps {
  property: Property;
  isRTL: boolean;
}

export const PropertyInformation: React.FC<PropertyInformationProps> = ({ property, isRTL }) => {
  const { t } = useTranslation(['propertyDetails', 'common', 'property']);
  const [activeTab, setActiveTab] = useState('overview');

  // Tab navigation items
  const tabs = [
    {
      id: 'overview',
      name: t('overview', { ns: 'propertyDetails' }),
      icon: 'information-circle-outline',
    },
    { id: 'amenities', name: t('amenities', { ns: 'propertyDetails' }), icon: 'list-outline' },
    { id: 'location', name: t('location', { ns: 'propertyDetails' }), icon: 'location-outline' },
    { id: 'rules', name: t('rules', { ns: 'propertyDetails' }), icon: 'alert-circle-outline' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <View style={styles.propertyStatusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: property.status === 'available' ? '#4CAF50' : '#F44336' },
                ]}
              >
                <Text style={styles.statusText}>
                  {property.status === 'available'
                    ? t('availableNow', { ns: 'propertyDetails' })
                    : t('notAvailable', { ns: 'propertyDetails' })}
                </Text>
              </View>
              <Text style={styles.price}>
                {property.price} {property.currency}/{t('month', { ns: 'common' })}
              </Text>
            </View>

            <Text style={styles.description}>{property.description}</Text>

            <View style={[styles.detailsRow, isRTL && styles.detailsRowRTL]}>
              <View style={[styles.detailItem, isRTL && styles.detailItemRTL]}>
                <Ionicons name="bed-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  {property.features.bedrooms} {t('bed', { ns: 'property' })}
                </Text>
              </View>
              <View style={[styles.detailItem, isRTL && styles.detailItemRTL]}>
                <Ionicons name="water-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  {property.features.bathrooms} {t('bath', { ns: 'property' })}
                </Text>
              </View>
              <View style={[styles.detailItem, isRTL && styles.detailItemRTL]}>
                <Ionicons name="expand-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{property.features.size} m²</Text>
              </View>
            </View>
          </View>
        );

      case 'amenities':
        return (
          <View style={styles.tabContent}>
            <View style={styles.amenitiesGrid}>
              {property.features.amenities.map((amenity, index) => (
                <View key={index} style={[styles.amenityItem, isRTL && styles.amenityItemRTL]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#34568B" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'location':
        return (
          <View style={styles.tabContent}>
            <View style={[styles.locationBox, isRTL && styles.locationBoxRTL]}>
              <Ionicons name="location-outline" size={24} color="#666" />
              <Text style={styles.locationText}>
                {property.location.area}, {property.location.city}
              </Text>
            </View>
            <Text style={styles.locationDetails}>
              {property.location.details ||
                t('locationSharedAfterBooking', { ns: 'propertyDetails' })}
            </Text>
          </View>
        );

      case 'rules':
        return (
          <View style={styles.tabContent}>
            {property.rules.map((rule, index) => (
              <View key={index} style={[styles.ruleItem, isRTL && styles.ruleItemRTL]}>
                <Ionicons name="information-circle-outline" size={20} color="#666" />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.tabsContainer, isRTL && styles.tabsContainerRTL]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.id ? '#34568B' : '#888'}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab content */}
      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabsContainerRTL: {
    flexDirection: 'row-reverse',
  },
  tab: {
    marginRight: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#34568B',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    color: '#888',
  },
  activeTabText: {
    color: '#34568B',
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
    minHeight: 200,
  },
  propertyStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34568B',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailsRowRTL: {
    flexDirection: 'row-reverse',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItemRTL: {
    flexDirection: 'row-reverse',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: 8,
  },
  amenityItemRTL: {
    flexDirection: 'row-reverse',
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationBoxRTL: {
    flexDirection: 'row-reverse',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationDetails: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleItemRTL: {
    flexDirection: 'row-reverse',
  },
  ruleText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});
