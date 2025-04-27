# Supabase API Development Guide

## Overview
This document outlines the API development for the DarRent property rental application using Supabase. The API services will handle all backend operations with support for Arabic language.

## Prerequisites
- Supabase project set up by the database developer
- Basic understanding of TypeScript
- Knowledge of Arabic language requirements

## API Services Implementation

### 1. Authentication Service

```typescript
// services/authService.ts
import { createClient } from '@supabase/supabase-js';
import { User, UserRole } from '@/types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const authService = {
  // Login with email and password
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Register new user
  register: async (email: string, password: string, userData: Partial<User>) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
            role: userData.role,
          },
        },
      });

      if (authError) throw authError;

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user?.id,
          email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
        }]);

      if (profileError) throw profileError;

      return { success: true, user: authData.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) return { success: false, error: 'No user found' };

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return { success: true, user: profile };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update user profile
  updateProfile: async (userId: string, userData: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },
};
```

### 2. Property Service

```typescript
// services/propertyService.ts
import { createClient } from '@supabase/supabase-js';
import { Property } from '@/types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const propertyService = {
  // Create new property
  createProperty: async (propertyData: Partial<Property>) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, property: data };
    } catch (error) {
      console.error('Create property error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get property by ID
  getPropertyById: async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;

      return { success: true, property: data };
    } catch (error) {
      console.error('Get property error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get properties by owner
  getPropertiesByOwner: async (ownerId: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, properties: data };
    } catch (error) {
      console.error('Get properties by owner error:', error);
      return { success: false, error: error.message };
    }
  },

  // Search properties with Arabic support
  searchProperties: async (query: string, filters = {}) => {
    try {
      let supabaseQuery = supabase
        .from('properties')
        .select('*');

      // Add Arabic text search support
      if (query) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        );
        // For more advanced search using text search capabilities:
        // .or(`to_tsvector('arabic', title) @@ to_tsquery('arabic', '${query}')`)
      }

      // Apply filters
      if (filters.location_city) {
        supabaseQuery = supabaseQuery.eq('location_city', filters.location_city);
      }
      if (filters.minPrice) {
        supabaseQuery = supabaseQuery.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        supabaseQuery = supabaseQuery.lte('price', filters.maxPrice);
      }
      if (filters.bedrooms) {
        supabaseQuery = supabaseQuery.eq('bedrooms', filters.bedrooms);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      return { success: true, properties: data };
    } catch (error) {
      console.error('Search properties error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update property
  updateProperty: async (propertyId: string, propertyData: Partial<Property>) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, property: data };
    } catch (error) {
      console.error('Update property error:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete property
  deleteProperty: async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Delete property error:', error);
      return { success: false, error: error.message };
    }
  },
};
```

### 3. Application Service

```typescript
// services/applicationService.ts
import { createClient } from '@supabase/supabase-js';
import { Application } from '@/types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const applicationService = {
  // Create new application
  createApplication: async (applicationData: Partial<Application>) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, application: data };
    } catch (error) {
      console.error('Create application error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get application by ID
  getApplicationById: async (applicationId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (error) throw error;

      return { success: true, application: data };
    } catch (error) {
      console.error('Get application error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get applications by renter
  getApplicationsByRenter: async (renterId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          properties (
            id,
            title,
            price,
            currency,
            location_city,
            location_area
          )
        `)
        .eq('renter_id', renterId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, applications: data };
    } catch (error) {
      console.error('Get applications by renter error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get applications by property
  getApplicationsByProperty: async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          users (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, applications: data };
    } catch (error) {
      console.error('Get applications by property error:', error);
      return { success: false, error: error.message };
    }
  },

  // Update application status
  updateApplicationStatus: async (applicationId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, application: data };
    } catch (error) {
      console.error('Update application status error:', error);
      return { success: false, error: error.message };
    }
  },
};
```

### 4. Message Service

```typescript
// services/messageService.ts
import { createClient } from '@supabase/supabase-js';
import { Message } from '@/types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const messageService = {
  // Send message
  sendMessage: async (senderId: string, receiverId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: senderId,
          receiver_id: receiverId,
          content,
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, message: data };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get conversation
  getConversation: async (userId1: string, userId2: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            full_name,
            profile_image
          ),
          receiver:receiver_id (
            id,
            full_name,
            profile_image
          )
        `)
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { success: true, messages: data };
    } catch (error) {
      console.error('Get conversation error:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark messages as read
  markAsRead: async (messageIds: string[]) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Mark messages as read error:', error);
      return { success: false, error: error.message };
    }
  },

  // Subscribe to new messages
  subscribeToMessages: (userId: string, callback: (message: Message) => void) => {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  },
};
```

### 5. Storage Service

```typescript
// services/storageService.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const storageService = {
  // Upload profile image
  uploadProfileImage: async (userId: string, fileUri: string) => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const fileName = `${userId}/${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Upload profile image error:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload property images
  uploadPropertyImages: async (propertyId: string, fileUris: string[]) => {
    try {
      const urls = [];
      
      for (const fileUri of fileUris) {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        const fileName = `${propertyId}/${Date.now()}.jpg`;

        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        urls.push(publicUrl);
      }

      return { success: true, urls };
    } catch (error) {
      console.error('Upload property images error:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload application documents
  uploadApplicationDocuments: async (userId: string, fileUri: string, documentType: string) => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const fileName = `${userId}/${documentType}/${Date.now()}.pdf`;

      const { data, error } = await supabase.storage
        .from('application-documents')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('application-documents')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Upload application document error:', error);
      return { success: false, error: error.message };
    }
  },
};
```

## Testing Checklist

- [ ] Test authentication with Arabic characters
- [ ] Verify property search with Arabic text
- [ ] Test message sending with Arabic content
- [ ] Verify document uploads with Arabic filenames
- [ ] Test real-time updates with Arabic data
- [ ] Ensure proper error handling for Arabic input

## Deliverables

- [ ] Authentication service with Arabic support
- [ ] Property service with Arabic search
- [ ] Application service with Arabic document handling
- [ ] Message service with Arabic content support
- [ ] Storage service with Arabic filename support

## Timeline

- Day 1: Authentication and property services
- Day 2: Application and message services
- Day 3: Storage service and testing
- Day 4: Final testing and refinements 