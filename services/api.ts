import {
  mockProperties,
  mockUsers,
  mockMessages,
  mockTransactions,
  mockApplications,
  mockMaintenanceRequests,
  mockRentalContracts,
  Property,
  User,
  Message,
  Transaction,
  Application,
  MaintenanceRequest,
  RentalContract,
} from './mockData';

// Helper: Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Properties API
export const propertiesApi = {
  getAll: async (): Promise<Property[]> => {
    await delay(500);
    return [...mockProperties];
  },
  
  getById: async (id: string): Promise<Property | null> => {
    await delay(300);
    const property = mockProperties.find(p => p.id === id);
    return property ? { ...property } : null;
  },
  
  getByOwner: async (ownerId: string): Promise<Property[]> => {
    await delay(500);
    return mockProperties.filter(p => p.ownerId === ownerId).map(p => ({ ...p }));
  },
  
  getByRenter: async (renterId: string): Promise<Property[]> => {
    await delay(500);
    return mockProperties.filter(p => p.renterId === renterId).map(p => ({ ...p }));
  },
  
  search: async (
    criteria: {
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      bedrooms?: number;
      bathrooms?: number;
      status?: 'available' | 'rented';
    }
  ): Promise<Property[]> => {
    await delay(700);
    return mockProperties
      .filter(p => {
        if (criteria.location && 
            !p.location.city.toLowerCase().includes(criteria.location.toLowerCase()) && 
            !p.location.area.toLowerCase().includes(criteria.location.toLowerCase())) {
          return false;
        }
        if (criteria.minPrice && p.price < criteria.minPrice) return false;
        if (criteria.maxPrice && p.price > criteria.maxPrice) return false;
        if (criteria.bedrooms && p.features.bedrooms < criteria.bedrooms) return false;
        if (criteria.bathrooms && p.features.bathrooms < criteria.bathrooms) return false;
        if (criteria.status && p.status !== criteria.status) return false;
        return true;
      })
      .map(p => ({ ...p }));
  },
};

// Users API
export const usersApi = {
  getById: async (id: string): Promise<User | null> => {
    await delay(300);
    const user = mockUsers.find(u => u.id === id);
    return user ? { ...user } : null;
  },
  
  getCurrentUser: async (): Promise<User> => {
    // Simulate getting the current logged-in user (for now returning a hardcoded one)
    await delay(300);
    return { ...mockUsers[0] };
  },
  
  getLandlords: async (): Promise<User[]> => {
    await delay(500);
    return mockUsers.filter(u => u.role === 'landlord').map(u => ({ ...u }));
  },
  
  getRenters: async (): Promise<User[]> => {
    await delay(500);
    return mockUsers.filter(u => u.role === 'renter').map(u => ({ ...u }));
  },
};

