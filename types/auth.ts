import { User, Session, AuthError } from '@supabase/supabase-js';

// Extended user type that includes profile information
export interface ExtendedUser extends User {
    role?: 'landlord' | 'renter' | 'unknown';
    full_name?: string;
    phone?: string;
    profile_picture?: string;
    roleData?: any; // Contains landlord or renter specific data
}

// User profile from database
export interface UserProfile {
    id: string;
    full_name?: string;
    phone?: string;
    role?: 'landlord' | 'renter' | 'unknown';
    email?: string;
    created_at?: string;
    profile_picture?: string;
}

// Authentication context type
export interface AuthContextType {
    user: ExtendedUser | null;
    session: Session | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string, metadata: any) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<{ error: AuthError | null }>;
    refreshSession: () => Promise<void>;
}

// Auth service response types
export interface AuthResponse<T = any> {
    data: T | null;
    error: AuthError | Error | null;
}

// Sign up metadata
export interface SignUpMetadata {
    full_name: string;
    role: 'landlord' | 'renter';
    phone?: string;
    fullNameAr?: string;
    // Landlord specific fields
    companyName?: string;
    licenseNumber?: string;
    bankAccountDetails?: string;
    propertyAddress?: string;
    // Renter specific fields
    preferredLocationEn?: string;
    preferredLocationAr?: string;
    budget?: number;
    desiredMoveInDate?: string;
}

// Profile update data
export interface ProfileUpdateData {
    full_name?: string;
    phone?: string;
    profile_picture?: string;
    role?: 'landlord' | 'renter';
} 