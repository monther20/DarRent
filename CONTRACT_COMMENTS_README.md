# DarRent Contract Comments System

This document provides an overview of the contract comments system implementation for the DarRent property rental application.

## Overview

The contract comments system allows landlords and tenants to communicate about rental contracts, report issues, and document their resolution. Comments can be general discussions or marked as issues that require attention. Issues can be assigned priorities and categorized for better organization and reporting.

## Implementation Files

- **contract_comments_system.sql**: Core schema, API functions, and triggers
- **contract_comments_sample_data.sql**: Sample data for testing the system

## Database Schema

The system is built around the `contract_comments` table which includes:

- Basic comment information (ID, text, created/updated timestamps, etc.)
- Parent-child relationship for threaded comments
- Issue tracking fields (issue status, priority, category)
- Issue resolution tracking

Additional schema enhancements:
- The `rental_contracts` table is enhanced with a `comment_thread_id` reference
- Multiple indexes for performance optimization

## API Functions

### Core Functions

1. **add_contract_comment**: Add a comment or issue to a contract
```sql
SELECT add_contract_comment(
  'contract_id', 'user_id', 'Comment text in English', 'Comment text in Arabic',
  'image_url', 'parent_comment_id', is_issue, 'issue_priority', 'issue_category'
);
```

2. **get_contract_comments**: Get comments for a specific contract
```sql
SELECT * FROM get_contract_comments('contract_id', include_resolved := TRUE);
```

3. **update_contract_comment**: Update an existing comment
```sql
SELECT update_contract_comment('comment_id', 'user_id', 'Updated text');
```

4. **delete_contract_comment**: Delete a comment if no replies, or blank it out if it has replies
```sql
SELECT delete_contract_comment('comment_id', 'user_id');
```

### Issue Management

1. **mark_contract_issue_resolved**: Mark an issue as resolved with resolution text
```sql
SELECT mark_contract_issue_resolved('issue_comment_id', 'resolver_user_id', 'Resolution text');
```

2. **get_contract_issues_summary**: Get summary statistics of issues for a contract
```sql
SELECT * FROM get_contract_issues_summary('contract_id');
```

3. **get_contracts_with_issue_summary**: Get all contracts with issue count summaries
```sql
SELECT * FROM get_contracts_with_issue_summary(p_landlord_id := 'landlord_id');
```

## Triggers

The system includes several trigger functions:

1. **contract_comment_added_trigger**: Updates the contract's `updated_at` field when comments are added
2. **contract_issue_notification_trigger**: Sends notifications when issues are reported
3. **issue_resolution_trigger**: Ensures proper recording of issue resolution data

## Issue Priorities and Categories

### Priorities
- **urgent**: Requires immediate attention (e.g., water leaks, security issues)
- **high**: Should be resolved within 24-48 hours
- **normal**: Standard priority, should be resolved within a week
- **low**: Can be addressed during routine maintenance

### Suggested Categories
- **plumbing**: Issues with water systems, pipes, sinks, toilets
- **electrical**: Issues with lighting, outlets, electrical systems
- **hvac**: Heating, ventilation, air conditioning problems
- **security**: Door locks, windows, security systems
- **structural**: Issues with walls, ceilings, floors
- **appliances**: Problems with included appliances
- **water_damage**: Water leaks, flooding, moisture issues
- **pests**: Issues with insects, rodents, or other pests
- **noise**: Noise complaints or concerns
- **access**: Issues with gates, doors, entry systems
- **payment**: Rent payment discussions or issues
- **other**: Miscellaneous issues

## Integration with Notifications

The system automatically sends notifications to the relevant parties when:
- A new comment is added
- A new issue is reported (with priority-based notifications)
- An issue is resolved

## Frontend Considerations

When implementing the frontend UI for this system, consider the following:

1. **Comment Thread View**:
   - Hierarchical display showing parent-child relationships
   - Visual distinction between regular comments and issues
   - Color coding for different issue priorities

2. **Issue Dashboard**:
   - Filter options for open/resolved/all issues
   - Sorting by priority, date, or category
   - Summary statistics

3. **Issue Reporting Form**:
   - Easy selection of issue categories and priorities
   - Ability to upload images of the problem
   - Clear labeling to distinguish from regular comments

## Usage Examples

### Example: Tenant Reporting a Maintenance Issue

```sql
-- Tenant reports leaking sink
SELECT add_contract_comment(
  'contract123', 'tenant456', 
  'The kitchen sink is leaking. Water is collecting in the cabinet below.', 
  'حوض المطبخ يتسرب. المياه تتجمع في الخزانة أدناه.',
  'leak_image.jpg', NULL, TRUE, 'high', 'plumbing'
);

-- Landlord responds to the issue
SELECT add_contract_comment(
  'contract123', 'landlord789',
  'I will send a plumber tomorrow morning.',
  'سأرسل سباكًا صباح غد.',
  NULL, 'comment_id_from_above', FALSE, NULL, NULL
);

-- Landlord marks issue as resolved
SELECT mark_contract_issue_resolved(
  'comment_id_from_above', 'landlord789',
  'The plumber has fixed the leaking pipe. Please let me know if there are any further issues.',
  'قام السباك بإصلاح الأنبوب المتسرب. يرجى إعلامي إذا كانت هناك أي مشاكل أخرى.'
);
```

## Security Considerations

All API functions include security checks to ensure that:
- Only the landlord and tenant associated with the contract can comment
- Only the comment owner can update or delete their own comments
- Proper permissions are enforced for all operations

## Performance Considerations

- Indexes are created on frequently searched fields
- The `get_contract_comments` function includes pagination parameters
- Issue resolution status is tracked to allow filtering out resolved issues 