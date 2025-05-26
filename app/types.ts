export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'landlord' | 'renter';
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: {
    city: string;
    area: string;
    address?: string;
    coordinates?: [number, number]; // [latitude, longitude]
    details?: string;
  };
  features: {
    size: number;
    bedrooms: number;
    bathrooms: number;
    furnished: boolean;
    amenities?: string[];
  };
  images: string[];
  videos?: string[];
  status: PropertyStatus;
  rules?: string[];
  createdAt: string;
  updatedAt: string;
  reviewStatus?: PropertyReviewStatus;
}

export type PropertyStatus = 'available' | 'unavailable' | 'rented' | 'pending_verification' | 'rejected';
export type RenterReviewStatus = 'unreviewed' | 'reviewed';
export type PropertyReviewStatus = 'unreviewed' | 'reviewed';

export interface Tenant {
  id: string;
  fullName: string;
  avatar: string;
  propertyId: string;
  propertyName: string;
  leaseStart: string;
  leaseEnd: string;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'former';
  reviewStatus: RenterReviewStatus;
}

export interface Application {
  id: string;
  applicantId: string;
  applicantName: string;
  propertyId: string;
  propertyName: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RentRequest {
  id: string;
  renterId: string;
  propertyId: string;
  requestDate: string;
  months: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  responseDate?: string;
  message?: string;
}

export interface Stats {
  activeLeases: number;
  expiringSoon: number;
  averageRating: number;
  occupancyRate?: number;
  vacantUnits?: number;
  totalIncome?: number;
}

export interface RenterReview {
  id: string;
  contractId: string;
  renterId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  overallRating: number;
  categoryRatings: Record<string, number>;
  reviewText: string;
  wouldRentAgain: boolean;
  images: string[];
  createdAt: string;
  response?: {
    text: string;
    createdAt: string;
  };
}

export interface TimeSlot {
  id: string;
  startTime: string; // ISO 8601 format
  endTime: string;   // ISO 8601 format
  isBooked: boolean;
}

export interface ViewingRequest {
  id: string;
  propertyId: string;
  renterId: string;
  landlordId: string;
  requestedDates: string[]; // Array of ISO 8601 date strings for initial request
  preferredTimeSlots: { date: string, timeSlotId: string }[]; // Specific date and slot chosen
  notes?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  requestDate: string; // ISO 8601 format
  responseDate?: string; // ISO 8601 format
  rejectionReason?: string;
  cancellationReason?: string;
}

export interface PropertyReview {
  id: string;
  contractId: string;
  propertyId: string;
  propertyName: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  overallRating: number;
  categoryRatings: Record<string, number>;
  reviewText: string;
  wouldRentAgain: boolean;
  images: string[];
  createdAt: string;
  response?: {
    text: string;
    createdAt: string;
  };
} 