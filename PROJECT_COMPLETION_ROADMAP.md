# DarRent Project Completion Roadmap

This document outlines the remaining tasks necessary to complete the DarRent property rental application, based on analysis of the existing SQL functions, triggers, and application requirements.

## Table of Contents

1. [Database Schema Enhancements](#database-schema-enhancements)
2. [Backend API Enhancements](#backend-api-enhancements)
3. [Frontend Implementation](#frontend-implementation)
4. [Integration & Testing](#integration-testing)
5. [Deployment](#deployment)

## Database Schema Enhancements

### Add Missing Tables

1. **Property Videos Table**
   - Create a table to store property walkthrough videos (required by landlords)
   - Include fields for video URL, upload date, description, and type

2. **Property Viewing Requests Table**
   - Create a table to track in-person viewing requests after initial application acceptance
   - Include fields for renter_id, property_id, requested_dates, status, notes, etc.
   - Track history of scheduled viewings and outcomes

3. **Review Tables**
   - Create a `property_reviews` table for renters to review properties
   - Create a `renter_reviews` table for landlords to review renters
   - Include fields for rating, review text, date, and relationship to contract

4. **Comments Table for Contracts**
   - Create a table to store comments on contracts (for reporting property issues)
   - Include fields for user ID, contract ID, comment text, date, and optional media attachments

### Schema Modifications

1. **Rental Contracts Table**
   - Add an `auto_renewal` BOOLEAN column to track if contracts should auto-renew
   - Add a `comment_thread_id` column to link to the comments thread
   - Add `updated_at` TIMESTAMP column for tracking changes
   - Add `viewing_completed` BOOLEAN to track if property viewing occurred

2. **Properties Table**
   - Add a `requires_video` BOOLEAN column (default TRUE)
   - Add a `verified` BOOLEAN column to indicate properties with verified videos
   - Add columns for amenities (parking, furniture, appliances, etc.)
   - Add `viewing_availability` field to store landlord's preferred viewing times

3. **User Profiles**
   - Add columns for identity verification and review aggregates

## Backend API Enhancements

### New API Functions

1. **Property Video Management**
   ```sql
   -- Add video to property
   CREATE OR REPLACE FUNCTION add_property_video(p_property_id TEXT, p_video_url TEXT, p_description TEXT) RETURNS BOOLEAN;
   
   -- Verify property video (admin function)
   CREATE OR REPLACE FUNCTION verify_property_video(p_property_id TEXT, p_verified BOOLEAN) RETURNS BOOLEAN;
   
   -- Get property videos
   CREATE OR REPLACE FUNCTION get_property_videos(p_property_id TEXT) RETURNS TABLE (id TEXT, url TEXT, description TEXT, upload_date TIMESTAMP, verified BOOLEAN);
   ```

2. **Property Viewing Management**
   ```sql
   -- Request property viewing
   CREATE OR REPLACE FUNCTION request_property_viewing(p_renter_id TEXT, p_property_id TEXT, p_preferred_dates TEXT[], p_notes TEXT) RETURNS TEXT;
   
   -- Get viewing requests (for landlord)
   CREATE OR REPLACE FUNCTION get_property_viewing_requests(p_property_id TEXT) RETURNS TABLE (id TEXT, renter_id TEXT, renter_name TEXT, preferred_dates TEXT[], status TEXT, notes TEXT, created_at TIMESTAMP);
   
   -- Get viewing requests (for renter)
   CREATE OR REPLACE FUNCTION get_renter_viewing_requests(p_renter_id TEXT) RETURNS TABLE (id TEXT, property_id TEXT, property_title TEXT, preferred_dates TEXT[], status TEXT, landlord_notes TEXT, created_at TIMESTAMP);
   
   -- Update viewing request status
   CREATE OR REPLACE FUNCTION update_viewing_request(p_request_id TEXT, p_status TEXT, p_confirmed_date TIMESTAMP DEFAULT NULL, p_notes TEXT DEFAULT NULL) RETURNS BOOLEAN;
   ```

3. **Review Management**
   ```sql
   -- Add property review (by renter)
   CREATE OR REPLACE FUNCTION add_property_review(p_property_id TEXT, p_renter_id TEXT, p_rating INT, p_review_text TEXT) RETURNS TEXT;
   
   -- Add renter review (by landlord)
   CREATE OR REPLACE FUNCTION add_renter_review(p_renter_id TEXT, p_landlord_id TEXT, p_rating INT, p_review_text TEXT) RETURNS TEXT;
   
   -- Get property reviews
   CREATE OR REPLACE FUNCTION get_property_reviews(p_property_id TEXT) RETURNS TABLE (id TEXT, renter_id TEXT, renter_name TEXT, rating INT, review_text TEXT, review_date TIMESTAMP);
   
   -- Get renter reviews
   CREATE OR REPLACE FUNCTION get_renter_reviews(p_renter_id TEXT) RETURNS TABLE (id TEXT, landlord_id TEXT, landlord_name TEXT, rating INT, review_text TEXT, review_date TIMESTAMP);
   ```

4. **Contract Comments Management**
   ```sql
   -- Add comment to contract
   CREATE OR REPLACE FUNCTION add_contract_comment(p_contract_id TEXT, p_user_id TEXT, p_comment TEXT, p_image_url TEXT DEFAULT NULL) RETURNS TEXT;
   
   -- Get contract comments
   CREATE OR REPLACE FUNCTION get_contract_comments(p_contract_id TEXT) RETURNS TABLE (id TEXT, user_id TEXT, user_name TEXT, comment TEXT, image_url TEXT, created_at TIMESTAMP);
   
   -- Update contract comment
   CREATE OR REPLACE FUNCTION update_contract_comment(p_comment_id TEXT, p_comment TEXT) RETURNS BOOLEAN;
   
   -- Delete contract comment
   CREATE OR REPLACE FUNCTION delete_contract_comment(p_comment_id TEXT) RETURNS BOOLEAN;
   ```

### API Function Improvements

1. **Update Property Functions**
   - Modify `add_property()` to include video requirement
   - Add validation to ensure properties have videos before being published
   - Update `get_property_by_id()` to include video information
   - Add viewing availability parameters to property creation/update functions

2. **Contract Management Functions**
   - Modify `create_contract()` to initialize the comment thread
   - Update contract response to include comments and reviews
   - Add function to handle renter acceptance/rejection of contracts
   - Add checks for completed property viewings before contract finalization

3. **User Profile Functions**
   - Add functions to calculate and update user ratings based on reviews
   - Add verification status updates and checks

## Database Triggers Enhancement

### New Triggers

1. **Property Viewing Request Notification Trigger**
   - Send notifications when viewing requests are created or updated
   - Update application status when viewings are confirmed

2. **Contract Review Availability Trigger**
   - Enable reviews only after contract end date is reached
   - Automatically notify users when they can leave reviews

3. **Property Video Verification Trigger**
   - Automatically set property status to 'pending verification' when video is added
   - Prevent property from being rented until video is verified

4. **Contract Comment Notification Trigger**
   - Send notifications when new comments are added to a contract

### Modify Existing Triggers

1. **Update Property Status Trigger**
   - Check for video verification before changing status to 'available'

2. **Contract Auto-Renewal**
   - Consider renter and landlord ratings in the auto-renewal decision

## Frontend Implementation

### Authentication & User Management

1. **User Registration & Login**
   - Implement sign-up flows for both landlords and renters
   - Add profile completion and verification screens
   - Implement password reset and account management

2. **User Dashboard**
   - Create role-specific dashboards for landlords and renters
   - Display relevant metrics and recent activities
   - Add navigation to key features

### Property Management (Landlord)

1. **Property Listing**
   - Create property creation form with validation
   - Implement video upload functionality with progress indicator
   - Add property editing and management interface
   - Display property status and verification information
   - Add viewing availability schedule configuration

2. **Rent Requests Management**
   - Create interface to view and manage incoming requests
   - Add filtering and sorting options
   - Implement accept/reject workflows with notifications

3. **Property Viewing Management**
   - Create calendar interface for viewing requests
   - Implement accept/reschedule/reject workflows for viewing requests
   - Add confirmation and follow-up system
   - Include communication tools for coordinating with renters

4. **Contract Management**
   - Create contract creation interface
   - Add commenting functionality
   - Implement contract status tracking

5. **Renter Review System**
   - Add interface to review renters after contract completion
   - Show renter history and previous reviews

### Property Rental (Renter)

1. **Property Search**
   - Create search interface with filtering options
   - Implement map view for property locations
   - Add property detail view with video player
   - Implement saved properties functionality

2. **Rent Request Flow**
   - Create rent request form with document upload
   - Add status tracking for submitted requests
   - Implement notifications for status changes

3. **Property Viewing Request**
   - Create interface to request in-person property viewings
   - Implement calendar for selecting preferred dates/times
   - Add status tracking for viewing requests
   - Include messaging capability for coordinating with landlords

4. **Contract Review & Acceptance**
   - Create contract review interface
   - Implement accept/reject functionality
   - Add comment thread for issue reporting
   - Link contract to property viewing history

5. **Property Review System**
   - Add interface to review properties after contract completion
   - Show landlord history and property ratings

### Chat & Messaging

1. **Conversation Interface**
   - Create messaging UI for conversations
   - Implement real-time message delivery
   - Add support for property-specific conversations
   - Enable scheduling coordination for property viewings

2. **Notifications**
   - Create notification center
   - Implement push notifications for critical events
   - Add email notifications for important updates

### Payment System

1. **Payment Processing**
   - Implement secure payment interface
   - Add support for multiple payment methods
   - Create payment history and receipt generation

2. **Financial Dashboard**
   - Create financial summary views
   - Implement transaction history and filtering
   - Add export functionality for financial records

### Multilingual Support

1. **Language Selection**
   - Implement language toggle (English/Arabic)
   - Create language preference storage

2. **Content Translation**
   - Implement translation system for all interface elements
   - Add support for RTL layout in Arabic mode

## Integration & Testing

### API Integration

1. **Supabase Configuration**
   - Configure Supabase project with proper security settings
   - Set up database schema and functions
   - Implement Row Level Security (RLS) policies

2. **API Client**
   - Create API client with authentication
   - Implement error handling and retry logic
   - Add logging and monitoring

### Testing

1. **Unit Testing**
   - Create tests for API functions
   - Test database triggers and functions
   - Validate business logic implementation

2. **Integration Testing**
   - Test full workflows for both user types
   - Validate notification delivery
   - Test scheduled tasks and triggers

3. **Performance Testing**
   - Test application under load
   - Optimize database queries
   - Implement caching where appropriate

4. **Security Testing**
   - Conduct security audit
   - Test authentication and authorization flows
   - Validate data protection measures

## Deployment

1. **Environment Setup**
   - Configure production environment
   - Set up staging environment for testing
   - Implement CI/CD pipeline

2. **Monitoring & Logging**
   - Set up error tracking
   - Implement usage analytics
   - Create monitoring dashboards

3. **Backup & Recovery**
   - Configure database backup strategy
   - Implement disaster recovery plan
   - Test restore procedures

4. **Documentation**
   - Create admin documentation
   - Write user guides for landlords and renters
   - Document API for potential integrations

## Timeline & Milestones

1. **Phase 1: Schema & API Enhancement** (2 weeks)
   - Complete database schema updates
   - Implement missing API functions
   - Set up database triggers

2. **Phase 2: Core Frontend Implementation** (4 weeks)
   - Implement authentication and user management
   - Build property management features
   - Create property rental flows
   - Develop property viewing scheduling system

3. **Phase 3: Advanced Features** (3 weeks)
   - Implement messaging system
   - Build payment processing
   - Create review systems

4. **Phase 4: Testing & Optimization** (2 weeks)
   - Conduct thorough testing
   - Optimize performance
   - Fix identified issues

5. **Phase 5: Deployment & Launch** (1 week)
   - Deploy to production
   - Conduct final checks
   - Launch application 