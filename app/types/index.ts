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
  price: number;
  image: string;
  status: 'active' | 'inactive';
  tenantId?: string;
}

export interface Transaction {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  date: string;
  type: 'rent' | 'deposit' | 'maintenance';
  status: 'completed' | 'pending' | 'overdue';
}

export interface Application {
  id: string;
  applicantName: string;
  propertyId: string;
  propertyName: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Stats {
  activeLeases: number;
  expiringSoon: number;
  averageRating: number;
} 