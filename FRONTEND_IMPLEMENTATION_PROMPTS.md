# DarRent Frontend Implementation Prompts

This document contains prompts for implementing the frontend components of the DarRent application. The prompts are organized by feature area and indicate which components are already implemented and which still need development.

## Authentication & User Management

### User Registration & Login (✅ IMPLEMENTED)
**Existing implementation:**
- `app/auth/welcome.tsx`: Welcome screen
- `app/auth/select-role.tsx`: Role selection screen
- `app/auth/register.tsx`: Registration form
- `app/auth/login.tsx`: Login screen
- `app/auth/forgot-password.tsx`: Password recovery
- `app/auth/reset-password.tsx`: Password reset implementation

**Next steps:** Enhance form validation, improve loading states, and refine UI responsiveness.

### User Dashboard (✅ IMPLEMENTED)
**Existing implementation:**
- `app/(landlord-tabs)/index.tsx`: Landlord dashboard
- `app/(renter-tabs)/index.tsx`: Renter dashboard
- `app/_layout.tsx`: Main navigation routing

**Next steps:** Further expand metrics, add more interactive elements, and enhance performance analytics.

## Property Management (Landlord)

### Property Listing (✅ IMPLEMENTED)
**Existing implementation:**
- `app/(landlord-tabs)/properties.tsx`: Property list view
- `app/(landlord-tabs)/add-property.tsx`: Property creation form
- `app/property/[id].tsx`: Property detail view

**Next steps:** Enhance property verification display and add more property metrics tracking.

### Rent Requests Management (✅ IMPLEMENTED)
**Existing implementation:**
- `app/applications.tsx`: Application overview
- `app/(landlord-tabs)/rent-requests/[id].tsx`: Detailed request view

**Next steps:** Add more filtering options and improve document preview.

### Property Viewing Management (⚠️ PARTIAL)
**Existing implementation:**
- Basic viewing scheduling in property forms

**Future implementation prompt:**
```
Enhance the property viewing scheduling system with:
1. A dedicated calendar interface showing:
   - Requested viewing dates/times from potential renters
   - Confirmed viewings with renter details
   - Available and blocked time slots with color-coding
2. Implement a viewing request workflow:
   - Accept/reschedule/reject buttons with confirmation dialogs
   - Alternative date suggestion mechanism
   - Integration with existing notification system
3. Create a viewing details screen with:
   - Property information with thumbnail
   - Renter profile summary
   - Access instructions and notes field
4. Add a post-viewing follow-up system:
   - Mark viewings as completed with timestamps
   - Add follow-up prompts and templates
   - Link completed viewings to contract system

Build on existing components and ensure RTL support is maintained.
```

### Contract Management (✅ IMPLEMENTED)
**Existing implementation:**
- `app/contracts/create.tsx`: Contract creation
- `app/contracts/index.tsx`: Contract listing
- `app/contracts/[id].tsx`: Contract detail view

**Next steps:** Enhance the comment thread implementation for better issue tracking.

### Renter Review System (⚠️ PARTIAL)
**Existing implementation:**
- Basic rating UI in `app/(landlord-tabs)/renters.tsx`

**Future implementation prompt:**
```
Expand the renter review system to include:
1. A comprehensive review form with:
   - More detailed category-based ratings
   - Photo upload option for property condition evidence
   - Pre-filled contract information from database
   - Review policy display and guidelines
2. Create a reviewable renters dashboard that shows:
   - Renters with completed contracts eligible for review
   - Time-remaining indicators for review submission window
   - Filter options for reviewed/unreviewed renters
   - Quick access to pending reviews
3. Enhance the renter profile view to include:
   - Review history from all landlords
   - Aggregate ratings with visual indicators
   - Response mechanism for landlord feedback

Integrate with the existing user profile and notification systems.
```

## Property Rental (Renter)

### Property Search (✅ IMPLEMENTED)
**Existing implementation:**
- `app/(renter-tabs)/search.tsx`: Search interface
- `app/components/search/`: Search components
- `app/property/[id].tsx`: Property detail view

**Next steps:** Enhance map view and implement saved search functionality.

### Rent Request Flow (✅ IMPLEMENTED)
**Existing implementation:**
- `app/property/rent-request/[id].tsx`: Request submission
- `app/property/rent-request/success.tsx`: Success confirmation
- `app/rental-requests/`: Request management

**Next steps:** Improve document upload experience and validation.

### Property Viewing Request (⚠️ PARTIAL)
**Existing implementation:**
- Basic request functionality in property screens

