# Supabase Database Population Guide

This guide walks you through the process of populating your Supabase database with realistic data that simulates 2 years of app usage.

## Overview

The population includes:

- 20 users (4 landlords, 16 renters)
- Properties with images
- Rental contracts with PDF documents
- Messages in the realtime database
- Maintenance requests with status history
- Payments and transactions
- Applications and evaluations

## Step 1: Set Up Storage Buckets

1. Open your Supabase dashboard
2. Go to Storage
3. Create the following buckets:
   - `property-images`
   - `profile-pictures`
   - `contracts`
   - `maintenance-attachments`
   - `verification-documents`

For each bucket, set appropriate permissions:

- `property-images`: Public read, authenticated write
- `profile-pictures`: Public read, authenticated write
- Others: Authenticated read/write

## Step 2: Run the Database Population Scripts

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents from the following files and execute them in order:
   - `01_users_data.sql` - Creates users, landlords, and renters
   - `02_properties_data.sql` - Creates properties and property images
   - `03_contracts_data.sql` - Creates rental contracts and payments
   - `04_interactions_data.sql` - Creates messages, applications, evaluations
   - `05_maintenance_data.sql` - Creates maintenance requests and history

## Step 3: Upload Sample Files to Storage

After running the SQL scripts, you need to upload sample files that match the references in the database:

1. For property images:

   - Download sample real estate images
   - Upload them to the `property-images` bucket with the same file paths mentioned in the SQL

2. For rental contracts:

   - Create sample PDF contracts or use templates
   - Upload them to the `contracts` bucket

3. For maintenance attachments:
   - Gather sample images of maintenance issues
   - Upload them to the `maintenance-attachments` bucket

## Step 4: Set Up Supabase Edge Functions (Optional)

For more realistic data handling, you might want to create Edge Functions for:

- Payment processing
- Notification sending
- Message handling

## Step 5: Verify the Data Population

1. Check the record counts of each table
2. Verify foreign key relationships
3. Test API endpoints with the populated data
4. Ensure all storage files are accessible

Refer to the accompanying SQL files for the actual data population scripts.
