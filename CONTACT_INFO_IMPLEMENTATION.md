# Dynamic Contact Information Management

This document describes the implementation of dynamic contact information management for the Himanjali Sankar author website.

## Overview

The contact page now loads information dynamically from the CMS, allowing the author to update contact details without modifying code. The system integrates with the existing CMS infrastructure and provides a seamless user experience.

## Components Modified

### 1. API Service (`public/src/js/api.js`)
- **Added**: `getContactInfo()` method to retrieve contact information from `/api/cms?endpoint=contact`
- **Purpose**: Provides a standardized way for the frontend to access contact data

### 2. Contact Page (`public/src/js/contact-page.js`)
- **Added**: `loadContactInfo()` method to fetch contact data during page initialization
- **Added**: `createSocialMethod()` helper to dynamically create social media contact methods
- **Modified**: Contact information display to use dynamic data with fallback defaults
- **Enhanced**: Automatic inclusion of social media contact methods when available

### 3. CMS Backend (`api/cms.js`)
- **Existing**: Contact API endpoint already implemented (`handleContact()` function)
- **Features**: 
  - GET requests return current contact information
  - PUT requests update contact information with authentication
  - Data stored in MongoDB with fallback to mock data

### 4. CMS Frontend (`cms/js/cms.js`)
- **Existing**: Contact form management already implemented
- **Features**:
  - `loadContactData()` loads current contact info into form
  - `handleContactSubmit()` saves contact updates
  - Form fields for email, social media, location, description, and success message

## Data Structure

### API Format
```json
{
  "email": "himanjali@example.com",
  "instagram": "@himanjalisankar",
  "facebook": "himanjali.author",
  "description": "I'd love to hear from you! Whether you have a question about my books, want to discuss a collaboration, or just want to say hello, feel free to reach out.",
  "successMessage": "Thank you for your message! I'll get back to you soon.",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

### Display Elements Updated
1. **"Get in Touch" description text** - Uses `contactInfo.description`
2. **Email address** - Uses `contactInfo.email`
3. **Social media methods** - Dynamically created from `contactInfo.instagram` and `contactInfo.facebook`

## CMS Interface

The CMS already includes a "Contact Info" section with the following fields:

### Get in Touch Section
- **Email Address**: The primary contact email displayed on the contact page
- **Instagram Handle**: Username or handle for Instagram
- **Facebook Handle**: Username or full URL for Facebook profile

### Contact Form Settings  
- **Contact Description**: Text that appears in the "Get in Touch" section
- **Success Message**: Message shown when contact form is successfully submitted

## Features

### 1. Dynamic Content Loading
- Contact page automatically fetches the latest contact information on load
- Graceful fallback to default values if API is unavailable
- No caching issues with cache-busting parameters

### 2. CMS Management
- Administrators can update contact information through the CMS interface
- Real-time updates without code changes
- Form validation and error handling

### 3. Social Media Integration
- Automatic display of social media contact methods when configured
- Support for Instagram and Facebook with proper icons
- Extensible structure for additional social platforms

### 4. Error Handling
- Fallback to default contact information if API fails
- Console logging for debugging
- User-friendly error messages in CMS

## Security

- CMS contact updates require authentication token
- Input validation on all contact form fields
- Proper error handling without exposing sensitive information

## Testing

A test file `test-contact-functionality.html` has been created to verify:
1. API endpoint accessibility
2. Contact page data loading functionality
3. Form field structure and mapping

## Usage Instructions

### For Administrators
1. Access the CMS at `/cms/`
2. Navigate to "Contact Info" section
3. Update any contact fields as needed
4. Click "Save Changes"
5. Contact page will immediately reflect the updates

### For Developers
The contact information is now fully dynamic. To add new contact fields:
1. Add the field to the CMS contact form
2. Update the API handler to save the new field
3. Modify the contact page to display the new field

## Files Modified
- `public/src/js/api.js` - Added contact info API method
- `public/src/js/contact-page.js` - Implemented dynamic data loading
- `cms/index.html` - Removed standalone contact-info.js reference
- Removed `cms/js/contact-info.js` - Redundant with main CMS functionality

## Database
Contact information is stored in the `contact` collection in MongoDB, with the existing backup system maintaining data consistency.

### MongoDB Integration
The contact page is now fully connected to MongoDB:

1. **Database Collection**: `contact` collection stores all contact information
2. **API Endpoint**: `/api/cms?endpoint=contact` handles GET and PUT requests
3. **CMS Service**: `updateContact()` method for database operations
4. **Migration**: Contact data migration included in `scripts/migrate-to-mongodb.js`
5. **Testing**: `scripts/test-contact-mongodb.js` for connection verification

### Data Flow
1. **Frontend** → **API Service** → **CMS API** → **MongoDB**
2. **CMS Interface** → **CMS API** → **MongoDB**
3. **Migration Script** → **CMS Service** → **MongoDB**

### Testing MongoDB Connection
Run the test script to verify MongoDB connection:
```bash
node scripts/test-contact-mongodb.js
```
