# MongoDB Setup Guide

This guide will help you set up MongoDB for your CMS.

## Prerequisites

1. **MongoDB Atlas Account** (Recommended)
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get your connection string

2. **Local MongoDB** (Alternative)
   - Install MongoDB Community Edition
   - Run locally on `mongodb://localhost:27017`

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Cluster0
DB_NAME=Cluster0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## MongoDB Atlas Setup

1. **Create Cluster**
   - Go to MongoDB Atlas
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select your preferred cloud provider and region
   - Click "Create"

2. **Set Up Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password
   - Select "Read and write to any database"
   - Click "Add User"

3. **Set Up Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

4. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `Cluster0`

## Migration

Run the migration script to move your existing JSON data to MongoDB:

```bash
node scripts/migrate-to-mongodb.js
```

This will:
- Connect to your MongoDB database
- Migrate all books, media, author, social, and settings data
- Create a default admin user from your settings
- Preserve all your existing data

## Testing

1. **Start the server:**
   ```bash
   npm run server:dev
   ```

2. **Access the CMS:**
   - Go to `http://localhost:3000/cms`
   - Login with your credentials

3. **Verify data:**
   - Check that all your books, media, and other data are present
   - Test creating, editing, and deleting items

## Troubleshooting

### Connection Issues
- Verify your MongoDB URI is correct
- Check that your IP is whitelisted (for Atlas)
- Ensure your database user has proper permissions

### Migration Issues
- Make sure your JSON files are valid
- Check that the database connection is working
- Verify all required environment variables are set

### Authentication Issues
- Ensure JWT_SECRET is set
- Check that the migration created a user properly
- Verify username/password in your settings.json

## Security Notes

1. **Change the JWT_SECRET** to a strong, unique key
2. **Use environment variables** for all sensitive data
3. **Restrict network access** in production
4. **Use strong passwords** for database users
5. **Enable MongoDB authentication** in production

## Production Deployment

For production deployment:

1. **Use MongoDB Atlas** (recommended) or a managed MongoDB service
2. **Set NODE_ENV=production**
3. **Use a strong JWT_SECRET**
4. **Restrict CORS origins** to your actual domain
5. **Set up proper rate limiting**
6. **Use HTTPS** for all connections
7. **Regular backups** of your database

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your MongoDB connection string
3. Ensure all environment variables are set correctly
4. Check that your JSON data is valid before migration 