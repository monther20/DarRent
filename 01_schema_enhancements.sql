-- DarRent - Database Schema Enhancements
-- This file contains the schema enhancements needed for the DarRent application

-- ==========================================
-- New Tables
-- ==========================================

-- Property Videos Table
CREATE TABLE IF NOT EXISTS property_videos (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description_en TEXT,
  description_ar TEXT,
  upload_date TIMESTAMP DEFAULT NOW(),
  is_main_video BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  verified_by TEXT REFERENCES users(id),
  video_duration INTEGER -- in seconds
);

-- Property Viewing Requests Table
CREATE TABLE IF NOT EXISTS property_viewing_requests (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  renter_id TEXT REFERENCES renters(id) ON DELETE CASCADE,
  requested_dates TEXT[], -- Array of ISO date strings for preferred dates
  confirmed_date TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'
  renter_notes TEXT,
  landlord_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Property Reviews Table
CREATE TABLE IF NOT EXISTS property_reviews (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  renter_id TEXT REFERENCES renters(id) ON DELETE SET NULL,
  contract_id TEXT REFERENCES rental_contracts(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text_en TEXT,
  review_text_ar TEXT,
  review_date TIMESTAMP DEFAULT NOW(),
  visible BOOLEAN DEFAULT TRUE
);

-- Renter Reviews Table
CREATE TABLE IF NOT EXISTS renter_reviews (
  id TEXT PRIMARY KEY,
  renter_id TEXT REFERENCES renters(id) ON DELETE CASCADE,
  landlord_id TEXT REFERENCES landlords(id) ON DELETE SET NULL,
  contract_id TEXT REFERENCES rental_contracts(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text_en TEXT,
  review_text_ar TEXT,
  review_date TIMESTAMP DEFAULT NOW(),
  visible BOOLEAN DEFAULT TRUE
);

-- Contract Comments Table
CREATE TABLE IF NOT EXISTS contract_comments (
  id TEXT PRIMARY KEY,
  contract_id TEXT REFERENCES rental_contracts(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  comment_text_en TEXT,
  comment_text_ar TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  parent_comment_id TEXT REFERENCES contract_comments(id) ON DELETE SET NULL -- for threaded comments
);

-- ==========================================
-- Table Modifications
-- ==========================================

-- Modify Rental Contracts Table
ALTER TABLE rental_contracts
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS comment_thread_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS viewing_completed BOOLEAN DEFAULT FALSE;

-- Modify Properties Table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS requires_video BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS viewing_availability JSONB, -- Stores landlord's preferred viewing times
ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_furnished BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS amenities JSONB; -- Stores other amenities as JSON

-- Modify Users Table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_document_url TEXT,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- ==========================================
-- Indexes
-- ==========================================

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_videos_property_id ON property_videos(property_id);
CREATE INDEX IF NOT EXISTS idx_property_viewing_requests_property_id ON property_viewing_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_property_viewing_requests_renter_id ON property_viewing_requests(renter_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_property_id ON property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_renter_id ON property_reviews(renter_id);
CREATE INDEX IF NOT EXISTS idx_renter_reviews_renter_id ON renter_reviews(renter_id);
CREATE INDEX IF NOT EXISTS idx_contract_comments_contract_id ON contract_comments(contract_id); 