# Supabase Database Setup Steps

## Overview

This document outlines the step-by-step process for setting up the DarRent property rental application database using Supabase, with support for Arabic language.

## Prerequisites

- Supabase account
- Basic understanding of SQL
- Knowledge of Arabic language requirements

## Implementation Steps

### 1. Database Configuration

1. Create a new Supabase project
2. Configure database settings for Arabic support
3. Set up proper collation and character encoding

### 2. Table Creation

1. Create users table with:

   - Basic user information fields
   - Role-based access control
   - Arabic text support
   - Timestamps

2. Create properties table with:

   - Property details fields
   - Owner reference
   - Arabic text support
   - Search indexes
   - Timestamps

3. Create applications table with:

   - Property and renter references
   - Status tracking
   - Document storage
   - Timestamps

4. Create messages table with:
   - Sender and receiver references
   - Message content
   - Read status
   - Arabic text support
   - Timestamps

### 3. Security Setup

1. Enable Row Level Security (RLS)
2. Create policies for:
   - User data access
   - Property management
   - Application handling
   - Message access

### 4. Storage Configuration

1. Create storage buckets for:
   - Profile images
   - Property images
   - Application documents
2. Set up access policies for each bucket
3. Configure public/private access

### 5. Functions and Triggers

1. Create timestamp update function
2. Set up triggers for:
   - User updates
   - Property updates
   - Application updates

## Testing Steps

1. Verify Arabic text storage
2. Test Arabic text search
3. Validate RLS policies
4. Test file uploads
5. Verify real-time functionality

## Deliverables

- [ ] Configured database with Arabic support
- [ ] All required tables created
- [ ] Security policies implemented
- [ ] Storage buckets configured
- [ ] Functions and triggers set up

## Timeline

- Day 1: Database configuration and table creation
- Day 2: Security setup and storage configuration
- Day 3: Functions and triggers implementation
- Day 4: Testing and refinements
