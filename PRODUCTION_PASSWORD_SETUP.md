# Production Password Change Setup Guide

## Overview
This guide explains how to ensure password changes work correctly in production with MongoDB Atlas.

## Current Issue
The password change functionality works locally but may not work in production because:
1. Local environment uses `env.local` with local MongoDB URI
2. Production should use MongoDB Atlas URI from environment variables
3. Environment variables need to be properly configured in Vercel

## Solution

### 1. Environment Variables Setup in Vercel

In your Vercel dashboard, set these environment variables:

```bash
# MongoDB Atlas Connection (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
DB_NAME=your_database_name

# Environment
NODE_ENV=production

# JWT Secret (REQUIRED)
JWT_SECRET=your-secure-jwt-secret-key

# Optional: MongoDB Connection Options
MONGODB_OPTIONS_MAX_POOL_SIZE=10
MONGODB_OPTIONS_SERVER_SELECTION_TIMEOUT_MS=5000
MONGODB_OPTIONS_SOCKET_TIMEOUT_MS=45000
```

### 2. Vercel Environment Variables Configuration

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `DB_NAME`: Your database name
   - `NODE_ENV`: Set to `production`
   - `JWT_SECRET`: A secure random string

### 3. Verify MongoDB Atlas Connection

The application will automatically:
- Connect to MongoDB Atlas using the provided URI
- Store password changes in the `settings` collection
- Hash passwords before storing them
- Authenticate users against the settings collection

### 4. Testing Production Password Change

1. Deploy your application to Vercel
2. Access the CMS at `https://yourdomain.com/cms`
3. Login with current credentials
4. Go to Settings section
5. Change the password
6. Test login with new password

## Code Changes Made

### ✅ Fixed Issues:
1. **Password Hashing**: Added bcrypt hashing in `updateSettings()`
2. **Collection Mismatch**: Fixed `getUserByUsername()` to look in settings collection
3. **Authentication**: Added proper token verification for settings endpoints
4. **Response Format**: Fixed API response format for settings updates

### 🔧 Key Files Modified:
- `src/services/cmsService.js`: Added password hashing and fixed user lookup
- `src/routes/cms.js`: Added authentication and improved response format
- `api/cms.js`: Added authentication for settings endpoint

## Troubleshooting

### If Password Change Still Doesn't Work:

1. **Check Environment Variables**:
   ```bash
   # In Vercel dashboard, verify these are set:
   MONGODB_URI=mongodb+srv://...
   DB_NAME=your_database
   NODE_ENV=production
   ```

2. **Check MongoDB Atlas Connection**:
   - Verify network access allows connections from Vercel
   - Check if the connection string is correct
   - Ensure the database user has proper permissions

3. **Check Application Logs**:
   - Look for MongoDB connection errors
   - Check for authentication errors
   - Verify settings collection exists

4. **Test Database Connection**:
   ```bash
   # Use MongoDB Compass or mongo shell to connect
   mongodb+srv://username:password@cluster.mongodb.net/database
   ```

## Security Considerations

### ✅ Implemented:
- Passwords are hashed using bcrypt (12 rounds)
- JWT tokens for authentication
- Environment variables for sensitive data
- HTTPS in production

### 🔒 Best Practices:
- Use strong, unique passwords
- Regularly rotate JWT secrets
- Monitor database access logs
- Set up MongoDB Atlas alerts

## Migration from Local to Production

### If you have local data:
1. Export your local MongoDB data
2. Import to MongoDB Atlas
3. Update environment variables in Vercel
4. Deploy and test

### If starting fresh:
1. Set up MongoDB Atlas database
2. Configure environment variables
3. Deploy application
4. Use default admin/admin123 to login
5. Change password immediately

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test MongoDB Atlas connection separately
4. Review application logs for errors

---

**Last Updated**: August 22, 2025
**Version**: 1.0.0
