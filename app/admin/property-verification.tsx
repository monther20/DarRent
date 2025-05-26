import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { mockApi } from '../services/mockApi';
import { Property, PropertyStatus } from '@/app/types';

interface VerificationProperty extends Property {
  landlordName: string;
  dateSubmitted: string;
  // We'll ensure the base Property fields are correctly represented in the mock data
}

const PropertyVerificationScreen = () => {
  const [properties, setProperties] = useState<VerificationProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPropertiesForVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mockApi.getPropertiesForVerification();
      // Assuming the API returns Property[] and we need to map it to VerificationProperty[]
      // This might require fetching landlord details separately or adjusting the API response.
      // For now, let's assume the API can provide the necessary fields or we adapt.
      // If landlordName and dateSubmitted are not directly on Property, this will need adjustment.
      const verificationProperties = response.map((p: Property) => ({
        ...p,
        // These are placeholders if not directly available on 'p'
        // In a real scenario, you might fetch landlord details based on p.ownerId
        // or the API for getPropertiesForVerification would include this.
        landlordName: `Landlord ${p.ownerId.substring(0, 5)}`, // Placeholder
        dateSubmitted: p.createdAt, // Assuming createdAt can be used as dateSubmitted
      })) as VerificationProperty[];
      setProperties(verificationProperties);
    } catch (err) {
      setError('Failed to fetch properties for verification.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertiesForVerification();
  }, []);

  const handleApprove = async (propertyId: string) => {
    Alert.alert("Confirm Approval", "Are you sure you want to approve this property?", [
      { text: "Cancel", style: "cancel" },
      { text: "Approve", onPress: async () => {
        try {
          await mockApi.updatePropertyVerificationStatus(propertyId, 'available'); // Assuming 'available' is the status for approved
          Alert.alert('Success', `Property ${propertyId} approved.`);
          // Refresh list
          fetchPropertiesForVerification();
        } catch (err) {
          Alert.alert('Error', `Failed to approve property ${propertyId}.`);
          console.error(err);
        }
      }}
    ]);
  };

  const handleReject = async (propertyId: string) => {
    Alert.alert("Confirm Rejection", "Are you sure you want to reject this property?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reject", onPress: async () => {
        try {
          await mockApi.updatePropertyVerificationStatus(propertyId, 'rejected');
          Alert.alert('Success', `Property ${propertyId} rejected.`);
          // Refresh list
          fetchPropertiesForVerification();
        } catch (err) {
          Alert.alert('Error', `Failed to reject property ${propertyId}.`);
          console.error(err);
        }
      }}
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (error) {
    return <ThemedView style={styles.container}><ThemedText style={styles.errorText}>{error}</ThemedText></ThemedView>;
  }

  if (properties.length === 0) {
    return <ThemedView style={styles.container}><ThemedText>No properties awaiting verification.</ThemedText></ThemedView>;
  }

  const renderItem = ({ item }: { item: VerificationProperty }) => (
    <View style={styles.propertyItem}>
      <ThemedText style={styles.propertyTitle}>{item.title}</ThemedText>
      <Text>Address: {item.location.address || `${item.location.area}, ${item.location.city}`}</Text>
      <Text>Landlord: {item.landlordName}</Text>
      <Text>Submitted: {new Date(item.dateSubmitted).toLocaleDateString()}</Text>
      <Text>Status: {item.status}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Approve" onPress={() => handleApprove(item.id)} color="green" />
        <Button title="Reject" onPress={() => handleReject(item.id)} color="red" />
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={properties}
        renderItem={renderItem}
        keyExtractor={(item: VerificationProperty) => item.id}
        refreshing={loading}
        onRefresh={fetchPropertiesForVerification}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  propertyItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
});

export default PropertyVerificationScreen;