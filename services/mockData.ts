// Mock data types
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: {
    city: string;
    area: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    amenities: string[];
  };
  images: string[];
  status: 'available' | 'rented' | 'pending';
  ownerId: string;
  renterId?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  inquiries: number;
  daysListed: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  role: 'landlord' | 'renter';
  location: {
    city: string;
    country: string;
  };
  createdAt: string;
  properties?: string[]; // Property IDs for landlords
  rentedProperties?: string[]; // Property IDs for renters
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  propertyId?: string;
}

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

export interface Application {
  id: string;
  propertyId: string;
  renterId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  documents: {
    idCard: boolean;
    proofOfIncome: boolean;
    bankStatement: boolean;
  };
  progress: number; // 0-100%
}

export interface RentalContract {
  id: string;
  propertyId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'terminated' | 'expired';
  securityDeposit: number;
  createdAt: string;
  documents?: {
    signed: boolean;
    url?: string;
  };
}

// Mock data
export const mockProperties: Property[] = [
  {
    id: 'prop1',
    title: 'Garden Apartment',
    description: 'A beautiful garden apartment with modern amenities',
    price: 850,
    currency: 'JOD',
    location: {
      city: 'Amman',
      area: 'Abdoun',
      coordinates: {
        latitude: 31.9539,
        longitude: 35.8504,
      },
    },
    features: {
      bedrooms: 2,
      bathrooms: 1,
      area: 120,
      amenities: ['Parking', 'Balcony', 'Air Conditioning', 'Security'],
    },
    images: ['garden_apartment1.jpg', 'garden_apartment2.jpg', 'garden_apartment3.jpg'],
    status: 'available',
    ownerId: 'user1',
    createdAt: '2023-04-15T00:00:00.000Z',
    updatedAt: '2023-04-15T00:00:00.000Z',
    views: 245,
    inquiries: 12,
    daysListed: 15,
  },
  {
    id: 'prop2',
    title: 'City View Condo',
    description: 'Modern condo with panoramic city views',
    price: 1065,
    currency: 'JOD',
    location: {
      city: 'Amman',
      area: 'Shmeisani',
      coordinates: {
        latitude: 31.9689,
        longitude: 35.9107,
      },
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      amenities: ['Gym', 'Pool', 'Elevator', 'Security'],
    },
    images: ['city_view1.jpg', 'city_view2.jpg', 'city_view3.jpg'],
    status: 'rented',
    ownerId: 'user1',
    renterId: 'user3',
    createdAt: '2023-03-01T00:00:00.000Z',
    updatedAt: '2023-03-01T00:00:00.000Z',
    views: 180,
    inquiries: 8,
    daysListed: 30,
  },
  {
    id: 'prop3',
    title: 'Mountain Villa',
    description: 'Luxurious villa with mountain views',
    price: 1770,
    currency: 'JOD',
    location: {
      city: 'Amman',
      area: 'Dabouq',
      coordinates: {
        latitude: 31.9905,
        longitude: 35.8235,
      },
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 300,
      amenities: ['Garden', 'Parking', 'Air Conditioning', 'Security', 'Fireplace'],
    },
    images: ['mountain_villa1.jpg', 'mountain_villa2.jpg', 'mountain_villa3.jpg'],
    status: 'available',
    ownerId: 'user1',
    createdAt: '2023-05-01T00:00:00.000Z',
    updatedAt: '2023-05-01T00:00:00.000Z',
    views: 320,
    inquiries: 15,
    daysListed: 7,
  },
  {
    id: 'prop4',
    title: 'Modern Apartment',
    description: 'Modern apartment in the heart of the city',
    price: 950,
    currency: 'JOD',
    location: {
      city: 'Amman',
      area: 'Abdoun',
      coordinates: {
        latitude: 31.9539,
        longitude: 35.8604,
      },
    },
    features: {
      bedrooms: 2,
      bathrooms: 1,
      area: 120,
      amenities: ['Parking', 'Balcony', 'Air Conditioning'],
    },
    images: ['modern_apt1.jpg', 'modern_apt2.jpg', 'modern_apt3.jpg'],
    status: 'available',
    ownerId: 'user2',
    createdAt: '2023-05-10T00:00:00.000Z',
    updatedAt: '2023-05-10T00:00:00.000Z',
    views: 95,
    inquiries: 5,
    daysListed: 3,
  },
  {
    id: 'prop5',
    title: 'Luxury Villa',
    description: 'Stunning luxury villa with private pool',
    price: 1800,
    currency: 'JOD',
    location: {
      city: 'Amman',
      area: 'Dabouq',
      coordinates: {
        latitude: 31.9905,
        longitude: 35.8335,
      },
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 300,
      amenities: ['Pool', 'Garden', 'Parking', 'Air Conditioning', 'Security'],
    },
    images: ['luxury_villa1.jpg', 'luxury_villa2.jpg', 'luxury_villa3.jpg'],
    status: 'available',
    ownerId: 'user2',
    createdAt: '2023-04-20T00:00:00.000Z',
    updatedAt: '2023-04-20T00:00:00.000Z',
    views: 210,
    inquiries: 12,
    daysListed: 20,
  },
];

