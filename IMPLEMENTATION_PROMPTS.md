# DarRent Implementation Prompts

This document contains specific prompts you can use to request implementation of various features in the DarRent application, along with the important files to include in context for each implementation.

## Database Schema & API Implementation

### 1. Property Videos Implementation
**Prompt:** "Implement the database schema, triggers, and API functions for the property video management system."

**Important Context Files:**
- PROJECT_COMPLETION_ROADMAP.md
- Any existing SQL schema files
- Any existing database trigger files

### 2. Property Viewing Requests System
**Prompt:** "Implement the database schema, triggers, and API functions for the property viewing request system."

**Important Context Files:**
- PROJECT_COMPLETION_ROADMAP.md
- FRONTEND_IMPLEMENTATION_PROMPTS.md (Property Viewing Management section)
- Any existing SQL schema files
- Any existing database function files

### 3. Review System Implementation
**Prompt:** "Implement the database schema, triggers, and API functions for the property and renter review systems."

**Important Context Files:**
- PROJECT_COMPLETION_ROADMAP.md
- FRONTEND_IMPLEMENTATION_PROMPTS.md (Renter Review System and Property Review System sections)
- Any existing SQL schema files

### 4. Contract Comments System
**Prompt:** "Implement the database schema, triggers, and API functions for the contract comments system."

**Important Context Files:**
- PROJECT_COMPLETION_ROADMAP.md
- Any existing contract-related SQL files
- Any existing notification system files

### 5. Database Triggers Implementation
**Prompt:** "Implement the required database triggers for property viewing requests, reviews, and contract management."

**Important Context Files:**
- PROJECT_COMPLETION_ROADMAP.md
- Any existing SQL trigger files
- REQUIRED_TRIGGERS.md (if it exists)
- 07_database_triggers.sql (if it exists)

## Frontend Implementation

### 1. Property Viewing Calendar (Landlord)
**Prompt:** "Implement the property viewing calendar interface for landlords to manage viewing requests."

**Important Context Files:**
- FRONTEND_IMPLEMENTATION_PROMPTS.md (Property Viewing Management section)
- PROJECT_COMPLETION_ROADMAP.md
- app/(landlord-tabs)/properties.tsx
- app/property/[id].tsx
- Any existing calendar components

### 2. Property Viewing Request Form (Renter)
**Prompt:** "Implement the property viewing request form for renters to schedule property viewings."

**Important Context Files:**
- FRONTEND_IMPLEMENTATION_PROMPTS.md (Property Viewing Request section)
- PROJECT_COMPLETION_ROADMAP.md
- app/property/[id].tsx
- app/(renter-tabs)/search.tsx
- Any existing form components

### 3. Renter Review System Enhancement
**Prompt:** "Implement the enhanced renter review system for landlords."

**Important Context Files:**
- FRONTEND_IMPLEMENTATION_PROMPTS.md (Renter Review System section)
- PROJECT_COMPLETION_ROADMAP.md
- app/(landlord-tabs)/renters.tsx
- Any existing review components

### 4. Property Review System Enhancement
**Prompt:** "Implement the comprehensive property review system for renters."

**Important Context Files:**
- FRONTEND_IMPLEMENTATION_PROMPTS.md (Property Review System section)
- PROJECT_COMPLETION_ROADMAP.md
- app/property/[id].tsx
- Any existing review components

### 5. Enhanced Notification System
**Prompt:** "Implement the enhanced notification system with notification center, push notifications, email, and SMS capabilities."

**Important Context Files:**
- FRONTEND_IMPLEMENTATION_PROMPTS.md (Notifications section)
- PROJECT_COMPLETION_ROADMAP.md
- app/components/NotificationContainer.tsx
- app/components/NotificationToast.tsx
- Any existing notification service files

### 6. Property Video Upload and Verification
**Prompt:** "Implement the property video upload and verification system for landlords."

**Important Context Files:**
- PROJECT_COMPLETION_ROADMAP.md
- app/(landlord-tabs)/add-property.tsx
- app/(landlord-tabs)/properties.tsx
- Any existing file upload components

### 7. Viewing Preparation and Feedback (Renter)
**Prompt:** "Implement the property viewing preparation checklist and post-viewing feedback mechanism for renters."

**Important Context Files:**
- FRONTEND_IMPLEMENTATION_PROMPTS.md (Property Viewing Request section)
- PROJECT_COMPLETION_ROADMAP.md
- Any existing viewing request components

## Integration & Testing

### 1. API Integration Configuration
**Prompt:** "Set up Supabase configuration with proper security settings, RLS policies, and API client integration."

**Important Context Files:**
- PROJECT_COMPLETION_ROADMAP.md
- Any existing Supabase configuration files
- Any existing API client files

### 2. Testing Implementation
**Prompt:** "Implement unit tests, integration tests, and security tests for the application."

**Important Context Files:**
- PROJECT_COMPLETION_ROADMAP.md
- Any existing test files
- Key component files for testing

## Deployment

### 1. CI/CD Pipeline Setup
**Prompt:** "Set up a CI/CD pipeline for the application with staging and production environments."

**Important Context Files:**
- PROJECT_COMPLETION_ROADMAP.md
- Any existing deployment configuration files
- Any existing GitHub Actions or workflow files

### 2. Monitoring & Logging Implementation
**Prompt:** "Implement monitoring, logging, and error tracking for the application."

**Important Context Files:**
- PROJECT_COMPLETION_ROADMAP.md
- Any existing monitoring or logging configuration files 