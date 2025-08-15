import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Use original MongoDB Atlas URI without SSL modifications
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'Cluster0';

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      if (this.client) {
        return this.db;
      }

      console.log('🔄 Attempting to connect to MongoDB...');
      
      // Use working SSL/TLS configuration for MongoDB Atlas
      const options = {
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 15000,
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
      };

      this.client = new MongoClient(MONGODB_URI, options);

      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      
      console.log('✅ Connected to MongoDB successfully');
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      
      // Provide helpful error information
      if (error.message.includes('SSL') || error.message.includes('TLS')) {
        console.error('🔧 SSL/TLS Issue detected. This is often caused by:');
        console.error('   1. Node.js version compatibility issues');
        console.error('   2. Network/firewall restrictions');
        console.error('   3. MongoDB Atlas SSL configuration');
        console.error('💡 Try running with SKIP_MONGODB=true for development');
      }
      
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  // Collection getters
  getBooksCollection() {
    return this.getDb().collection('books');
  }

  getMediaCollection() {
    return this.getDb().collection('media');
  }

  getAuthorCollection() {
    return this.getDb().collection('author');
  }

  getSettingsCollection() {
    return this.getDb().collection('settings');
  }

  getSocialCollection() {
    return this.getDb().collection('social');
  }

  getUsersCollection() {
    return this.getDb().collection('users');
  }

  getImagesCollection() {
    return this.getDb().collection('images');
  }

  getHomepageConfigCollection() {
    return this.getDb().collection('homepageConfig');
  }

}

// Create a singleton instance
const database = new Database();

export default database; 