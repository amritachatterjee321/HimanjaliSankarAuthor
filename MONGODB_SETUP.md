# MongoDB Setup Guide for Vercel

This guide explains how to connect your existing MongoDB database to your Vercel app.

## 🚀 **Quick Setup Steps**

### **1. Get Your MongoDB Connection String**

1. **Log into MongoDB Atlas** (or your MongoDB provider)
2. **Go to your cluster** → **Connect**
3. **Choose "Connect your application"**
4. **Copy the connection string**

Your connection string will look like:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### **2. Set Environment Variables in Vercel**

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings** → **Environment Variables**
4. **Add these variables:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority` | Production |
| `DB_NAME` | `your_actual_database_name` | Production |

### **3. Update Your Connection String**

Replace the placeholder values in your connection string:
- `username` → Your MongoDB username
- `password` → Your MongoDB password
- `cluster.mongodb.net` → Your actual cluster URL
- `database` → Your actual database name

## 🔧 **Local Development Setup**

### **Option 1: Using .env.local file**

1. **Create `.env.local` file** in your project root:
```bash
# .env.local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
DB_NAME=your_database_name
NODE_ENV=development
```

2. **Install Vercel CLI:**
```bash
npm i -g vercel
```

3. **Run locally:**
```bash
vercel dev
```

### **Option 2: Using Vercel CLI**

1. **Link your project:**
```bash
vercel link
```

2. **Pull environment variables:**
```bash
vercel env pull .env.local
```

3. **Run locally:**
```bash
vercel dev
```

## 🗄️ **Database Collections Structure**

Your MongoDB database should have these collections:

### **Books Collection**
```json
{
  "_id": "book-1",
  "title": "The Burnings",
  "year": "2024",
  "shortDescription": "A compelling narrative...",
  "coverImage": {
    "url": "https://example.com/cover.jpg"
  },
  "amazonLink": "https://amazon.com/dp/B0C1234567",
  "category": "adults"
}
```

### **Media Collection**
```json
{
  "_id": "media-1",
  "title": "Short story for BLink",
  "type": "short-work",
  "source": "BLink - The Hindu Business Line",
  "url": "https://example.com/story",
  "date": "2024-02-05",
  "description": "A compelling short story..."
}
```

### **Social Media Collection**
```json
{
  "_id": "social-1",
  "name": "Instagram",
  "url": "https://instagram.com/himanjalisankar",
  "icon": "I",
  "active": true
}
```

## 🔒 **Security Best Practices**

### **1. Network Access**
- **Whitelist Vercel IPs** in MongoDB Atlas
- **Or use 0.0.0.0/0** for development (not recommended for production)

### **2. Database User**
- **Create a dedicated user** for your Vercel app
- **Use strong passwords**
- **Limit permissions** to only what's needed

### **3. Environment Variables**
- **Never commit** `.env.local` to git
- **Use Vercel dashboard** for production secrets
- **Rotate passwords** regularly

## 🧪 **Testing Your Connection**

### **1. Test API Endpoints**
Visit these URLs to test your MongoDB connection:
- `/api/books` - Should return books from database
- `/api/media` - Should return media from database
- `/api/social` - Should return social media from database

### **2. Check Vercel Logs**
1. **Go to Vercel dashboard**
2. **Select your project**
3. **Go to Functions** → **View logs**
4. **Look for MongoDB connection errors**

### **3. Common Error Messages**

| Error | Solution |
|-------|----------|
| `MongoNetworkError: connect ECONNREFUSED` | Check MongoDB URI and network access |
| `MongoServerSelectionError: getaddrinfo ENOTFOUND` | Verify cluster hostname |
| `MongoError: Authentication failed` | Check username/password |
| `MongoError: Database does not exist` | Verify database name |

## 🚀 **Deployment Checklist**

- [ ] MongoDB connection string configured in Vercel
- [ ] Database name set correctly
- [ ] Network access configured (IP whitelist)
- [ ] Database user has correct permissions
- [ ] Collections exist with proper structure
- [ ] API endpoints tested locally
- [ ] Environment variables deployed to Vercel

## 🔄 **Updating Data**

### **Option 1: Direct Database Updates**
- Use MongoDB Compass or Atlas interface
- Update documents directly in collections

### **Option 2: Create Admin API Endpoints**
- Add POST/PUT endpoints for data management
- Implement authentication for admin access
- Use these endpoints to update content

### **Option 3: CMS Integration**
- Connect to headless CMS like Contentful
- Use webhooks to sync data changes
- Maintain content through CMS interface

## 📊 **Monitoring & Performance**

### **Vercel Dashboard**
- Monitor function execution times
- Check error rates
- View request volumes

### **MongoDB Atlas**
- Monitor connection pool usage
- Check query performance
- Set up alerts for issues

## 🆘 **Troubleshooting**

### **Connection Issues**
1. **Verify connection string** format
2. **Check network access** settings
3. **Confirm database user** permissions
4. **Test connection** locally first

### **Performance Issues**
1. **Add database indexes** for frequently queried fields
2. **Implement connection pooling** (already done)
3. **Use projection** to limit returned fields
4. **Add caching** for static data

### **Data Issues**
1. **Verify collection names** match your code
2. **Check document structure** matches expected format
3. **Validate data types** (especially ObjectIds)
4. **Test queries** in MongoDB shell first

## 📚 **Additional Resources**

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions) 