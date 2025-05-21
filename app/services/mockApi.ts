import {
  Tenant,
  Property,
  Transaction,
  Application,
  Stats,
  User,
  MaintenanceRequest,
  RentRequest,
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
  async getTenants(status?: 'active' | 'pending' | 'past'): Promise<Tenant[]> {
    await this.simulateDelay();
    const tenants = mockUsers
      .filter((user) => user.role === 'renter')
      .map((user) => ({
        id: user.id,
        fullName: user.fullName,
        avatar: user.profileImage || '/assets/images/avatar-placeholder.jpg',
        propertyId: user.rentedProperties?.[0] || '',
        propertyName: mockProperties.find((p) => p.id === user.rentedProperties?.[0])?.title || '',
        leaseStart: '2024-01-01',
        leaseEnd: '2024-12-31',
        status: (user.rentedProperties?.length ? 'active' : 'pending') as
          | 'active'
          | 'pending'
          | 'past',
        rating: 4.8,
      }));

    if (status) {
      return tenants.filter((tenant) => tenant.status === status);
    }
    return tenants;
  }

  async getApplications(): Promise<Application[]> {
    await this.simulateDelay();
    return mockApplications.map((app) => ({
      id: app.id,
      applicantName: mockUsers.find((u) => u.id === app.renterId)?.fullName || '',
      propertyId: app.propertyId,
      propertyName: mockProperties.find((p) => p.id === app.propertyId)?.title || '',
      applicationDate: app.createdAt,
      status: app.status,
    }));
  }

  async getApplicationsDetailed() {
    await this.simulateDelay();
    return mockApplications;
  }

  async getStats(): Promise<Stats> {
    await this.simulateDelay();
    return {
      activeLeases: mockUsers.filter(
        (user) => user.role === 'renter' && user.rentedProperties?.length,
      ).length,
      expiringSoon: 1,
      averageRating: 4.8,
    };
  }

  async getProperties(ownerId?: string): Promise<Property[]> {
    await this.simulateDelay();
    if (ownerId) {
      return mockProperties.filter((property) => property.ownerId === ownerId);
    }
    return mockProperties;
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    await this.simulateDelay();
    return mockProperties.find((property) => property.id === id);
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

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export const mockApi = new MockApiService();
