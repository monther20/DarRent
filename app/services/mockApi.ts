import {
  Tenant,
  Property,
  Application,
  Stats,
  User,
  RentRequest,
  RenterReview,
  PropertyReview,
  TimeSlot, // Added import
  ViewingRequest, // Added import
  PropertyStatus,
} from '../types';

// Define type for Admin User Management
export interface AdminUserDisplay {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Landlord' | 'Renter'; // Expanded roles for flexibility
  status: 'active' | 'suspended' | 'pending_verification';
}

// Define Transaction and MaintenanceRequest types locally
export interface Transaction {
  id: string;
  propertyId: string;
  renterId: string;
  landlordId: string;
  amount: number;
  currency: string;
  type: 'rent' | 'deposit' | 'utility';
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  description: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  renterId: string;
  title: string;
  description: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  scheduledDate?: string;
  completedDate?: string;
}

// ViewingRequest and TimeSlot types are now imported from ../types

import { supabase } from '../../lib/supabase'; // Import Supabase client
import {
  mockProperties,
  mockUsers,
  mockApplications,
  mockTransactions,
} from '../../services/mockData';
import { mockMaintenanceRequests, getActiveRequests, getPastRequests } from './mockMaintenanceData';

// Mock rent requests data
const mockRentRequests: RentRequest[] = [
  {
    id: 'rent1',
    propertyId: 'prop1',
    renterId: 'user3',
    requestDate: new Date().toISOString(),
    status: 'pending',
    months: 6,
    // startDate: new Date().toISOString(), // Removed based on TS error
    message: 'I am interested in renting this property.',
    responseDate: undefined, // Changed from null based on TS error
  },
  {
    id: 'rent2',
    propertyId: 'prop3',
    renterId: 'user4',
    requestDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: 'accepted',
    months: 12,
    message: 'Looking for a long term rental.',
    // startDate: new Date().toISOString(), // Removed based on TS error
    responseDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    // contractId: 'contract2', // Removed based on TS error
  },
  {
    id: 'rent3',
    propertyId: 'prop4',
    renterId: 'user5',
    requestDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: 'rejected',
    months: 3,
    message: 'Short term rental needed.',
    // startDate: new Date().toISOString(), // Removed based on TS error
    responseDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

// Define notification types
export type Notification = {
  id: string;
  userId: string;
  type:
    | 'rent_accepted'
    | 'rent_rejected'
    | 'maintenance_update'
    | 'general'
    | 'viewing_request_created'
    | 'viewing_request_confirmed'
    | 'viewing_request_rejected'
    | 'viewing_request_cancelled'
    | 'viewing_request_updated';
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
};

// Store for notifications
const mockNotifications: Notification[] = [];

// Mock data for viewing requests and time slots
const mockAvailableTimeSlots: TimeSlot[] = [
  { id: 'slot1', startTime: '2024-07-01T09:00:00Z', endTime: '2024-07-01T10:00:00Z', isBooked: false },
  { id: 'slot2', startTime: '2024-07-01T10:00:00Z', endTime: '2024-07-01T11:00:00Z', isBooked: false },
  { id: 'slot3', startTime: '2024-07-01T11:00:00Z', endTime: '2024-07-01T12:00:00Z', isBooked: true }, // Example of a booked slot
  { id: 'slot4', startTime: '2024-07-01T14:00:00Z', endTime: '2024-07-01T15:00:00Z', isBooked: false },
  { id: 'slot5', startTime: '2024-07-02T09:00:00Z', endTime: '2024-07-02T10:00:00Z', isBooked: false },
  { id: 'slot6', startTime: '2024-07-02T10:00:00Z', endTime: '2024-07-02T11:00:00Z', isBooked: false },
];

const mockViewingRequests: ViewingRequest[] = [
  {
    id: 'viewReq1',
    propertyId: 'prop1',
    renterId: 'user3',
    landlordId: 'user1',
    requestedDates: [new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]],
    preferredTimeSlots: [{ date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], timeSlotId: 'slot1' }],
    notes: 'Interested in the kitchen layout.',
    status: 'pending',
    requestDate: new Date().toISOString(),
  },
  {
    id: 'viewReq2',
    propertyId: 'prop2',
    renterId: 'user4',
    landlordId: 'user2',
    requestedDates: [
        new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]
    ],
    preferredTimeSlots: [
        { date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], timeSlotId: 'slot5' },
    ],
    status: 'confirmed',
    requestDate: new Date(Date.now() - 86400000).toISOString(),
    responseDate: new Date().toISOString(),
  },
];

