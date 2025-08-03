# Himanjali CMS - Content Management System

## Overview
The Himanjali CMS is a comprehensive content management system for managing the author website content. It provides an intuitive interface for managing books, author information, media coverage, and social media links.

## Features
- **Book Management**: Add, edit, and delete books with categories (Adult Fiction, Children's Books)
- **Author Information**: Update author bio, contact information, and website details
- **Media Coverage**: Manage press coverage, reviews, and media mentions
- **Social Media**: Update Instagram and Facebook links
- **Settings**: Configure CMS credentials and API settings

## Access
- **URL**: `http://localhost:3000/cms/`
- **Default Username**: `admin`
- **Default Password**: `admin123`

## Usage

### Login
1. Navigate to `http://localhost:3000/cms/`
2. Enter your username and password
3. Click "Login"

### Managing Books
1. Click on the "Books" tab
2. Click "Add New Book" to create a new book entry
3. Fill in the book details:
   - Title
   - Genre
   - Year
   - Description
   - Amazon Link (optional)
   - Category (Adult Fiction or Children's Books)
4. Click "Save Book"

### Managing Author Information
1. Click on the "Author Info" tab
2. Update the author details:
   - Name
   - Bio
   - Email
   - Website
3. Click "Save Changes"

### Managing Media Coverage
1. Click on the "Media Coverage" tab
2. Click "Add Media Item" to add new coverage
3. Fill in the media details:
   - Title
   - Source
   - URL
   - Date
4. Click "Save Media Item"

### Managing Social Media
1. Click on the "Social Media" tab
2. Update Instagram and Facebook URLs
3. Click "Save Changes"

### Settings
1. Click on the "Settings" tab
2. Update CMS credentials and API settings
3. Click "Save Settings"

## Data Storage
All data is stored in JSON files in the `data/` directory:
- `books.json` - Book information
- `author.json` - Author details
- `media.json` - Media coverage
- `social.json` - Social media links
- `settings.json` - CMS settings

## Security
- Simple token-based authentication
- All API endpoints require authentication
- Passwords are stored in plain text (for development only)

## Troubleshooting
- If the CMS doesn't load, ensure the server is running (`npm run dev`)
- Check browser console for any JavaScript errors
- Verify that all data files exist in the `data/` directory
- Ensure the API base URL is correct in settings

## Development
The CMS is built with:
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Express.js with JSON file storage
- **Authentication**: Simple token-based system

For production deployment, consider:
- Implementing proper JWT authentication
- Using a real database instead of JSON files
- Adding input validation and sanitization
- Implementing proper password hashing 