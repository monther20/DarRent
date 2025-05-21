# DarRent App - Required Database Triggers

This document outlines the database triggers that should be implemented in Supabase to enable automated workflows for the DarRent application.

## Overview

Triggers are database objects that automatically execute when specific events occur on tables. They're crucial for maintaining data integrity, enforcing business rules, and automating workflows without requiring explicit function calls from the application.

## Required Triggers

Based on the API functions defined in `06_api_functions.sql` and the requirements in `API_FUNCTIONS.md`, the following triggers should be implemented:

### 1. Auto-Accept Rent Request Trigger

**Purpose:** Automatically accept rent requests after a specified delay (e.g., 3 days) if the landlord hasn't responded.

**Implementation Requirements:**
- Create a scheduled job using pg_cron or similar
- Run daily to check for pending requests older than the specified delay
- Update status to 'accepted' for qualifying requests

### 2. Rent Payment Reminder Trigger

**Purpose:** Send automated payment reminders to renters before rent is due.

**Implementation Requirements:**
- Create a scheduled job using pg_cron
- Run daily to check for upcoming payments within the reminder window
- Generate notifications for renters with payments due

### 3. Property Status Update Trigger

**Purpose:** Automatically update property status when rental contracts change.

**Implementation Requirements:**
- Trigger on rental_contracts table INSERT/UPDATE
- When a contract becomes 'active', update property status to 'rented'
- When a contract is 'terminated' or 'expired', update property status to 'available'

### 4. Contract Expiration Notification Trigger

**Purpose:** Send notifications to both parties when a contract is nearing expiration.

**Implementation Requirements:**
- Create a scheduled job using pg_cron
- Run daily to check for contracts expiring within the notification window
- Generate notifications for landlords and renters

### 5. Maintenance Request Status History Trigger

**Purpose:** Maintain an audit trail of maintenance request status changes.

**Implementation Requirements:**
- Trigger on maintenance_requests table UPDATE
- When status changes, insert a record into maintenance_status_history

### 6. Transaction Status Change Trigger

**Purpose:** Update related records when a payment transaction status changes.

**Implementation Requirements:**
- Trigger on transactions table UPDATE
- When status changes to 'paid', update relevant contract/property records

### 7. Message Read Status Trigger

**Purpose:** Update unread message counts and notification status when messages are marked as read.

**Implementation Requirements:**
- Trigger on messages table UPDATE
- When is_read changes from FALSE to TRUE, update any related counters

### 8. Property Views Counter Trigger

**Purpose:** Increment the views counter when a property is viewed.

**Implementation Requirements:**
- Create a function to be called by the API when a property page is viewed
- Update the views count in the properties table

### 9. Days Listed Counter Update Trigger

**Purpose:** Automatically update the days_listed field in properties.

**Implementation Requirements:**
- Create a scheduled job using pg_cron
- Run daily to update days_listed for all available properties

### 10. Contract Auto-Renewal Trigger

**Purpose:** Automatically renew contracts that are set for auto-renewal.

**Implementation Requirements:**
- Create a scheduled job using pg_cron
- Run daily to check for expiring contracts with auto_renewal set to TRUE
- Extend these contracts by the specified duration

## Implementation Notes

For Supabase implementations, consider the following:

1. **Scheduled Triggers**: Supabase doesn't natively support scheduled triggers, so you'll need to use:
   - pg_cron extension if available in your Supabase instance
   - External scheduler (like a cloud function) that calls Supabase functions at specific intervals
   
2. **Notifications**: For triggers that send notifications:
   - Create entries in a notifications table
   - Use Supabase's realtime features to push these to the frontend
   - Consider integrating with external notification services for email/SMS

3. **Security**: All triggers will run with the security context of the database, bypassing RLS policies, so ensure they're properly secured.

4. **Monitoring**: Add logging to these triggers to help with debugging and monitoring of automated processes.

The accompanying SQL file provides implementation code for these triggers. 