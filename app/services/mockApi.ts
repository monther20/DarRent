import { Tenant, Property, Transaction, Application, Stats } from '../types';

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
    if (status) {
      return tenants.filter(tenant => tenant.status === status);
    }
    return tenants;
  }

  async getApplications(): Promise<Application[]> {
    await this.simulateDelay();
    return applications;
  }

  async getStats(): Promise<Stats> {
    await this.simulateDelay();
    return {
      activeLeases: 4,
      expiringSoon: 1,
      averageRating: 4.8,
    };
  }

  async getProperties(): Promise<Property[]> {
    await this.simulateDelay();
    return properties;
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const mockApi = new MockApiService(); 