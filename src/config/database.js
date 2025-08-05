import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

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

             this.client = new MongoClient(MONGODB_URI);

      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      
      console.log('✅ Connected to MongoDB successfully');
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
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
}

// Create a singleton instance
const database = new Database();

export default database; 