export const mockUsers: User[] = [
  {
    id: 'user1',
    fullName: 'Ahmad Hassan',
    email: 'ahmad.hassan@email.com',
    phone: '+962 79 123 4567',
    profileImage: 'ahmad_profile.jpg',
    role: 'landlord',
    location: {
      city: 'Amman',
      country: 'Jordan',
    },
    createdAt: '2023-01-01T00:00:00.000Z',
    properties: ['prop1', 'prop2', 'prop3'],
  },
  {
    id: 'user2',
    fullName: 'Sara Ahmed',
    email: 'sara.ahmed@email.com',
    phone: '+962 79 987 6543',
    profileImage: 'sara_profile.jpg',
    role: 'landlord',
    location: {
      city: 'Amman',
      country: 'Jordan',
    },
    createdAt: '2023-02-15T00:00:00.000Z',
    properties: ['prop4', 'prop5'],
  },
  {
    id: 'user3',
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+962 79 111 2222',
    profileImage: 'john_profile.jpg',
    role: 'renter',
    location: {
      city: 'Amman',
      country: 'Jordan',
    },
    createdAt: '2023-03-10T00:00:00.000Z',
    rentedProperties: ['prop2'],
  },
  {
    id: 'user4',
    fullName: 'Sarah Parker',
    email: 'sarah.parker@email.com',
    phone: '+962 79 333 4444',
    profileImage: 'sarah_parker_profile.jpg',
    role: 'renter',
    location: {
      city: 'Amman',
      country: 'Jordan',
    },
    createdAt: '2023-02-01T00:00:00.000Z',
    rentedProperties: [],
  },
  {
    id: 'user5',
    fullName: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    phone: '+962 79 555 6666',
    profileImage: 'mike_profile.jpg',
    role: 'renter',
    location: {
      city: 'Amman',
      country: 'Jordan',
    },
    createdAt: '2023-03-15T00:00:00.000Z',
    rentedProperties: [],
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg1',
    senderId: 'user3',
    receiverId: 'user1',
    content: 'Hi, I\'m interested in viewing the apartment next week.',
    timestamp: '2023-05-15T10:30:00.000Z',
    isRead: true,
    propertyId: 'prop1',
  },
  {
    id: 'msg2',
    senderId: 'user1',
    receiverId: 'user3',
    content: 'Sure! I can show you around on Monday at 2 PM.',
    timestamp: '2023-05-15T10:32:00.000Z',
    isRead: true,
    propertyId: 'prop1',
  },
  {
    id: 'msg3',
    senderId: 'user3',
    receiverId: 'user1',
    content: 'That works perfectly for me.',
    timestamp: '2023-05-15T10:33:00.000Z',
    isRead: true,
    propertyId: 'prop1',
  },
  {
    id: 'msg4',
    senderId: 'user4',
    receiverId: 'user1',
    content: 'Is the City View Condo still available?',
    timestamp: '2023-05-14T15:20:00.000Z',
    isRead: true,
    propertyId: 'prop2',
  },
  {
    id: 'msg5',
    senderId: 'user1',
    receiverId: 'user4',
    content: 'I\'m sorry, it was just rented yesterday.',
    timestamp: '2023-05-14T15:25:00.000Z',
    isRead: false,
    propertyId: 'prop2',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'trans1',
    propertyId: 'prop2',
    renterId: 'user3',
    landlordId: 'user1',
    amount: 1065,
    currency: 'JOD',
    type: 'rent',
    status: 'paid',
    dueDate: '2023-05-01T00:00:00.000Z',
    paidDate: '2023-04-29T00:00:00.000Z',
    description: 'May Rent',
  },
  {
    id: 'trans2',
    propertyId: 'prop1',
    renterId: 'user3',
    landlordId: 'user1',
    amount: 850,
    currency: 'JOD',
    type: 'rent',
    status: 'overdue',
    dueDate: '2023-05-15T00:00:00.000Z',
    description: 'May Rent',
  },
  {
    id: 'trans3',
    propertyId: 'prop3',
    renterId: 'user5',
    landlordId: 'user1',
    amount: 1770,
    currency: 'JOD',
    type: 'rent',
    status: 'pending',
    dueDate: '2023-05-10T00:00:00.000Z',
    description: 'May Rent',
  },
];

