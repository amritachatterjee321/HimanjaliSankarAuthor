# Production API Documentation

This document describes the production API endpoints for the Himanjali Sankar Author Website.

## Overview

The production API is built using Vercel Serverless Functions, providing a scalable and cost-effective solution for serving dynamic content without maintaining a separate server.

## API Endpoints

### 1. Books API

**Endpoint:** `/api/books`

**Methods:**
- `GET /api/books` - Get all books
- `GET /api/books?latest=true` - Get latest book
- `GET /api/books?category=adults` - Get books by category
- `GET /api/books?id=book-1` - Get specific book

**Response Format:**
```json
{
  "adults": [
    {
      "_id": "book-1",
      "title": "The Burnings",
      "year": "2024",
      "shortDescription": "A compelling narrative...",
      "coverImage": { "url": "..." },
      "amazonLink": "https://amazon.com/...",
      "category": "adults"
    }
  ],
  "children": [...]
}
```

### 2. Media API

**Endpoint:** `/api/media`

**Methods:**
- `GET /api/media` - Get all media items
- `GET /api/media?type=review` - Get media by type
- `GET /api/media?id=media-1` - Get specific media item

**Response Format:**
```json
[
  {
    "_id": "media-1",
    "title": "Short story for BLink",
    "type": "short-work",
    "source": "BLink - The Hindu Business Line",
    "url": "https://...",
    "date": "2024-02-05",
    "description": "A compelling short story..."
  }
]
```

### 3. Social Media API

**Endpoint:** `/api/social`

**Methods:**
- `GET /api/social` - Get active social media platforms

**Response Format:**
```json
[
  {
    "_id": "social-1",
    "name": "Instagram",
    "url": "https://instagram.com/himanjalisankar",
    "icon": "I",
    "active": true
  }
]
```

### 4. Contact Form API

**Endpoint:** `/api/contact`

**Methods:**
- `GET /api/contact` - Get contact form configuration
- `POST /api/contact` - Submit contact form

**POST Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Book Inquiry",
  "message": "I would like to know more about your books."
}
```

**Response Format:**
```json
{
  "message": "Thank you for your message! We will get back to you soon.",
  "success": true,
  "submittedAt": "2024-01-15T10:30:00.000Z"
}
```

### 5. About API

**Endpoint:** `/api/about`

**Methods:**
- `GET /api/about` - Get author information

**Response Format:**
```json
{
  "_id": "author-1",
  "name": "Himanjali Sankar",
  "title": "Award-winning Author & Literary Voice",
  "bio": "Himanjali Sankar is a celebrated author...",
  "achievements": [...],
  "education": "Master's in Creative Writing...",
  "interests": [...],
  "publications": [...],
  "socialMedia": {...},
  "contact": {...},
  "image": {...}
}
```

## CORS Support

All API endpoints support CORS (Cross-Origin Resource Sharing) and can be accessed from any domain.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

## Deployment

The API is automatically deployed when you push to the main branch. Vercel will:

1. Detect the `/api` folder
2. Deploy each file as a serverless function
3. Make them available at `/api/[filename]`

## Local Development

To test the API locally:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel dev`
3. Access API at: `http://localhost:3000/api/[endpoint]`

## Production URLs

Once deployed, your API will be available at:
- `https://your-domain.vercel.app/api/books`
- `https://your-domain.vercel.app/api/media`
- `https://your-domain.vercel.app/api/social`
- `https://your-domain.vercel.app/api/contact`
- `https://your-domain.vercel.app/api/about`

## Data Management

Currently, the API serves static sample data. To make it dynamic:

1. **Database Integration**: Connect to MongoDB, PostgreSQL, or other databases
2. **CMS Integration**: Connect to headless CMS like Contentful or Strapi
3. **File Storage**: Use services like AWS S3 for images
4. **Email Service**: Integrate with SendGrid or Mailgun for contact forms

## Security Considerations

- All endpoints are public (no authentication required)
- Input validation is implemented for contact forms
- CORS is enabled for cross-origin requests
- Rate limiting can be added if needed

## Monitoring

Monitor your API performance in the Vercel dashboard:
- Function execution times
- Error rates
- Request volumes
- Cold start performance
