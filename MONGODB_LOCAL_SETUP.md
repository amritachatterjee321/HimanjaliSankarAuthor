# Local MongoDB Setup Guide

This guide explains how to set up and use a local MongoDB instance using Docker for testing and development.

## 🚀 Quick Start

### 1. Start MongoDB Containers

```bash
# Windows
scripts\mongodb-local.bat start

# Or manually with Docker Compose
docker-compose up -d
```

### 2. Test the Connection

```bash
node scripts/test-mongodb-local.js
```

### 3. Access MongoDB

- **MongoDB**: `localhost:27017`
- **Mongo Express (Web UI)**: `http://localhost:8081`
  - Username: `admin`
  - Password: `password123`

## 📋 Prerequisites

- Docker Desktop installed and running
- Node.js and npm installed
- MongoDB driver for Node.js (`npm install mongodb`)

## 🔧 Configuration

### Environment Variables

The local setup uses these default settings:

```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/himanjali?authSource=admin
DB_NAME=himanjali
NODE_ENV=development
```

### Database Credentials

- **Username**: `admin`
- **Password**: `password123`
- **Database**: `himanjali`
- **Port**: `27017`

## 🗄️ Database Structure

The initialization script creates these collections with sample data:

### Books Collection
```json
{
  "_id": "book-1",
  "title": "The Burnings",
  "year": "2024",
  "shortDescription": "A compelling narrative about resilience and transformation.",
  "coverImage": {
    "url": "/uploads/coverImage-1754499536304-173385349.jpg"
  },
  "amazonLink": "https://amazon.com/dp/B0C1234567",
  "category": "adults"
}
```

### Media Collection
```json
{
  "_id": "media-1",
  "title": "Short story for BLink",
  "type": "short-work",
  "source": "BLink - The Hindu Business Line",
  "url": "https://example.com/story",
  "date": "2024-02-05",
  "description": "A compelling short story published in BLink."
}
```

### Social Collection
```json
{
  "_id": "social-1",
  "name": "Instagram",
  "url": "https://instagram.com/himanjalisankar",
  "icon": "I",
  "active": true
}
```

### Author Collection
```json
{
  "_id": "author-1",
  "name": "Himanjali Sankar",
  "bio": "Himanjali Sankar is an accomplished author known for her compelling narratives and unique storytelling style.",
  "image": {
    "url": "/uploads/authorImage-1755236114057-519818418.jpeg"
  },
  "email": "contact@himanjalisankar.com",
  "website": "https://himanjalisankar.com"
}
```

### Settings Collection
```json
{
  "_id": "site-settings",
  "siteName": "Himanjali Sankar",
  "siteDescription": "Author website showcasing books, media, and literary works",
  "contactEmail": "contact@himanjalisankar.com",
  "socialLinks": [
    {
      "name": "Instagram",
      "url": "https://instagram.com/himanjalisankar",
      "icon": "I"
    }
  ]
}
```

## 🛠️ Management Commands

### Start MongoDB
```bash
scripts\mongodb-local.bat start
```

### Stop MongoDB
```bash
scripts\mongodb-local.bat stop
```

### Restart MongoDB
```bash
scripts\mongodb-local.bat restart
```

### View Logs
```bash
scripts\mongodb-local.bat logs
```

### Check Status
```bash
scripts\mongodb-local.bat status
```

### Manual Docker Commands
```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f mongodb

# Check status
docker-compose ps
```

## 🧪 Testing

### Test Connection
```bash
node scripts/test-mongodb-local.js
```

### Test API Endpoints
Once your application is running with the local MongoDB:

- `http://localhost:3000/api/books` - Get all books
- `http://localhost:3000/api/media` - Get all media
- `http://localhost:3000/api/social` - Get social links
- `http://localhost:3000/api/author` - Get author info

### Using Mongo Express
1. Open `http://localhost:8081` in your browser
2. Login with username `admin` and password `password123`
3. Navigate to the `himanjali` database
4. Browse and edit collections directly

## 🔄 Data Persistence

Data is persisted in a Docker volume named `mongodb_data`. This means:
- Data survives container restarts
- Data is not lost when containers are stopped
- To completely reset data, remove the volume: `docker volume rm himanjali_mongodb_data`

## 🚨 Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB containers are running
```bash
scripts\mongodb-local.bat start
```

### Authentication Failed
```
Error: Authentication failed
```
**Solution**: Check that you're using the correct credentials
- Username: `admin`
- Password: `password123`
- Auth Source: `admin`

### Port Already in Use
```
Error: Port 27017 is already in use
```
**Solution**: Stop any existing MongoDB instances or change the port in `docker-compose.yml`

### Container Won't Start
```bash
# Check container logs
docker-compose logs mongodb

# Remove and recreate containers
docker-compose down -v
docker-compose up -d
```

## 🔒 Security Notes

⚠️ **Important**: This setup is for local development only!

- Default credentials are hardcoded
- No SSL/TLS encryption
- No network security
- **Never use these settings in production**

For production, use:
- MongoDB Atlas or a properly secured MongoDB instance
- Strong, unique passwords
- SSL/TLS encryption
- Network security and firewalls
- Environment variables for sensitive data

## 📚 Additional Resources

- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Mongo Express](https://github.com/mongo-express/mongo-express)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)

## 🔄 Migration from Production

To test with production data:

1. Export data from production MongoDB
2. Import into local MongoDB using Mongo Express or mongoimport
3. Update connection strings in your application
4. Test thoroughly before deploying changes

## 📝 Development Workflow

1. **Start local MongoDB**: `scripts\mongodb-local.bat start`
2. **Test connection**: `node scripts/test-mongodb-local.js`
3. **Run your application**: `npm run dev`
4. **Make changes and test**
5. **Stop MongoDB when done**: `scripts\mongodb-local.bat stop`
