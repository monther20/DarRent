import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type BaseCardProps = {
  id?: string;
  title: string;
  image: ImageSourcePropType;
  onPress?: () => void;
};

type PropertyDetails = {
  beds: number;
  baths: number;
  area?: number;
  type?: string;
  status?: 'Available' | 'Rented';
};

type RentalCardProps = BaseCardProps & {
  variant: 'rental';
  price: string;
  leaseEndsIn: string;
  nextPayment: {
    amount: string;
    dueIn: string;
  };
};

type PropertyCardProps = BaseCardProps & {
  variant: 'property';
  price: number;
  details: PropertyDetails;
  location?: string;
};

type LandlordPropertyCardProps = BaseCardProps & {
  variant: 'landlord-property';
  price: number;
  details: PropertyDetails;
  stats: {
    views: number;
    inquiries: number;
    daysListed: number;
  };
};

type CardProps = RentalCardProps | PropertyCardProps | LandlordPropertyCardProps;

export function Card(props: CardProps) {
  const handlePress = () => {
    if (props.onPress) {
      props.onPress();
    } else if (props.id) {
      router.push(`/property/${props.id}`);
    }
  };

  const renderPropertyDetails = (details: PropertyDetails) => (
    <View style={styles.propertyDetailsRow}>
      <View style={styles.detailItem}>
        <Ionicons name="bed-outline" size={16} color="#666" />
        <Text style={styles.detailText}>{details.beds}</Text>
      </View>
      <View style={styles.detailItem}>
        <Ionicons name="water-outline" size={16} color="#666" />
        <Text style={styles.detailText}>{details.baths}</Text>
      </View>
      {details.area && (
        <View style={styles.detailItem}>
          <Ionicons name="resize-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{details.area}m²</Text>
        </View>
      )}
      {details.status && <Text style={styles.detailText}>{details.status}</Text>}
    </View>
  );

  const renderStats = (stats: { views: number; inquiries: number; daysListed: number }) => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Views</Text>
        <Text style={styles.statValue}>{stats.views}</Text>
      </View>
      <View style={[styles.statItem, styles.statBorder]}>
        <Text style={styles.statLabel}>Inquiries</Text>
        <Text style={styles.statValue}>{stats.inquiries}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Days Listed</Text>
        <Text style={styles.statValue}>{stats.daysListed}</Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (props.variant) {
      case 'rental':
        return (
          <>
            <View style={styles.rentalInfo}>
              <Text style={styles.title}>{props.title}</Text>
              <Text style={styles.price}>{props.price}</Text>
              <Text style={styles.leaseEnds}>Lease ends in {props.leaseEndsIn}</Text>
            </View>
            <View style={styles.paymentWarning}>
              <Text style={styles.warningText}>
                Next Payment: {props.nextPayment.amount} due in {props.nextPayment.dueIn}
              </Text>
            </View>
          </>
        );

      case 'property':
        return (
          <View style={styles.propertyInfo}>
            <Text style={styles.title}>{props.title}</Text>
            <Text style={styles.price}>{props.price} JOD/month</Text>
            {renderPropertyDetails(props.details)}
            {props.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.propertyLocation}>{props.location}</Text>
              </View>
            )}
          </View>
        );

      case 'landlord-property':
        return (
          <>
            <View style={styles.propertyInfo}>
              <Text style={styles.title}>{props.title}</Text>
              <Text style={styles.price}>{props.price} JOD/month</Text>
              {renderPropertyDetails(props.details)}
            </View>
            {renderStats(props.stats)}
          </>
        );
    }
  };

  const containerStyle =
    props.variant === 'landlord-property' ? styles.landlordContainer : styles.container;

  return (
    <TouchableOpacity style={containerStyle} onPress={handlePress}>
      <Image source={props.image} style={styles.image} />
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  landlordContainer: {
    backgroundColor: '#34568B',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  propertyInfo: {
    padding: 16,
    gap: 8,
  },
  rentalInfo: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E67E22',
  },
  propertyDetailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaseEnds: {
    fontSize: 14,
    color: '#666',
  },
  paymentWarning: {
    backgroundColor: '#FEF3C7',
    padding: 16,
  },
  warningText: {
    color: '#92400E',
  },
});
