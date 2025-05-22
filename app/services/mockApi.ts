import {
  Tenant,
  Property,
  Transaction,
  Application,
  Stats,
  User,
  MaintenanceRequest,
  RentRequest,
  RenterReview,
  PropertyReview,
} from '../types';
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
    startDate: new Date().toISOString(),
    message: 'I am interested in renting this property.',
    responseDate: null,
  },
  {
    id: 'rent2',
    propertyId: 'prop3',
    renterId: 'user4',
    requestDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: 'accepted',
    months: 12,
    startDate: new Date().toISOString(),
    message: 'Looking for a long term rental.',
    responseDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    contractId: 'contract2',
  },
  {
    id: 'rent3',
    propertyId: 'prop4',
    renterId: 'user5',
    requestDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: 'rejected',
    months: 3,
    startDate: new Date().toISOString(),
    message: 'Short term rental needed.',
    responseDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

// Define notification types
export type Notification = {
  id: string;
  userId: string;
  type: 'rent_accepted' | 'rent_rejected' | 'maintenance_update' | 'general';
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
};

// Store for notifications
const mockNotifications: Notification[] = [];

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

// Mock API Service
class MockApiService {
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

  async getProperties(ownerId?: string): Promise<Property[]> {
    await this.simulateDelay();
    if (ownerId) {
      return mockProperties.filter((property) => property.ownerId === ownerId);
    }
    return mockProperties;
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
          status: renter.rentedProperties?.length ? 'active' : ('pending' as const),
          rating: 4.8,
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
      responseDate: null,
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

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export const mockApi = new MockApiService();
