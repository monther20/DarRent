import { Tenant, Property, Transaction, Application, Stats, User } from '../types';
import { mockProperties, mockUsers, mockApplications, mockTransactions } from '../../services/mockData';

// Mock Data
const tenants: Tenant[] = [
  {
    id: '1',
    fullName: 'John Doe',
    avatar: '/assets/images/avatar-placeholder.jpg',
    propertyId: '1',
    propertyName: 'Garden Apartment',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-06-01',
    status: 'active',
    rating: 4.8,
  },
  {
    id: '2',
    fullName: 'Sarah Parker',
    avatar: '/assets/images/avatar-placeholder.jpg',
    propertyId: '2',
    propertyName: 'City View Condo',
    leaseStart: '2023-12-01',
    leaseEnd: '2024-11-01',
    status: 'active',
    rating: 4.9,
  },
];

const properties: Property[] = [
  {
    id: '1',
    title: 'Garden Apartment',
    price: 850,
    image: '/assets/images/property-placeholder.jpg',
    status: 'active',
    tenantId: '1',
  },
  {
    id: '2',
    title: 'City View Condo',
    price: 1065,
    image: '/assets/images/property-placeholder.jpg',
    status: 'active',
    tenantId: '2',
  },
  {
    id: '3',
    title: 'Mountain Villa',
    price: 1770,
    image: '/assets/images/property-placeholder.jpg',
    status: 'active',
  },
];

const applications: Application[] = [
  {
    id: '1',
    applicantName: 'Mike Johnson',
    propertyId: '3',
    propertyName: 'Mountain Villa',
    applicationDate: '2024-03-15',
    status: 'pending',
  },
  {
    id: '2',
    applicantName: 'Emma Wilson',
    propertyId: '3',
    propertyName: 'Mountain Villa',
    applicationDate: '2024-03-14',
    status: 'pending',
  },
  {
    id: '3',
    applicantName: 'David Brown',
    propertyId: '3',
    propertyName: 'Mountain Villa',
    applicationDate: '2024-03-13',
    status: 'pending',
  },
];

// Mock API Service
class MockApiService {
  async getTenants(status?: 'active' | 'pending' | 'past'): Promise<Tenant[]> {
    await this.simulateDelay();
    const tenants = mockUsers
      .filter(user => user.role === 'renter')
      .map(user => ({
        id: user.id,
        fullName: user.fullName,
        avatar: user.profileImage || '/assets/images/avatar-placeholder.jpg',
        propertyId: user.rentedProperties?.[0] || '',
        propertyName: mockProperties.find(p => p.id === user.rentedProperties?.[0])?.title || '',
        leaseStart: '2024-01-01',
        leaseEnd: '2024-12-31',
        status: user.rentedProperties?.length ? 'active' : 'pending' as const,
        rating: 4.8,
      }));

    if (status) {
      return tenants.filter(tenant => tenant.status === status);
    }
    return tenants;
  }

  async getApplications(): Promise<Application[]> {
    await this.simulateDelay();
    return mockApplications.map(app => ({
      id: app.id,
      applicantName: mockUsers.find(u => u.id === app.renterId)?.fullName || '',
      propertyId: app.propertyId,
      propertyName: mockProperties.find(p => p.id === app.propertyId)?.title || '',
      applicationDate: app.createdAt,
      status: app.status,
    }));
  }

  async getStats(): Promise<Stats> {
    await this.simulateDelay();
    return {
      activeLeases: mockUsers.filter(user => user.role === 'renter' && user.rentedProperties?.length).length,
      expiringSoon: 1,
      averageRating: 4.8,
    };
  }

  async getProperties(ownerId?: string): Promise<Property[]> {
    await this.simulateDelay();
    if (ownerId) {
      return mockProperties.filter(property => property.ownerId === ownerId);
    }
    return mockProperties;
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    await this.simulateDelay();
    return mockProperties.find(property => property.id === id);
  }

  async getLandlordProperties(landlordId: string): Promise<Property[]> {
    await this.simulateDelay();
    return mockProperties.filter(property => property.ownerId === landlordId);
  }

  async getLandlordRenters(landlordId: string): Promise<Tenant[]> {
    await this.simulateDelay();
    const landlord = mockUsers.find(user => user.id === landlordId);
    if (!landlord?.renters) return [];
    
    return landlord.renters.map(renterId => {
      const renter = mockUsers.find(user => user.id === renterId);
      if (!renter) return null;
      
      return {
        id: renter.id,
        fullName: renter.fullName,
        avatar: renter.profileImage || '/assets/images/avatar-placeholder.jpg',
        propertyId: renter.rentedProperties?.[0] || '',
        propertyName: mockProperties.find(p => p.id === renter.rentedProperties?.[0])?.title || '',
        leaseStart: '2024-01-01',
        leaseEnd: '2024-12-31',
        status: renter.rentedProperties?.length ? 'active' : 'pending' as const,
        rating: 4.8,
      };
    }).filter(Boolean) as Tenant[];
  }

  async getRenterProperties(renterId: string): Promise<Property[]> {
    await this.simulateDelay();
    const renter = mockUsers.find(user => user.id === renterId);
    if (!renter?.rentedProperties) return [];
    
    return mockProperties.filter(property => 
      renter.rentedProperties?.includes(property.id)
    );
  }

  async getTransactions(propertyId?: string): Promise<Transaction[]> {
    await this.simulateDelay();
    if (propertyId) {
      return mockTransactions.filter(transaction => transaction.propertyId === propertyId);
    }
    return mockTransactions;
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const mockApi = new MockApiService(); 