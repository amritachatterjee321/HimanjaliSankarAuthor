# Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Cleanup
- [x] Removed test files and temporary files
- [x] Cleaned up duplicate routes in `vercel.json`
- [x] Moved JSON data files to backup directory
- [x] Created logging utility for production control

### ✅ Database Setup
- [x] MongoDB connection configured
- [x] Data migrated from JSON files to MongoDB
- [x] CMS authentication working
- [x] Homepage featuring functionality working

### ✅ Environment Variables
Set the following environment variables in your production environment:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
DB_NAME=your_database_name

# Optional: MongoDB Connection Options
MONGODB_OPTIONS_MAX_POOL_SIZE=10
MONGODB_OPTIONS_SERVER_SELECTION_TIMEOUT_MS=5000
MONGODB_OPTIONS_SOCKET_TIMEOUT_MS=45000

# Environment
NODE_ENV=production

# Logging (optional)
LOG_LEVEL=WARN
```

### ✅ Security Considerations
- [x] Environment variables properly configured
- [x] Authentication tokens implemented
- [x] CORS headers configured
- [x] Rate limiting enabled
- [x] Security headers set in `vercel.json`

## Deployment Steps

### 1. Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy using Vercel's automatic deployment

### 2. Environment Variables Setup
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required environment variables
3. Set `NODE_ENV=production`
4. Set `LOG_LEVEL=WARN` for reduced logging

### 3. Domain Configuration
1. Configure custom domain in Vercel
2. Set up SSL certificates (automatic with Vercel)
3. Configure DNS records

## Post-Deployment Verification

### ✅ Functionality Tests
- [ ] Main website loads correctly
- [ ] Books page displays all books
- [ ] Book detail pages work
- [ ] CMS login works
- [ ] CMS homepage featuring works
- [ ] Book management in CMS works
- [ ] Media management in CMS works
- [ ] Author info management works

### ✅ Performance Tests
- [ ] Page load times are acceptable
- [ ] Images load properly
- [ ] API responses are fast
- [ ] Database queries are optimized

### ✅ Security Tests
- [ ] CMS is properly protected
- [ ] API endpoints are secure
- [ ] No sensitive data exposed
- [ ] Authentication works correctly

## Monitoring and Maintenance

### Logging
- Production logs are controlled by `LOG_LEVEL` environment variable
- Set to `WARN` for production to reduce noise
- Set to `DEBUG` temporarily for troubleshooting

### Database
- Monitor MongoDB connection health
- Set up database backups
- Monitor query performance

### Performance
- Monitor Vercel function execution times
- Set up performance alerts
- Monitor API response times

## Troubleshooting

### Common Issues
1. **MongoDB Connection Issues**: Check `MONGODB_URI` and network connectivity
2. **Authentication Problems**: Verify JWT secret and token configuration
3. **CMS Not Loading**: Check API routes and CORS configuration
4. **Image Upload Issues**: Verify file upload limits and storage configuration

### Debug Mode
To enable debug logging temporarily:
```bash
LOG_LEVEL=DEBUG
```

## Backup Strategy

### Data Backup
- JSON files moved to `backup/` directory
- MongoDB data should be backed up regularly
- Consider automated backup solutions

### Code Backup
- All code is in Git repository
- Use Git tags for version releases
- Keep deployment logs

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Review application logs
3. Test functionality systematically
4. Contact development team

---

**Last Updated**: August 22, 2025
**Version**: 1.0.0