// Messages API
export const messagesApi = {
  getByUser: async (userId: string): Promise<Message[]> => {
    await delay(500);
    return mockMessages
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .map(m => ({ ...m }));
  },
  
  getConversation: async (userId1: string, userId2: string): Promise<Message[]> => {
    await delay(300);
    return mockMessages
      .filter(
        m => 
          (m.senderId === userId1 && m.receiverId === userId2) || 
          (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(m => ({ ...m }));
  },
  
  getUnreadCount: async (userId: string): Promise<number> => {
    await delay(200);
    return mockMessages.filter(m => m.receiverId === userId && !m.isRead).length;
  },
};

// Transactions API
export const transactionsApi = {
  getByLandlord: async (landlordId: string): Promise<Transaction[]> => {
    await delay(500);
    return mockTransactions.filter(t => t.landlordId === landlordId).map(t => ({ ...t }));
  },
  
  getByRenter: async (renterId: string): Promise<Transaction[]> => {
    await delay(500);
    return mockTransactions.filter(t => t.renterId === renterId).map(t => ({ ...t }));
  },
  
  getByProperty: async (propertyId: string): Promise<Transaction[]> => {
    await delay(400);
    return mockTransactions.filter(t => t.propertyId === propertyId).map(t => ({ ...t }));
  },
  
  getFinancialSummary: async (userId: string): Promise<{
    totalRevenue: number;
    received: number;
    pending: number;
    overdue: number;
  }> => {
    await delay(600);
    
    const userTransactions = mockTransactions.filter(t => t.landlordId === userId);
    
    const totalRevenue = userTransactions.reduce((sum, t) => sum + t.amount, 0);
    const received = userTransactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
    const pending = userTransactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
    const overdue = userTransactions
      .filter(t => t.status === 'overdue')
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      totalRevenue,
      received,
      pending,
      overdue,
    };
  },
};

// Applications API
export const applicationsApi = {
  getByProperty: async (propertyId: string): Promise<Application[]> => {
    await delay(500);
    return mockApplications.filter(a => a.propertyId === propertyId).map(a => ({ ...a }));
  },
  
  getByRenter: async (renterId: string): Promise<Application[]> => {
    await delay(500);
    return mockApplications.filter(a => a.renterId === renterId).map(a => ({ ...a }));
  },
  
  getByLandlord: async (landlordId: string): Promise<Application[]> => {
    await delay(700);
    // Get properties owned by this landlord
    const landlordProperties = mockProperties
      .filter(p => p.ownerId === landlordId)
      .map(p => p.id);
      
    // Get applications for those properties
    return mockApplications
      .filter(a => landlordProperties.includes(a.propertyId))
      .map(a => ({ ...a }));
  },
};

// Maintenance Requests API
export const maintenanceApi = {
  getByProperty: async (propertyId: string): Promise<MaintenanceRequest[]> => {
    await delay(500);
    return mockMaintenanceRequests.filter(m => m.propertyId === propertyId).map(m => ({ ...m }));
  },
  
  getByRenter: async (renterId: string): Promise<MaintenanceRequest[]> => {
    await delay(500);
    return mockMaintenanceRequests.filter(m => m.renterId === renterId).map(m => ({ ...m }));
  },
};

// Rental Contracts API
export const contractsApi = {
  getById: async (id: string): Promise<RentalContract | null> => {
    await delay(300);
    const contract = mockRentalContracts.find(c => c.id === id);
    return contract ? { ...contract } : null;
  },
  
  getByProperty: async (propertyId: string): Promise<RentalContract[]> => {
    await delay(400);
    return mockRentalContracts
      .filter(c => c.propertyId === propertyId)
      .map(c => ({ ...c }));
  },
  
  getByRenter: async (renterId: string): Promise<RentalContract[]> => {
    await delay(500);
    return mockRentalContracts
      .filter(c => c.renterId === renterId)
      .map(c => ({ ...c }));
  },
  
  getByLandlord: async (landlordId: string): Promise<RentalContract[]> => {
    await delay(600);
    // Get properties owned by this landlord
    const landlordProperties = mockProperties
      .filter(p => p.ownerId === landlordId)
      .map(p => p.id);
      
    // Get contracts for those properties
    return mockRentalContracts
      .filter(c => landlordProperties.includes(c.propertyId))
      .map(c => ({ ...c }));
  },
  
  getActiveContracts: async (): Promise<RentalContract[]> => {
    await delay(400);
    return mockRentalContracts
      .filter(c => c.status === 'active')
      .map(c => ({ ...c }));
  },
  
  createContract: async (contractData: Omit<RentalContract, 'id' | 'createdAt'>): Promise<RentalContract> => {
    await delay(800);
    
    // Simulate creating a new contract with an ID
    const newContract: RentalContract = {
      ...contractData,
      id: `contract${mockRentalContracts.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    
    // In a real app, we would save this to the database
    // mockRentalContracts.push(newContract);
    
    return newContract;
  },
  
  updateContract: async (id: string, updates: Partial<RentalContract>): Promise<RentalContract | null> => {
    await delay(500);
    
    const contractIndex = mockRentalContracts.findIndex(c => c.id === id);
    if (contractIndex === -1) return null;
    
    // In a real app, we would update the database
    const updatedContract = {
      ...mockRentalContracts[contractIndex],
      ...updates,
    };
    
    return updatedContract;
  },
  
  terminateContract: async (id: string): Promise<RentalContract | null> => {
    return await contractsApi.updateContract(id, { status: 'terminated' });
  },
  
  extendContract: async (id: string, newEndDate: string): Promise<RentalContract | null> => {
    return await contractsApi.updateContract(id, { endDate: newEndDate });
  },
};

// Combined API interface for easier imports
const api = {
  properties: propertiesApi,
  users: usersApi,
  messages: messagesApi,
  transactions: transactionsApi,
  applications: applicationsApi,
  maintenance: maintenanceApi,
  contracts: contractsApi,
  activity: {
    getLandlordActivity: async (landlordId: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return mock activity data
      return [
        {
          id: '1',
          type: 'application' as const,
          title: 'New application for Garden Apartment',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
        {
          id: '2',
          type: 'payment' as const,
          title: 'Rent payment received for City View Condo',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
        {
          id: '3',
          type: 'maintenance' as const,
          title: 'Maintenance request for Mountain Villa',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
      ];
    },
  },
};

export default api; 