// Example tenant data with review status
const tenants: Tenant[] = [
  {
    id: 'tenant1',
    fullName: 'Sarah Johnson',
    avatar: '',
    propertyId: 'prop1',
    propertyName: 'Seaside Apartment',
    leaseStart: '2023-01-01',
    leaseEnd: '2023-12-31',
    contactEmail: 'sarah@example.com',
    contactPhone: '+1234567890',
    status: 'active',
    reviewStatus: 'unreviewed',
  },
  {
    id: 'tenant2',
    fullName: 'David Thompson',
    avatar: '',
    propertyId: 'prop2',
    propertyName: 'Downtown Loft',
    leaseStart: '2022-10-01',
    leaseEnd: '2023-09-30',
    contactEmail: 'david@example.com',
    contactPhone: '+1987654321',
    status: 'active',
    reviewStatus: 'unreviewed',
  },
  {
    id: 'tenant3',
    fullName: 'Michael Carter',
    avatar: '',
    propertyId: 'prop3', 
    propertyName: 'Garden Villa',
    leaseStart: '2021-05-15',
    leaseEnd: '2022-05-14',
    contactEmail: 'michael@example.com',
    contactPhone: '+1122334455',
    status: 'former',
    reviewStatus: 'reviewed',
  }
];

const applications: Application[] = [
  {
    id: 'app1',
    applicantId: 'user1',
    applicantName: 'John Doe',
    propertyId: 'prop1',
    propertyName: 'Seaside Apartment',
    applicationDate: '2023-09-15',
    status: 'pending',
  },
  {
    id: 'app2',
    applicantId: 'user2',
    applicantName: 'Jane Smith',
    propertyId: 'prop2',
    propertyName: 'Downtown Loft',
    applicationDate: '2023-09-18',
    status: 'pending',
  }
];

// Review data store
let reviews: RenterReview[] = [];
let propertyReviews: PropertyReview[] = [];

