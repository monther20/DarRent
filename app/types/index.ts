export interface Tenant {
  id: string;
  fullName: string;
  avatar: string;
  propertyId: string;
  propertyName: string;
  leaseStart: string;
  leaseEnd: string;
  status: 'active' | 'pending' | 'past';
  rating: number;
}

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

export interface Application {
  id: string;
  applicantName: string;
  propertyId: string;
  propertyName: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected';
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
  properties?: string[];
  rentedProperties?: string[];
  renters?: string[];
}

export interface Stats {
  activeLeases: number;
  expiringSoon: number;
  averageRating: number;
} 