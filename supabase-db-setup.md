ئ# Supabase Database Setup Guide

## Overview
This document outlines the database setup for the DarRent property rental application using Supabase. The setup includes tables, authentication, and security policies with support for Arabic language.

## Prerequisites
- Supabase account
- Basic understanding of SQL
- Knowledge of Arabic language requirements

## Database Setup

### 1. Create Tables with Arabic Support

```sql
-- Enable Arabic text search support
CREATE TEXT SEARCH CONFIGURATION arabic (COPY = simple);
ALTER TEXT SEARCH CONFIGURATION arabic ALTER MAPPING FOR word WITH arabic_stem;

-- Users table with Arabic support
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('landlord', 'renter')),
  profile_image VARCHAR(255),
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table with Arabic support
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'SAR',
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  area DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'rented')),
  location_area VARCHAR(100),
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  amenities TEXT[],
  images TEXT[],
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  days_listed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Arabic text search indexes
CREATE INDEX properties_title_search ON properties USING GIN (to_tsvector('arabic', title));
CREATE INDEX properties_description_search ON properties USING GIN (to_tsvector('arabic', description));

-- Applications table with Arabic support
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  renter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  documents JSONB,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table with Arabic support
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Arabic text search index for messages
CREATE INDEX messages_content_search ON messages USING GIN (to_tsvector('arabic', content));
```

### 2. Set Up Authentication

```sql
-- Enable Arabic in authentication
ALTER DATABASE your_database_name SET lc_collate = 'und-x-icu';
ALTER DATABASE your_database_name SET lc_ctype = 'und-x-icu';

-- Create auth.users table with Arabic support
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('landlord', 'renter')),
  profile_image VARCHAR(255),
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Implement Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can view properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Landlords can create properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id AND 
    (SELECT role FROM users WHERE id = auth.uid()) = 'landlord');

CREATE POLICY "Landlords can update their own properties" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Landlords can delete their own properties" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

-- Applications policies
CREATE POLICY "Landlords can view applications for their properties" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = applications.property_id 
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Renters can view their own applications" ON applications
  FOR SELECT USING (auth.uid() = renter_id);

CREATE POLICY "Renters can create applications" ON applications
  FOR INSERT WITH CHECK (
    auth.uid() = renter_id AND 
    (SELECT role FROM users WHERE id = auth.uid()) = 'renter'
  );

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

### 4. Create Functions and Triggers

```sql
-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 5. Set Up Storage

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile-images', 'profile-images', true),
  ('property-images', 'property-images', true),
  ('application-documents', 'application-documents', false);

-- Storage policies
CREATE POLICY "Profile images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

CREATE POLICY "Property images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Users can upload their own profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Landlords can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images' AND
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = (storage.foldername(name))[1]::uuid
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload their own application documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'application-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

## Testing Checklist

- [ ] Verify Arabic text storage and retrieval
- [ ] Test Arabic text search functionality
- [ ] Verify Arabic filenames in storage
- [ ] Test RLS policies with Arabic data
- [ ] Verify authentication with Arabic characters
- [ ] Test real-time subscriptions with Arabic content

## Deliverables

- [ ] Database with Arabic support
- [ ] Authentication system with Arabic support
- [ ] Storage buckets with Arabic filename support
- [ ] RLS policies for Arabic data
- [ ] Text search indexes for Arabic content

## Timeline

- Day 1: Database setup and Arabic configuration
- Day 2: Authentication and RLS implementation
- Day 3: Storage setup and testing
- Day 4: Final testing and refinements 