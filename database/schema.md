# Maintenance Database Schema

## Overview

This document describes the database schema for the maintenance request system. The schema consists of tables that handle maintenance requests, workers, attachments, comments, and status history.

## Tables

### 1. maintenance_workers

Stores information about maintenance workers.

| Column Name  | Type      | Description                                  | Constraints                      |
| ------------ | --------- | -------------------------------------------- | -------------------------------- |
| id           | string    | Unique identifier for the maintenance worker | Primary Key                      |
| first_name   | string    | Worker's first name                          |                                  |
| last_name    | string    | Worker's last name                           |                                  |
| phone_number | string    | Worker's WhatsApp-enabled phone number       |                                  |
| email        | string    | Worker's email address                       |                                  |
| specialties  | string[]  | Array of maintenance specialties             |                                  |
| status       | string    | Current status of the worker                 | Enum: active, inactive, on_leave |
| created_at   | timestamp | When the worker was added to the system      |                                  |
| updated_at   | timestamp | When the worker's info was last updated      |                                  |

#### Indexes

- `phone_number` (btree)
- `status` (btree)

### 2. complex_maintenance_assignments

Maps maintenance workers to residential complexes.

| Column Name | Type      | Description                                    | Constraints |
| ----------- | --------- | ---------------------------------------------- | ----------- |
| id          | string    | Unique identifier for the assignment           | Primary Key |
| worker_id   | string    | ID of the maintenance worker                   | Foreign Key |
| complex_id  | string    | ID of the residential complex                  | Foreign Key |
| is_primary  | boolean   | Whether this is the primary worker for complex |             |
| assigned_at | timestamp | When the worker was assigned                   |             |
| updated_at  | timestamp | When the assignment was last updated           |             |

#### Indexes

- `worker_id` (btree)
- `complex_id` (btree)
- `(worker_id, complex_id)` (unique)

### 3. maintenance_requests

The main table for storing maintenance requests.

| Column Name         | Type      | Description                                    | Constraints                                      |
| ------------------- | --------- | ---------------------------------------------- | ------------------------------------------------ |
| id                  | string    | Unique identifier for the maintenance request  | Primary Key                                      |
| renter_id           | string    | ID of the renter who created the request       |                                                  |
| title               | string    | Title of the maintenance request               |                                                  |
| description         | string    | Detailed description of the maintenance issue  |                                                  |
| status              | string    | Current status of the maintenance request      | Enum: pending, in_progress, completed, cancelled |
| priority            | string    | Priority level of the maintenance request      | Enum: low, medium, high, emergency               |
| created_at          | timestamp | When the request was created                   |                                                  |
| updated_at          | timestamp | When the request was last updated              |                                                  |
| completed_at        | timestamp | When the request was completed (if applicable) | Nullable                                         |
| property_id         | string    | ID of the property where maintenance is needed |                                                  |
| location            | string    | Specific location within the property          |                                                  |
| assigned_worker_id  | string    | ID of the assigned maintenance worker          | Foreign Key                                      |
| whatsapp_message_id | string    | ID of the sent WhatsApp message                | Nullable                                         |
| whatsapp_status     | string    | Status of the WhatsApp message                 | Enum: pending, sent, delivered, read, failed     |

#### Indexes

- `renter_id` (btree)
- `status` (btree)
- `created_at` (btree)
- `assigned_worker_id` (btree)
- `whatsapp_status` (btree)

### 4. maintenance_attachments

Stores files and images related to maintenance requests.

| Column Name | Type      | Description                          | Constraints |
| ----------- | --------- | ------------------------------------ | ----------- |
| id          | string    | Unique identifier for the attachment | Primary Key |
| request_id  | string    | ID of the maintenance request        | Foreign Key |
| file_url    | string    | URL to the attached file             |             |
| file_type   | string    | Type of the attached file            |             |
| created_at  | timestamp | When the attachment was added        |             |

#### Indexes

- `request_id` (btree)

### 5. maintenance_comments

Tracks communication between users about maintenance requests.

| Column Name | Type      | Description                         | Constraints                               |
| ----------- | --------- | ----------------------------------- | ----------------------------------------- |
| id          | string    | Unique identifier for the comment   | Primary Key                               |
| request_id  | string    | ID of the maintenance request       | Foreign Key                               |
| user_id     | string    | ID of the user who made the comment |                                           |
| user_type   | string    | Type of user who made the comment   | Enum: renter, landlord, maintenance_staff |
| comment     | string    | The comment text                    |                                           |
| created_at  | timestamp | When the comment was created        |                                           |

#### Indexes

- `request_id` (btree)
- `user_id` (btree)

### 6. maintenance_status_history

Maintains an audit trail of status changes for maintenance requests.

| Column Name     | Type      | Description                             | Constraints |
| --------------- | --------- | --------------------------------------- | ----------- |
| id              | string    | Unique identifier for the status change | Primary Key |
| request_id      | string    | ID of the maintenance request           | Foreign Key |
| previous_status | string    | Previous status of the request          |             |
| new_status      | string    | New status of the request               |             |
| changed_by      | string    | ID of the user who changed the status   |             |
| changed_at      | timestamp | When the status was changed             |             |
| notes           | string    | Optional notes about the status change  | Nullable    |

#### Indexes

- `request_id` (btree)
- `changed_at` (btree)

## Relationships

The following relationships exist between the tables:

1. `maintenance_attachments` → `maintenance_requests` (many-to-one)

   - Each attachment belongs to one maintenance request
   - A maintenance request can have multiple attachments

2. `maintenance_comments` → `maintenance_requests` (many-to-one)

   - Each comment belongs to one maintenance request
   - A maintenance request can have multiple comments

3. `maintenance_status_history` → `maintenance_requests` (many-to-one)

   - Each status change record belongs to one maintenance request
   - A maintenance request can have multiple status change records

4. `complex_maintenance_assignments` → `maintenance_workers` (many-to-one)

   - Each assignment belongs to one maintenance worker
   - A maintenance worker can be assigned to multiple complexes

5. `maintenance_requests` → `maintenance_workers` (many-to-one)
   - Each request can be assigned to one maintenance worker
   - A maintenance worker can handle multiple requests

## Communication Flow

1. When a maintenance request is created:
   - System identifies the appropriate maintenance worker based on:
     - Complex assignment
     - Worker's specialties
     - Worker's current status
   - System sends WhatsApp message to the worker containing:
     - Request ID
     - Issue description
     - Priority level
     - Location details
     - Renter's contact information
   - System tracks message status and updates `whatsapp_status`

## Notes

- All timestamps are stored in UTC
- String IDs are UUID v4 format
- All foreign keys reference the `id` column of their respective parent tables
- WhatsApp integration requires proper API setup and message templates
- Phone numbers should be stored in E.164 format for WhatsApp integration