export const mockApplications: Application[] = [
  {
    id: 'app1',
    propertyId: 'prop1',
    renterId: 'user3',
    status: 'pending',
    createdAt: '2023-05-12T00:00:00.000Z',
    documents: {
      idCard: true,
      proofOfIncome: true,
      bankStatement: false,
    },
    progress: 70,
  },
  {
    id: 'app2',
    propertyId: 'prop3',
    renterId: 'user5',
    status: 'pending',
    createdAt: '2023-05-10T00:00:00.000Z',
    documents: {
      idCard: true,
      proofOfIncome: true,
      bankStatement: false,
    },
    progress: 50,
  },
  {
    id: 'app3',
    propertyId: 'prop4',
    renterId: 'user4',
    status: 'approved',
    createdAt: '2023-05-05T00:00:00.000Z',
    documents: {
      idCard: true,
      proofOfIncome: true,
      bankStatement: true,
    },
    progress: 100,
  },
];

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint1',
    propertyId: 'prop2',
    renterId: 'user3',
    title: 'AC Maintenance',
    description: 'The air conditioner is not cooling properly.',
    status: 'scheduled',
    createdAt: '2023-05-12T00:00:00.000Z',
    scheduledDate: '2023-05-18T10:00:00.000Z',
  },
  {
    id: 'maint2',
    propertyId: 'prop2',
    renterId: 'user3',
    title: 'Water Heater Issue',
    description: 'The water heater is not working at all.',
    status: 'pending',
    createdAt: '2023-05-15T00:00:00.000Z',
  },
];

export const mockRentalContracts: RentalContract[] = [
  {
    id: 'contract1',
    propertyId: 'prop2',
    renterId: 'user3',
    startDate: '2023-04-01T00:00:00.000Z',
    endDate: '2024-03-31T00:00:00.000Z',
    status: 'active',
    securityDeposit: 1065,
    createdAt: '2023-03-25T00:00:00.000Z',
    documents: {
      signed: true,
      url: 'contracts/contract1.pdf'
    }
  },
  {
    id: 'contract2',
    propertyId: 'prop1',
    renterId: 'user4',
    startDate: '2023-05-15T00:00:00.000Z',
    endDate: '2023-11-14T00:00:00.000Z',
    status: 'pending',
    securityDeposit: 850,
    createdAt: '2023-05-10T00:00:00.000Z',
    documents: {
      signed: false
    }
  },
  {
    id: 'contract3',
    propertyId: 'prop5',
    renterId: 'user3',
    startDate: '2022-10-01T00:00:00.000Z',
    endDate: '2023-04-01T00:00:00.000Z',
    status: 'expired',
    securityDeposit: 1800,
    createdAt: '2022-09-25T00:00:00.000Z',
    documents: {
      signed: true,
      url: 'contracts/contract3.pdf'
    }
  }
]; 