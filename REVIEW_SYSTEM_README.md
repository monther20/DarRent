# DarRent Review System Implementation Guide

This document provides instructions for implementing and using the property and renter review systems in the DarRent application.

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Functions](#api-functions)
4. [Triggers](#triggers)
5. [Implementation Steps](#implementation-steps)
6. [Testing](#testing)
7. [Frontend Integration](#frontend-integration)
8. [Best Practices](#best-practices)

## Overview

The DarRent review system allows:
- Renters to review properties they have rented
- Landlords to review renters who have rented their properties
- Display of property and renter ratings in listings and profiles
- Management of review visibility (for admin moderation)
- Statistical analysis of reviews

Reviews are only enabled for contracts that have ended (completed, terminated, or expired) and within a 90-day window after contract end date.

## Database Schema

The review system uses two main tables:

### Property Reviews Table
```sql
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
```

### Renter Reviews Table
```sql
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
```

These tables are accompanied by indexes and supplemented by additional columns in the `properties` and `users` tables to store aggregate rating information.

## API Functions

### Core Functions

1. **Adding Reviews**
   - `add_property_review(property_id, renter_id, rating, review_text_en, review_text_ar)`: Creates a new property review
   - `add_renter_review(renter_id, landlord_id, rating, review_text_en, review_text_ar)`: Creates a new renter review

2. **Retrieving Reviews**
   - `get_property_reviews(property_id)`: Gets all visible reviews for a property
   - `get_renter_reviews(renter_id)`: Gets all visible reviews for a renter

3. **Finding Reviewable Items**
   - `get_renter_reviewable_properties(renter_id)`: Gets properties a renter can review
   - `get_landlord_reviewable_renters(landlord_id)`: Gets renters a landlord can review

4. **Moderation Functions**
   - `toggle_property_review_visibility(review_id, visible)`: Shows/hides a property review
   - `toggle_renter_review_visibility(review_id, visible)`: Shows/hides a renter review

5. **Statistics Functions**
   - `get_property_review_statistics(property_id)`: Gets rating statistics for a property
   - `get_renter_review_statistics(renter_id)`: Gets rating statistics for a renter

6. **Editing Reviews**
   - `edit_property_review(review_id, rating, review_text_en, review_text_ar)`: Edits an existing property review
   - `edit_renter_review(review_id, rating, review_text_en, review_text_ar)`: Edits an existing renter review

## Triggers

The review system includes several triggers for automating processes:

1. **Contract Review Availability Trigger**
   - Triggers when a contract status changes to completed, terminated, or expired
   - Sends notifications to both landlord and renter about review opportunities

2. **Review Added Trigger**
   - Updates property/renter aggregate ratings when new reviews are added

3. **Review Updated Trigger**
   - Updates property/renter aggregate ratings when reviews are modified

## Implementation Steps

To implement the review system:

1. **Database Setup**
   - Run the `review_system.sql` script to create the required tables, functions, and triggers

2. **Sample Data (for testing)**
   - Run the `review_system_sample_data.sql` script to populate the system with test data

3. **Verification**
   - Verify that all tables are created correctly
   - Test each API function to ensure proper operation
   - Check that triggers work as expected

4. **Frontend Integration**
   - Add review submission forms in the property and renter profile pages
   - Display review summaries on property and renter listings
   - Implement review display components
   - Add a review management interface for admins

## Testing

Test the following scenarios:

1. **Basic Functionality**
   - Adding reviews for eligible properties/renters
   - Viewing reviews for properties/renters
   - Checking that users can't review properties they haven't rented

2. **Edge Cases**
   - Attempting to review a property with an active contract
   - Trying to review a property outside the 90-day window
   - Submitting a review with invalid rating values

3. **Administrative Functions**
   - Testing moderation functions for hiding/showing reviews
   - Verifying that hidden reviews don't affect aggregate ratings

## Frontend Integration

### Property Details Page
```javascript
// Example code for displaying property reviews
const PropertyReviews = ({ propertyId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Fetch reviews
    supabase
      .rpc('get_property_reviews', { p_property_id: propertyId })
      .then(({ data, error }) => {
        if (!error) setReviews(data);
      });

    // Fetch statistics
    supabase
      .rpc('get_property_review_statistics', { p_property_id: propertyId })
      .then(({ data, error }) => {
        if (!error) setStats(data[0]);
      });
  }, [propertyId]);

  return (
    <div className="property-reviews">
      {stats && (
        <div className="review-stats">
          <h3>Rating: {stats.average_rating.toFixed(1)} ({stats.review_count} reviews)</h3>
          {/* Display rating distribution */}
        </div>
      )}
      
      {reviews.map(review => (
        <div key={review.id} className="review-card">
          <div className="review-header">
            <img src={review.renter_avatar || '/default-avatar.png'} alt={review.renter_name} />
            <div>
              <h4>{review.renter_name}</h4>
              <div className="rating">{review.rating} stars</div>
              <div className="date">{new Date(review.review_date).toLocaleDateString()}</div>
            </div>
          </div>
          <p className="review-text">{review.review_text_en}</p>
        </div>
      ))}
    </div>
  );
};
```

### Review Submission Form
```javascript
// Example code for submitting a property review
const AddPropertyReview = ({ propertyId, renterId, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const { data, error } = await supabase.rpc(
      'add_property_review',
      {
        p_property_id: propertyId,
        p_renter_id: renterId,
        p_rating: rating,
        p_review_text_en: reviewText
      }
    );
    
    if (error) {
      setError(error.message);
    } else {
      onReviewAdded(data);
      setRating(5);
      setReviewText('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Leave a Review</h3>
      {error && <div className="error">{error}</div>}
      
      <div className="rating-selector">
        {[1, 2, 3, 4, 5].map(star => (
          <button 
            key={star} 
            type="button"
            className={star <= rating ? 'star active' : 'star'}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>
      
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Share your experience with this property..."
        rows={5}
        required
      />
      
      <button type="submit" className="submit-btn">Submit Review</button>
    </form>
  );
};
```

## Best Practices

1. **Data Validation**
   - Always validate rating values on the client side (1-5 scale)
   - Limit review text length appropriately
   - Sanitize text input to prevent injection attacks

2. **Performance Optimization**
   - Use pagination when displaying large numbers of reviews
   - Cache aggregate rating values when possible
   - Consider loading reviews asynchronously after the main content

3. **User Experience**
   - Provide clear instructions on review guidelines
   - Include helpful prompts for writing constructive reviews
   - Allow users to edit reviews within a reasonable timeframe

4. **Moderation System**
   - Implement a flagging system for inappropriate reviews
   - Establish clear guidelines for review visibility decisions
   - Create an admin dashboard for managing review reports

5. **Internationalization**
   - Support both English and Arabic in the review interface
   - Ensure RTL layout works correctly for Arabic reviews
   - Provide appropriate placeholders and prompts in both languages 