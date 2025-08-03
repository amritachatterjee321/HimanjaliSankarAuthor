# Himanjali Sankar - Content Management System

A modern, responsive Content Management System (CMS) for managing the author website content.

## Features

### 📚 Books Management
- Add, edit, and delete books
- Categorize books (Adult Fiction, Children's Books)
- Include book details: title, genre, year, description
- Add Amazon and Goodreads links
- Custom cover style classes

### 📰 Media Coverage
- Manage media articles and press coverage
- Track publication details and dates
- Store article URLs and excerpts
- Full CRUD operations

### 👤 Author Information
- Update author biography
- Manage contact information
- Set location and website details
- Real-time content updates

### 🔗 Social Media
- Manage Instagram and Facebook links
- Easy social media integration
- Update links without code changes

### ⚙️ Settings
- Configure site title and description
- Manage admin credentials
- System-wide settings management

### 📊 Dashboard
- Overview of content statistics
- Quick action buttons
- Real-time data visualization

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Modern web browser
- Access to the main website server

### Installation

1. **Access the CMS**
   - Navigate to `/cms/` in your browser
   - Or access directly: `http://localhost:3000/cms/`

2. **Login Credentials**
   - **Username:** `admin`
   - **Password:** `admin123`

3. **First Time Setup**
   - The CMS will automatically create data files on first use
   - All data is stored in JSON format in the `data/` directory

## Usage Guide

### Dashboard
The dashboard provides an overview of your content:
- Total number of books
- Media coverage count
- Site statistics
- Quick action buttons for common tasks

### Managing Books

1. **Adding a New Book**
   - Navigate to "Books" section
   - Click "Add New Book" button
   - Fill in all required fields:
     - Title
     - Genre
     - Category (Adult Fiction or Children's Books)
     - Publication Year
     - Description
   - Optional fields:
     - Cover Style Class (for custom styling)
     - Amazon Link
     - Goodreads Link
   - Click "Save Book"

2. **Editing a Book**
   - Find the book in the books grid
   - Click the edit (pencil) icon
   - Modify the information
   - Save changes

3. **Deleting a Book**
   - Find the book in the books grid
   - Click the delete (trash) icon
   - Confirm deletion

### Managing Media Coverage

1. **Adding Media Coverage**
   - Navigate to "Media Coverage" section
   - Click "Add Media Coverage"
   - Fill in:
     - Article title
     - Publication name
     - Publication date
     - Article URL
     - Excerpt (optional)
   - Save the entry

2. **Editing/Deleting Media**
   - Use the edit/delete buttons on each media card
   - Confirm deletions

### Author Information

1. **Updating Author Details**
   - Navigate to "Author Info" section
   - Update any fields:
     - Author name
     - Biography
     - Email address
     - Website URL
     - Location
   - Click "Save Author Info"

### Social Media Links

1. **Managing Social Links**
   - Navigate to "Social Media" section
   - Enter Instagram and Facebook URLs
   - Save changes
   - Links will automatically update on the main website

### Settings

1. **System Settings**
   - Navigate to "Settings" section
   - Update site title and description
   - Change admin username
   - Update admin password (optional)
   - Save settings

## Data Storage

The CMS stores all data in JSON files located in the `data/` directory:

- `books.json` - All book information
- `media.json` - Media coverage entries
- `author.json` - Author information
- `settings.json` - System settings

### Backup Recommendations

1. **Regular Backups**
   - Backup the `data/` directory regularly
   - Store backups in a secure location
   - Consider automated backup solutions

2. **Version Control**
   - Consider using Git for data version control
   - Track changes to content over time

## Security

### Authentication
- Simple token-based authentication
- Session management via localStorage
- Protected API endpoints

### Production Considerations
- Change default admin credentials
- Implement proper JWT authentication
- Use HTTPS in production
- Regular security updates

## API Endpoints

The CMS uses the following API endpoints:

### Books
- `GET /api/cms/books` - Get all books
- `POST /api/cms/books` - Create new book
- `PUT /api/cms/books/:id` - Update book
- `DELETE /api/cms/books/:id` - Delete book

### Media
- `GET /api/cms/media` - Get all media
- `POST /api/cms/media` - Create new media entry
- `PUT /api/cms/media/:id` - Update media entry
- `DELETE /api/cms/media/:id` - Delete media entry

### Author
- `GET /api/cms/author` - Get author info
- `PUT /api/cms/author` - Update author info

### Settings
- `GET /api/cms/settings` - Get settings
- `PUT /api/cms/settings` - Update settings

### Dashboard
- `GET /api/cms/dashboard` - Get dashboard stats

## Troubleshooting

### Common Issues

1. **Login Problems**
   - Ensure you're using correct credentials
   - Clear browser cache and localStorage
   - Check if the server is running

2. **Data Not Saving**
   - Check server logs for errors
   - Ensure write permissions on data directory
   - Verify API endpoints are accessible

3. **Images Not Loading**
   - Check file permissions
   - Verify image paths are correct
   - Ensure images are in the correct directory

### Error Messages

- **"Access token required"** - Login again
- **"Invalid token"** - Clear localStorage and login again
- **"Failed to load data"** - Check server connection
- **"Failed to save"** - Check server logs and permissions

## Support

For technical support or questions:
1. Check the server logs for error messages
2. Verify all prerequisites are met
3. Ensure proper file permissions
4. Contact the development team

## Future Enhancements

Planned features for future versions:
- Image upload and management
- Rich text editor for descriptions
- Bulk import/export functionality
- Advanced analytics and reporting
- Multi-user support with roles
- Content scheduling and publishing
- SEO optimization tools
- Email notifications for updates

---

**Version:** 1.0.0  
**Last Updated:** August 2025  
**Compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge) 