**Future implementation prompt:**
```
Create a dedicated property viewing request system with:
1. An enhanced viewing request form that includes:
   - Interactive calendar for selecting multiple preferred dates/times
   - Special requests text field with character count
   - Accessibility requirements selection
   - Contact preference options
2. Expand the viewing request tracking to include:
   - Visual status indicators with timeline
   - Integration with device calendars
   - Rescheduling interface with intuitive controls
   - Cancellation workflow with reason selection
3. Add a viewing preparation section with:
   - Pre-generated questions based on property features
   - Checklist of items to verify during viewing
   - Interactive map with directions
   - Weather forecast integration
4. Implement a post-viewing feedback mechanism:
   - Quick impression rating system
   - Interest level indication
   - Next steps guidance based on selected interest

Build on existing notification system and ensure consistent design with other components.
```

### Contract Review & Acceptance (✅ IMPLEMENTED)
**Existing implementation:**
- `app/(renter-tabs)/ContractReview.tsx`: Contract review interface
- `app/(renter-tabs)/ContractSignature.tsx`: Contract signing process

**Next steps:** Add more educational elements for first-time renters.

### Property Review System (⚠️ PARTIAL)
**Existing implementation:**
- Basic review UI in property screens

**Future implementation prompt:**
```
Develop a comprehensive property review system with:
1. A detailed review submission form featuring:
   - Overall star rating with animated feedback
   - Category-specific ratings (cleanliness, accuracy, etc.)
   - Photo upload carousel for property condition documentation
   - Landlord communication rating
   - "Would rent again" toggle with explanation field
2. Create a review eligibility tracking system:
   - Notification triggers when contract end activates review period
   - Countdown timer for review submission window
   - Contract history integration showing reviewable properties
   - One-click access from notifications to review form
3. Add review management capabilities:
   - Edit functionality within specified time window
   - Visibility controls for published/unpublished reviews
   - Landlord response display with notification system
   - Community voting on helpful reviews
4. Implement community guidelines section:
   - Illustrated examples of constructive vs. inappropriate reviews
   - Interactive guide to writing balanced feedback
   - Reporting system for problematic landlord responses

Ensure integration with existing notification system and maintain multilingual support.
```

## Chat & Messaging

### Conversation Interface (✅ IMPLEMENTED)
**Existing implementation:**
- `app/chat/[id].tsx`: Messaging interface

**Next steps:** Add typing indicators and read receipts.

### Notifications (⚠️ PARTIAL)
**Existing implementation:**
- `app/components/NotificationContainer.tsx`
- `app/components/NotificationToast.tsx`

**Future implementation prompt:**
```
Enhance the notification system to include:
1. A comprehensive notification center with:
   - Category-based tabs for different notification types
   - Batch actions for marking multiple as read
   - Priority indicators for important notifications
   - Deep linking to relevant app sections
2. Implement push notification management:
   - Permission request flow with clear opt-in benefits
   - Granular category control in settings
   - Silent vs. alert notification preferences
   - Scheduled quiet hours based on user timezone
3. Create an email notification system:
   - HTML email templates with consistent branding
   - Notification bundling options to reduce email volume
   - Frequency controls (immediate, digest options)
   - One-click action buttons in emails
4. Add SMS notification capabilities for critical alerts:
   - Opt-in/opt-out management in settings
   - Character-optimized templates for SMS
   - International phone formatting support
   - Fallback mechanism when push is unavailable

Integrate with the existing notification components and ensure all notifications are properly localized.
```

## Payment System

### Payment Processing (✅ IMPLEMENTED)
**Existing implementation:**
- `app/payment-details.tsx`: Payment form
- `app/payment-confirmation.tsx`: Payment confirmation
- `app/(renter-tabs)/payments.tsx`: Payment management

**Next steps:** Enhance security indicators and add more payment method options.

### Financial Dashboard (✅ IMPLEMENTED)
**Existing implementation:**
- `app/(landlord-tabs)/financial.tsx`: Financial overview

**Next steps:** Add more visualization options and export capabilities.

## Multilingual Support

### Language Selection (✅ IMPLEMENTED)
**Existing implementation:**
- `app/i18n/i18n.ts`: i18n configuration
- `app/i18n/locales/`: Language files (en, ar)
- `contexts/LanguageContext.tsx`: Language management

**Next steps:** Enhance cultural adaptations and accessibility features.

### Content Translation (✅ IMPLEMENTED)
**Existing implementation:**
- Translation keys throughout the application
- RTL support in layouts and components

**Next steps:** Implement missing translation highlighting for easier management.

## Additional Implementation Areas

### Profile Management (✅ IMPLEMENTED)
**Existing implementation:**
- `app/(landlord-tabs)/profile.tsx`: Landlord profile
- `app/(renter-tabs)/profile.tsx`: Renter profile

### Settings (✅ IMPLEMENTED)
**Existing implementation:**
- `app/(landlord-tabs)/settings.tsx`: Landlord settings
- `app/(renter-tabs)/settings.tsx`: Renter settings

### Help & Support (✅ IMPLEMENTED)
**Existing implementation:**
- `app/help.tsx`: Help and support interface

### Terms & Conditions (✅ IMPLEMENTED)
**Existing implementation:**
- `app/terms.tsx`: Terms and conditions display 