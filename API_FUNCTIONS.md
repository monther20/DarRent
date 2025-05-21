# DarRent App - API Functions Documentation

This document outlines all the API functions required by each screen in the DarRent application in tabular format.

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Property Management](#property-management)
- [Rental Requests](#rental-requests)
- [Contracts](#contracts)
- [Payments](#payments)
- [Maintenance](#maintenance)
- [Chat](#chat)
- [Dashboard](#dashboard)
- [Settings](#settings)
- [Trigger Functions](#trigger-functions)

## Authentication

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| login | email: string, password: string | Promise\<User\> | Authenticates a user and returns user data |
| register | userData: { fullName: string, email: string, phone: string, password: string, role: 'landlord' \| 'renter', location: { city: string, country: string } } | Promise\<User\> | Registers a new user |
| resetPassword | email: string | Promise\<boolean\> | Sends a password reset email |
| verifyResetToken | token: string | Promise\<boolean\> | Verifies a password reset token |
| setNewPassword | token: string, newPassword: string | Promise\<boolean\> | Sets a new password after reset |

## User Management

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| getUserProfile | userId: string | Promise\<User\> | Gets a user's profile |
| updateUserProfile | userId: string, updates: Partial\<User\> | Promise\<User\> | Updates a user's profile |
| changePassword | userId: string, currentPassword: string, newPassword: string | Promise\<boolean\> | Changes a user's password |

## Property Management

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| getProperties | filters?: { location?: string, minPrice?: number, maxPrice?: number, bedrooms?: number, bathrooms?: number, status?: 'available' \| 'rented' \| 'pending' } | Promise\<Property[]\> | Gets properties with optional filters |
| getPropertyById | propertyId: string | Promise\<Property\> | Gets a property by ID |
| getLandlordProperties | landlordId: string | Promise\<Property[]\> | Gets properties owned by a landlord |
| getRenterProperties | renterId: string | Promise\<Property[]\> | Gets properties rented by a renter |
| addProperty | propertyData: Omit\<Property, 'id' \| 'createdAt' \| 'updatedAt'\> | Promise\<Property\> | Adds a new property |
| updateProperty | propertyId: string, updates: Partial\<Property\> | Promise\<Property\> | Updates a property |
| deleteProperty | propertyId: string | Promise\<boolean\> | Deletes a property |
| saveProperty | renterId: string, propertyId: string | Promise\<boolean\> | Saves a property to a renter's favorites |
| unsaveProperty | renterId: string, propertyId: string | Promise\<boolean\> | Removes a property from a renter's favorites |
| getSavedProperties | renterId: string | Promise\<Property[]\> | Gets a renter's saved properties |

## Rental Requests

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| getRentRequests | filters?: { propertyId?: string, renterId?: string, landlordId?: string, status?: 'pending' \| 'accepted' \| 'rejected' } | Promise\<RentRequest[]\> | Gets rent requests with optional filters |
| getRentRequestById | requestId: string | Promise\<RentRequest\> | Gets a rent request by ID |
| sendRentRequest | requestData: Omit\<RentRequest, 'id' \| 'requestDate' \| 'status' \| 'responseDate'\> | Promise\<RentRequest\> | Sends a new rent request |
| updateRentRequest | requestId: string, updates: Partial\<RentRequest\> | Promise\<RentRequest\> | Updates a rent request |
| updateRentRequestStatus | requestId: string, status: 'accepted' \| 'rejected' | Promise\<RentRequest\> | Updates the status of a rent request |

## Contracts

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| getContracts | filters?: { propertyId?: string, renterId?: string, landlordId?: string, status?: 'pending' \| 'active' \| 'terminated' \| 'expired' } | Promise\<RentalContract[]\> | Gets contracts with optional filters |
| getContractById | contractId: string | Promise\<RentalContract\> | Gets a contract by ID |
| getContractByProperty | propertyId: string, renterId: string | Promise\<RentalContract \| null\> | Gets a contract for a specific property and renter |
| createContract | contractData: Omit\<RentalContract, 'id' \| 'createdAt'\> | Promise\<RentalContract\> | Creates a new rental contract |
| updateContract | contractId: string, updates: Partial\<RentalContract\> | Promise\<RentalContract\> | Updates a contract |
| terminateContract | contractId: string | Promise\<RentalContract\> | Terminates a contract |
| extendContract | contractId: string, newEndDate: string | Promise\<RentalContract\> | Extends a contract with a new end date |
| signContract | contractId: string, signatureData: { userId: string, signatureImageUrl: string } | Promise\<RentalContract\> | Adds a signature to a contract |

## Payments

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| getTransactions | filters?: { propertyId?: string, renterId?: string, landlordId?: string, status?: 'paid' \| 'pending' \| 'overdue', type?: 'rent' \| 'deposit' \| 'utility' } | Promise\<Transaction[]\> | Gets transactions with optional filters |
| getTransactionById | transactionId: string | Promise\<Transaction\> | Gets a transaction by ID |
| createTransaction | transactionData: Omit\<Transaction, 'id'\> | Promise\<Transaction\> | Creates a new transaction |
| updateTransaction | transactionId: string, updates: Partial\<Transaction\> | Promise\<Transaction\> | Updates a transaction |
| processPayment | transactionId: string, paymentData: { amount: number, currency: string, method: 'card' \| 'bank' \| 'cash', details?: any } | Promise\<Transaction\> | Processes a payment for a transaction |
| getFinancialSummary | userId: string | Promise\<{ totalRevenue: number, received: number, pending: number, overdue: number }\> | Gets a financial summary for a user |

## Maintenance

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| getMaintenanceRequests | filters?: { propertyId?: string, renterId?: string, status?: 'pending' \| 'scheduled' \| 'completed' \| 'cancelled' } | Promise\<MaintenanceRequest[]\> | Gets maintenance requests with optional filters |
| getMaintenanceRequestById | requestId: string | Promise\<MaintenanceRequest\> | Gets a maintenance request by ID |
| createMaintenanceRequest | requestData: Omit\<MaintenanceRequest, 'id' \| 'createdAt'\> | Promise\<MaintenanceRequest\> | Creates a new maintenance request |
| updateMaintenanceRequest | requestId: string, updates: Partial\<MaintenanceRequest\> | Promise\<MaintenanceRequest\> | Updates a maintenance request |
| scheduleMaintenanceRequest | requestId: string, scheduledDate: string | Promise\<MaintenanceRequest\> | Schedules a maintenance request |
| completeMaintenanceRequest | requestId: string | Promise\<MaintenanceRequest\> | Marks a maintenance request as completed |
| cancelMaintenanceRequest | requestId: string | Promise\<MaintenanceRequest\> | Cancels a maintenance request |

## Chat

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| getConversations | userId: string | Promise\<{ id: string, participantId: string, participantName: string, participantAvatar?: string, lastMessage: string, lastMessageDate: string, unreadCount: number }[]\> | Gets a user's conversations |
| getMessages | conversationId: string, options?: { limit?: number, offset?: number } | Promise\<Message[]\> | Gets messages for a conversation |
| sendMessage | messageData: { senderId: string, receiverId: string, content: string, propertyId?: string } | Promise\<Message\> | Sends a new message |
| markMessagesAsRead | userId: string, conversationId: string | Promise\<boolean\> | Marks all messages in a conversation as read |

## Dashboard

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| getLandlordDashboard | landlordId: string | Promise\<{ properties: number, occupancyRate: number, renters: number, revenue: { total: number, currency: string }, recentActivity: { id: string, type: 'application' \| 'payment' \| 'maintenance', title: string, timestamp: string }[] }\> | Gets dashboard data for a landlord |
| getRenterDashboard | renterId: string | Promise\<{ currentRental?: Property, maintenance: MaintenanceRequest[], savedProperties: Property[], nextPayment?: { amount: number, currency: string, dueInDays: number } }\> | Gets dashboard data for a renter |

## Settings

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| updateNotificationSettings | userId: string, settings: { email: boolean, push: boolean, sms: boolean, newRequests: boolean, payments: boolean, maintenance: boolean, messages: boolean } | Promise\<boolean\> | Updates a user's notification settings |
| updateLanguage | userId: string, language: string | Promise\<boolean\> | Updates a user's language preference |
| updateTheme | userId: string, theme: 'light' \| 'dark' \| 'system' | Promise\<boolean\> | Updates a user's theme preference |
| updateTextSize | userId: string, textSize: 'small' \| 'medium' \| 'large' | Promise\<boolean\> | Updates a user's text size preference |

## Trigger Functions

| Function Name | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| triggerAutoAcceptRentRequest | requestId: string, delayInMilliseconds: number | Promise\<void\> | Automatically accepts a rent request after a specified delay |
| triggerRentPaymentReminder | daysBeforeDue: number | Promise\<void\> | Sends payment reminders to renters |
| triggerContractExpirationNotification | daysBeforeExpiry: number | Promise\<void\> | Sends notifications for contracts nearing expiration |
| triggerMaintenanceFollowUp | daysAfterCompletion: number | Promise\<void\> | Sends follow-up messages after maintenance completion |
| triggerPropertyStatusUpdate | propertyId: string, status: 'available' \| 'rented' \| 'pending' | Promise\<void\> | Updates a property's status (may be triggered by other events) |
| triggerContractAutoRenewal | contractId: string, newDurationInMonths: number | Promise\<void\> | Automatically renews a contract if configured | 