const mockAdminPanelUsers: AdminUserDisplay[] = [
  { id: 'adminUser1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: 'adminUser2', name: 'Bob The Builder', email: 'bob@example.com', role: 'User', status: 'active' },
  { id: 'adminUser3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'suspended' },
  { id: 'adminUser4', name: 'Diana Prince', email: 'diana@example.com', role: 'Landlord', status: 'active' },
  { id: 'adminUser5', name: 'Edward Nigma', email: 'edward@example.com', role: 'Renter', status: 'pending_verification' },
];

// Mock API Service
class MockApiService {
  private async simulateDelay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Notifications methods
  async getNotifications(userId: string): Promise<Notification[]> {
    await this.simulateDelay();
    return mockNotifications.filter(notification => notification.userId === userId);
  }

  async createNotification(userId: string, type: Notification['type'], message: string, data?: any): Promise<Notification> {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type,
      message,
      data,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    mockNotifications.push(notification);
    return notification;
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification | null> {
    await this.simulateDelay();
    const index = mockNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      mockNotifications[index] = {
        ...mockNotifications[index],
        read: true
      };
      return mockNotifications[index];
    }
    return null;
  }

  // Existing methods
  async getTenants(status?: string): Promise<Tenant[]> {
    if (status === 'active') {
      return tenants.filter(t => t.status === 'active');
    }
    return tenants;
  }

  async getApplications(): Promise<Application[]> {
    return applications;
  }

  async getApplicationsDetailed() {
    await this.simulateDelay();
    return mockApplications;
  }

  async getStats(): Promise<Stats> {
    return {
      activeLeases: tenants.filter(t => t.status === 'active').length,
      expiringSoon: 2,
      averageRating: 4.2,
      occupancyRate: 85,
      vacantUnits: 3,
      totalIncome: 15000,
    };
  }

  async getProperties(ownerId?: string, filters?: { location?: string; minPrice?: number; maxPrice?: number; bedrooms?: number; bathrooms?: number; status?: string }): Promise<Property[]> {
    try {
      let rpcName: string;
      let rpcParams: any;

      if (ownerId) {
        rpcName = 'get_landlord_properties';
        rpcParams = { p_landlord_id: ownerId };
      } else {
        rpcName = 'get_properties';
        rpcParams = {
          p_location: filters?.location || null,
          p_min_price: filters?.minPrice || null,
          p_max_price: filters?.maxPrice || null,
          p_bedrooms: filters?.bedrooms || null,
          p_bathrooms: filters?.bathrooms || null,
          p_status: filters?.status || null,
        };
      }

      const { data, error } = await supabase.rpc(rpcName, rpcParams);

      if (error) {
        console.error(`Error calling Supabase RPC ${rpcName}:`, error);
        throw error;
      }

      return (data || []).map((dbProperty: any) => {
        const p = {
          id: dbProperty.id,
          title: dbProperty.title_en || dbProperty.title || '',
          description: dbProperty.description_en || dbProperty.description || '',
          price: dbProperty.rent_amount || 0,
          currency: dbProperty.currency || 'USD',
          location: {
            city: dbProperty.city_en || dbProperty.city || '',
            area: dbProperty.area_en || dbProperty.area || '',
            coordinates: (dbProperty.latitude && dbProperty.longitude) ?
              [parseFloat(dbProperty.latitude), parseFloat(dbProperty.longitude)] as [number, number] // Assuming array based on error
              : undefined,
          },
          features: {
            bedrooms: dbProperty.number_of_rooms || 0,
            bathrooms: dbProperty.number_of_bathrooms || 0,
            size: dbProperty.square_footage || 0, // Assuming 'size' instead of 'area' based on error
            furnished: dbProperty.furnished !== undefined ? dbProperty.furnished : false, // Assuming 'furnished' based on error
            amenities: dbProperty.amenities || [],
          },
          images: dbProperty.images || [],
          status: dbProperty.status || 'pending',
          ownerId: dbProperty.owner_id,
          renterId: dbProperty.renter_id,
          createdAt: dbProperty.listing_date || dbProperty.created_at || new Date().toISOString(),
          updatedAt: dbProperty.updated_at || dbProperty.listing_date || new Date().toISOString(),
          views: dbProperty.views || 0,
          inquiries: dbProperty.inquiries || 0,
          daysListed: dbProperty.days_listed || 0,
        };
        return p as Property;
      });
    } catch (error) {
      console.error(`Supabase getProperties via RPC (${ownerId ? 'get_landlord_properties' : 'get_properties'}) failed:`, error);
      return [];
    }
  }

  async createProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'inquiries' | 'daysListed'>, ownerId: string): Promise<Property | null> {
    try {
      // Adjusting to hypothetical Property type based on TS errors
      const features = propertyData.features as any; // Cast to any to access potentially missing/renamed fields
      const location = propertyData.location as any;

      const params = {
        p_title_en: propertyData.title,
        p_title_ar: null,
        p_description_en: propertyData.description,
        p_description_ar: null,
        p_rent_amount: propertyData.price,
        p_security_deposit: 0,
        p_number_of_rooms: features.bedrooms,
        p_square_footage: features.size || features.area || 0, // Prefer 'size', fallback to 'area' if error was misleading
        p_property_type_en: 'Apartment',
        p_property_type_ar: null,
        p_availability_date: new Date().toISOString(),
        p_owner_id: ownerId,
        p_city_en: location.city,
        p_city_ar: null,
        p_area_en: location.area,
        p_area_ar: null,
        p_latitude: Array.isArray(location.coordinates) ? location.coordinates[0] : location.coordinates?.latitude || null,
        p_longitude: Array.isArray(location.coordinates) ? location.coordinates[1] : location.coordinates?.longitude || null,
      };

      const { data: newPropertyId, error: rpcError } = await supabase.rpc('add_property', params);

      if (rpcError) {
        console.error('Error calling Supabase RPC add_property:', rpcError);
        throw rpcError;
      }

      if (!newPropertyId || typeof newPropertyId !== 'string') {
        console.error('Supabase RPC add_property did not return a valid ID.');
        return null;
      }

      const { data: newPropertyArray, error: fetchError } = await supabase.rpc('get_property_by_id', { p_property_id: newPropertyId });

      if (fetchError) {
        console.error(`Error calling Supabase RPC get_property_by_id for ID ${newPropertyId}:`, fetchError);
        return null;
      }

      if (!newPropertyArray || !Array.isArray(newPropertyArray) || newPropertyArray.length === 0) {
        console.error(`Supabase RPC get_property_by_id (ID: ${newPropertyId}) did not return the new property.`);
        return null;
      }
      
      const dbProperty = newPropertyArray[0];
      // Cast propertyData features/location to 'any' to handle potential discrepancies indicated by TS errors
      const inputFeatures = propertyData.features as any;
      const inputLocation = propertyData.location as any;

      const p = {
        id: dbProperty.id,
        title: dbProperty.title_en || dbProperty.title || '',
        description: dbProperty.description_en || dbProperty.description || '',
        price: dbProperty.rent_amount || 0,
        currency: propertyData.currency || 'USD',
        location: {
          city: dbProperty.city_en || dbProperty.city || '',
          area: dbProperty.area_en || dbProperty.area || '',
          coordinates: (dbProperty.latitude && dbProperty.longitude) ?
            [parseFloat(dbProperty.latitude), parseFloat(dbProperty.longitude)] as [number, number] // Assuming array
            : undefined,
        },
        features: {
          bedrooms: dbProperty.number_of_rooms || 0,
          bathrooms: dbProperty.number_of_bathrooms || 0,
          size: dbProperty.square_footage || 0, // Assuming 'size'
          furnished: inputFeatures.furnished !== undefined ? inputFeatures.furnished : (dbProperty.furnished !== undefined ? dbProperty.furnished : false), // Assuming 'furnished'
          amenities: inputFeatures.amenities || [],
        },
        images: propertyData.images || [],
        status: dbProperty.status || 'available',
        ownerId: dbProperty.owner_id,
        renterId: dbProperty.renter_id,
        createdAt: dbProperty.listing_date || dbProperty.created_at || new Date().toISOString(),
        updatedAt: dbProperty.updated_at || dbProperty.listing_date || new Date().toISOString(),
        views: dbProperty.views || 0,
        inquiries: dbProperty.inquiries || 0,
        daysListed: dbProperty.days_listed || 0,
      };
      return p as Property;

    } catch (error) {
      console.error('Supabase createProperty via RPC failed:', error);
      return null;
    }
  }

  async getPropertyById(id: string): Promise<Property> {
    // This would normally fetch from API
    return {
      id,
      ownerId: 'owner1',
      title: 'Beautiful Apartment',
      description: 'Spacious and modern apartment with great views.',
      price: 1200,
      currency: 'USD',
      location: {
        city: 'New York',
        area: 'Manhattan',
        address: '123 Main St',
      },
      features: {
        size: 100,
        bedrooms: 2,
        bathrooms: 1,
        furnished: true,
        amenities: ['WiFi', 'Parking', 'Pool', 'Gym'],
      },
      images: [
        'https://picsum.photos/800/600?random=1',
        'https://picsum.photos/800/600?random=2',
        'https://picsum.photos/800/600?random=3',
      ],
      status: 'available',
      rules: ['No pets', 'No smoking'],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };
  }

  async getLandlordProperties(landlordId: string): Promise<Property[]> {
    await this.simulateDelay();
    return mockProperties.filter((property) => property.ownerId === landlordId);
  }

  async getLandlordRenters(landlordId: string): Promise<Tenant[]> {
    await this.simulateDelay();
    const landlord = mockUsers.find((user) => user.id === landlordId);
    if (!landlord?.renters) return [];

    return landlord.renters
      .map((renterId) => {
        const renter = mockUsers.find((user) => user.id === renterId);
        if (!renter) return null;

        return {
          id: renter.id,
          fullName: renter.fullName,
          avatar: renter.profileImage || '/assets/images/avatar-placeholder.jpg',
          propertyId: renter.rentedProperties?.[0] || '',
          propertyName:
            mockProperties.find((p) => p.id === renter.rentedProperties?.[0])?.title || '',
          leaseStart: '2024-01-01',
          leaseEnd: '2024-12-31',
          status: (renter.rentedProperties?.length ? 'active' : 'pending') as 'active' | 'pending' | 'past',
          rating: 4.8, // Assuming rating is part of the mock structure
          // Adding missing fields based on the persistent Tenant type error
          contactEmail: renter.email || 'default-mock-email@example.com',
          contactPhone: renter.phone || '+11234567890',
          reviewStatus: 'unreviewed' as 'unreviewed' | 'reviewed' | 'pending_landlord_review', // Provide a default valid status
        };
      })
      .filter(Boolean) as Tenant[];
  }

  async getRenterProperties(renterId: string): Promise<Property[]> {
    await this.simulateDelay();
    const renter = mockUsers.find((user) => user.id === renterId);
    if (!renter?.rentedProperties) return [];

    return mockProperties.filter((property) => renter.rentedProperties?.includes(property.id));
  }

  async getTransactions(propertyId?: string): Promise<Transaction[]> {
    await this.simulateDelay();
    if (propertyId) {
      return mockTransactions.filter((transaction) => transaction.propertyId === propertyId);
    }
    return mockTransactions;
  }

  async getSavedProperties(renterId: string): Promise<Property[]> {
    await this.simulateDelay();
    const renter = mockUsers.find((user) => user.id === renterId);
    if (!renter?.savedProperties) return [];
    return mockProperties.filter((property) => renter.savedProperties?.includes(property.id));
  }

  async getMaintenanceRequests(renterId: string): Promise<MaintenanceRequest[]> {
    await this.simulateDelay();
    return mockMaintenanceRequests.filter((request) => request.renterId === renterId);
  }

  async getActiveMaintenanceRequests(renterId: string): Promise<MaintenanceRequest[]> {
    await this.simulateDelay();
    return getActiveRequests(renterId);
  }

  async getPastMaintenanceRequests(renterId: string): Promise<MaintenanceRequest[]> {
    await this.simulateDelay();
    return getPastRequests(renterId);
  }

  async createMaintenanceRequest(
    request: Omit<MaintenanceRequest, 'id' | 'createdAt'>,
  ): Promise<MaintenanceRequest> {
    await this.simulateDelay();
    const newRequest: MaintenanceRequest = {
      ...request,
      id: `req${mockMaintenanceRequests.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    mockMaintenanceRequests.push(newRequest);
    return newRequest;
  }

  async updateMaintenanceRequest(
    id: string,
    updates: Partial<MaintenanceRequest>,
  ): Promise<MaintenanceRequest> {
    await this.simulateDelay();
    const index = mockMaintenanceRequests.findIndex((request) => request.id === id);
    if (index === -1) {
      throw new Error('Maintenance request not found');
    }
    mockMaintenanceRequests[index] = {
      ...mockMaintenanceRequests[index],
      ...updates,
    };
    return mockMaintenanceRequests[index];
  }
  
  // Rent Request methods
  async getRentRequests(): Promise<RentRequest[]> {
    await this.simulateDelay();
    return mockRentRequests;
  }

  async getRentRequestById(id: string): Promise<RentRequest | null> {
    await this.simulateDelay();
    return mockRentRequests.find((request) => request.id === id) || null;
  }

  async sendRentRequest(requestData: Omit<RentRequest, 'id' | 'requestDate' | 'status' | 'responseDate'>): Promise<RentRequest> {
    await this.simulateDelay();
    
    const newRequest: RentRequest = {
      id: `rent${mockRentRequests.length + 1}`,
      requestDate: new Date().toISOString(),
      status: 'pending',
      responseDate: undefined,
      ...requestData,
    };
    
    mockRentRequests.push(newRequest);
    
    // Auto-accept after 1 second for testing contract screens
    setTimeout(async () => {
      const index = mockRentRequests.findIndex((req) => req.id === newRequest.id);
      if (index !== -1 && mockRentRequests[index].status === 'pending') {
        mockRentRequests[index] = {
          ...mockRentRequests[index],
          status: 'accepted',
          responseDate: new Date().toISOString(),
        };
        console.log(`Auto-accepted rent request ${newRequest.id} after 1 second`);
        
        // Find property info for the notification
        const property = mockProperties.find(p => p.id === newRequest.propertyId);
        const propertyName = property ? property.title : 'the property';
        
        // Create notification for the renter
        await this.createNotification(
          newRequest.renterId,
          'rent_accepted',
          `Your rental request for ${propertyName} has been accepted! You can now proceed with signing the contract.`,
          { 
            requestId: newRequest.id,
            propertyId: newRequest.propertyId,
            contractAvailable: true
          }
        );
      }
    }, 1000);
    
    return newRequest;
  }

  async updateRentRequest(id: string, updates: Partial<RentRequest>): Promise<RentRequest> {
    await this.simulateDelay();
    const index = mockRentRequests.findIndex((request) => request.id === id);
    if (index === -1) {
      throw new Error('Rent request not found');
    }
    mockRentRequests[index] = {
      ...mockRentRequests[index],
      ...updates,
    };
    return mockRentRequests[index];
  }

  async updateRentRequestStatus(id: string, status: 'accepted' | 'rejected'): Promise<RentRequest> {
    await this.simulateDelay();
    const index = mockRentRequests.findIndex((request) => request.id === id);
    if (index === -1) {
      throw new Error('Rent request not found');
    }
    
    const prevStatus = mockRentRequests[index].status;
    const renterId = mockRentRequests[index].renterId;
    const propertyId = mockRentRequests[index].propertyId;
    
    mockRentRequests[index] = {
      ...mockRentRequests[index],
      status,
      responseDate: new Date().toISOString(),
    };
    
    // If status changed to accepted or rejected, send notification
    if (prevStatus !== status) {
      const property = mockProperties.find(p => p.id === propertyId);
      const propertyName = property ? property.title : 'the property';
      
      if (status === 'accepted') {
        await this.createNotification(
          renterId,
          'rent_accepted',
          `Your rental request for ${propertyName} has been accepted! You can now proceed with signing the contract.`,
          { 
            requestId: mockRentRequests[index].id,
            propertyId: propertyId,
            contractAvailable: true
          }
        );
      } else if (status === 'rejected') {
        await this.createNotification(
          renterId,
          'rent_rejected',
          `Your rental request for ${propertyName} has been declined.`,
          { 
            requestId: mockRentRequests[index].id,
            propertyId: propertyId
          }
        );
      }
    }
    
    return mockRentRequests[index];
  }

  async getContractByProperty(propertyId: string, renterId: string): Promise<any | null> {
    await this.simulateDelay();
    // Implementation would go here in a real app
    return null;
  }

  async saveProperty(userId: string, propertyId: string): Promise<boolean> {
    console.log(`Property ${propertyId} saved by user ${userId}`);
    return true;
  }

  async unsaveProperty(userId: string, propertyId: string): Promise<boolean> {
    console.log(`Property ${propertyId} unsaved by user ${userId}`);
    return true;
  }

  // New methods for renter review system
  async submitRenterReview(review: Omit<RenterReview, 'id'>): Promise<RenterReview> {
    const newReview: RenterReview = {
      ...review,
      id: `review-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    reviews.push(newReview);
    
    // Update tenant's review status
    const tenant = tenants.find(t => t.id === review.renterId);
    if (tenant) {
      tenant.reviewStatus = 'reviewed';
    }
    
    return newReview;
  }
  
  async getRenterReviews(renterId: string): Promise<RenterReview[]> {
    return reviews.filter(review => review.renterId === renterId);
  }
  
  async submitReviewResponse(reviewId: string, responseText: string): Promise<RenterReview> {
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    review.response = {
      text: responseText,
      createdAt: new Date().toISOString(),
    };
    
    return review;
  }
  
  async getTenantEligibleForReview(landlordId: string): Promise<Tenant[]> {
    const currentDate = new Date();
    
    return tenants.filter(tenant => {
      const leaseEndDate = new Date(tenant.leaseEnd);
      return leaseEndDate <= currentDate && tenant.reviewStatus === 'unreviewed';
    });
  }

  // Property review system methods
  async submitPropertyReview(review: Omit<PropertyReview, 'id'>): Promise<PropertyReview> {
    const newReview: PropertyReview = {
      ...review,
      id: `p-review-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    propertyReviews.push(newReview);
    
    // Update property's review status if we were tracking it at the property level
    // In a real implementation, you might want to update property metadata
    
    return newReview;
  }
  
  async getPropertyReviews(propertyId: string): Promise<PropertyReview[]> {
    return propertyReviews.filter(review => review.propertyId === propertyId);
  }
  
  async submitPropertyReviewResponse(reviewId: string, responseText: string): Promise<PropertyReview> {
    const review = propertyReviews.find(r => r.id === reviewId);
    
    if (!review) {
      throw new Error('Property review not found');
    }
    
    review.response = {
      text: responseText,
      createdAt: new Date().toISOString(),
    };
    
    return review;
  }
  
  async getPropertiesEligibleForReview(renterId: string): Promise<Property[]> {
    const currentDate = new Date();
    
    // In a real implementation, this would check contracts with ended lease terms
    // For now, we'll return mock properties that would be eligible
    return mockProperties.filter(property => 
      // Some logic to check if this renter has a completed contract for this property
      // and hasn't already reviewed it
      property.id.includes('prop')
    );
  }

  // Viewing Request Methods
  async getAvailableTimeSlots(propertyId: string, date: string): Promise<TimeSlot[]> {
    await this.simulateDelay();
    // For now, return all slots, filtering by date and availability
    // In a real scenario, this would check landlord availability, existing bookings for the property, etc.
    return mockAvailableTimeSlots.filter(slot => {
      const slotDate = slot.startTime.split('T')[0];
      // A simple check: if a viewing request for this property and slot is confirmed, it's booked.
      const isBookedByViewingRequest = mockViewingRequests.some(vr =>
        vr.propertyId === propertyId &&
        vr.status === 'confirmed' &&
        vr.preferredTimeSlots.some(pts => pts.date === date && pts.timeSlotId === slot.id)
      );
      return slotDate.startsWith(date.split('T')[0]) && !slot.isBooked && !isBookedByViewingRequest;
    });
  }

  async createViewingRequest(
    requestData: Omit<ViewingRequest, 'id' | 'requestDate' | 'status' | 'landlordId'>,
    renterId: string,
    propertyOwnerId: string // Assuming we can get the property owner ID
  ): Promise<ViewingRequest> {
    await this.simulateDelay();
    const newRequest: ViewingRequest = {
      ...requestData,
      id: `viewReq-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      renterId,
      landlordId: propertyOwnerId,
      requestDate: new Date().toISOString(),
      status: 'pending',
    };
    mockViewingRequests.push(newRequest);

    // Notify Landlord
    this.createNotification(
      propertyOwnerId,
      'viewing_request_created',
      `New viewing request for property ${requestData.propertyId} from user ${renterId}.`,
      { viewingRequestId: newRequest.id, propertyId: requestData.propertyId }
    );
    return newRequest;
  }

  async getViewingRequestById(id: string): Promise<ViewingRequest | null> {
    await this.simulateDelay();
    const request = mockViewingRequests.find(req => req.id === id);
    return request || null;
  }

  async getViewingRequestsForProperty(propertyId: string): Promise<ViewingRequest[]> {
    await this.simulateDelay();
    return mockViewingRequests.filter(req => req.propertyId === propertyId);
  }

  async getViewingRequestsForUser(userId: string, role: 'renter' | 'landlord'): Promise<ViewingRequest[]> {
    await this.simulateDelay();
    if (role === 'renter') {
      return mockViewingRequests.filter(req => req.renterId === userId);
    } else {
      return mockViewingRequests.filter(req => req.landlordId === userId);
    }
  }

  async updateViewingRequestStatus(
    id: string,
    status: 'confirmed' | 'rejected' | 'cancelled',
    reason?: string, // For rejection or cancellation
    actorId?: string // ID of user performing action (landlord or renter for cancellation)
  ): Promise<ViewingRequest | null> {
    await this.simulateDelay();
    const requestIndex = mockViewingRequests.findIndex(req => req.id === id);
    if (requestIndex === -1) {
      return null;
    }

    const oldRequest = mockViewingRequests[requestIndex];
    const updatedRequest: ViewingRequest = {
      ...oldRequest,
      status,
      responseDate: new Date().toISOString(),
    };

    if (status === 'rejected' && reason) {
      updatedRequest.rejectionReason = reason;
    }
    if (status === 'cancelled' && reason) {
      updatedRequest.cancellationReason = reason;
    }

    mockViewingRequests[requestIndex] = updatedRequest;

    // Handle booking of time slot if confirmed
    if (status === 'confirmed') {
      updatedRequest.preferredTimeSlots.forEach(pts => {
        const slotIndex = mockAvailableTimeSlots.findIndex(s => s.id === pts.timeSlotId && s.startTime.startsWith(pts.date));
        if (slotIndex !== -1) {
          mockAvailableTimeSlots[slotIndex].isBooked = true;
        }
      });
      // Notify Renter
      this.createNotification(
        updatedRequest.renterId,
        'viewing_request_confirmed',
        `Your viewing request for property ${updatedRequest.propertyId} has been confirmed.`,
        { viewingRequestId: updatedRequest.id, propertyId: updatedRequest.propertyId }
      );
    } else if (status === 'rejected') {
      // Notify Renter
      this.createNotification(
        updatedRequest.renterId,
        'viewing_request_rejected',
        `Your viewing request for property ${updatedRequest.propertyId} has been rejected. Reason: ${reason}`,
        { viewingRequestId: updatedRequest.id, propertyId: updatedRequest.propertyId }
      );
    } else if (status === 'cancelled') {
      // Unbook time slot if it was previously confirmed
      if (oldRequest.status === 'confirmed') {
         oldRequest.preferredTimeSlots.forEach(pts => {
            const slotIndex = mockAvailableTimeSlots.findIndex(s => s.id === pts.timeSlotId && s.startTime.startsWith(pts.date));
            if (slotIndex !== -1) {
                mockAvailableTimeSlots[slotIndex].isBooked = false;
            }
        });
      }
      // Notify the other party
      const recipientId = actorId === updatedRequest.renterId ? updatedRequest.landlordId : updatedRequest.renterId;
      const cancelledBy = actorId === updatedRequest.renterId ? 'the renter' : 'the landlord';
      this.createNotification(
        recipientId,
        'viewing_request_cancelled',
        `Viewing request for property ${updatedRequest.propertyId} has been cancelled by ${cancelledBy}. Reason: ${reason}`,
        { viewingRequestId: updatedRequest.id, propertyId: updatedRequest.propertyId }
      );
    }

    return updatedRequest;
  }

  async getAllUsers(): Promise<AdminUserDisplay[]> {
    await this.simulateDelay();
    return mockAdminPanelUsers;
  }

  async getPropertiesForVerification(): Promise<Property[]> {
    await this.simulateDelay();
    // Assuming mockProperties is an array of Property objects
    // and includes properties with 'pending_verification' status.
    // If mockProperties is not already populated with such data,
    // we might need to adjust mockData.ts or add specific mock data here.
    const allProperties = await this.getProperties(); // Utilize existing method
    return allProperties.filter(property => property.status === 'pending_verification');
  }

  async updatePropertyVerificationStatus(propertyId: string, newStatus: PropertyStatus): Promise<Property | null> {
    await this.simulateDelay();
    const propertyIndex = mockProperties.findIndex(p => p.id === propertyId);
    if (propertyIndex !== -1) {
      // Ensure we are creating a new object for the update to avoid direct state mutation if mockProperties is used elsewhere
      const updatedProperty = { ...mockProperties[propertyIndex], status: newStatus, updatedAt: new Date().toISOString() };
      mockProperties[propertyIndex] = updatedProperty;
      
      // If using Supabase or a real backend, this is where you'd make the API call
      // For example, if there's a general updateProperty method:
      // return this.updateProperty(propertyId, { status: newStatus });
      
      // For now, just return the updated mock object
      return updatedProperty;
    }
    console.warn(`Property with ID ${propertyId} not found for verification status update.`);
    return null;
  }
}

export const mockApi = new MockApiService();
