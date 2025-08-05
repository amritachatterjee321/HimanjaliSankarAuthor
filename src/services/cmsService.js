import database from '../config/database.js';
import { ObjectId } from 'mongodb';

class CMSService {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await database.connect();
  }

  // Books operations
  async getAllBooks() {
    try {
      const collection = database.getBooksCollection();
      const books = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return books;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw new Error('Failed to fetch books');
    }
  }

  async getBookById(id) {
    try {
      const collection = database.getBooksCollection();
      const book = await collection.findOne({ _id: new ObjectId(id) });
      return book;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw new Error('Failed to fetch book');
    }
  }

  async createBook(bookData) {
    try {
      const collection = database.getBooksCollection();
      const newBook = {
        ...bookData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newBook);
      return { ...newBook, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating book:', error);
      throw new Error('Failed to create book');
    }
  }

  async updateBook(id, bookData) {
    try {
      const collection = database.getBooksCollection();
      const updateData = {
        ...bookData,
        updatedAt: new Date()
      };
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      console.error('Error updating book:', error);
      throw new Error('Failed to update book');
    }
  }

  async deleteBook(id) {
    try {
      const collection = database.getBooksCollection();
      await collection.deleteOne({ _id: new ObjectId(id) });
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw new Error('Failed to delete book');
    }
  }

  // Media operations
  async getAllMedia() {
    try {
      const collection = database.getMediaCollection();
      const media = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return media;
    } catch (error) {
      console.error('Error fetching media:', error);
      throw new Error('Failed to fetch media');
    }
  }

  async getMediaById(id) {
    try {
      const collection = database.getMediaCollection();
      const media = await collection.findOne({ _id: new ObjectId(id) });
      return media;
    } catch (error) {
      console.error('Error fetching media:', error);
      throw new Error('Failed to fetch media');
    }
  }

  async createMedia(mediaData) {
    try {
      const collection = database.getMediaCollection();
      const newMedia = {
        ...mediaData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newMedia);
      return { ...newMedia, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating media:', error);
      throw new Error('Failed to create media');
    }
  }

  async updateMedia(id, mediaData) {
    try {
      const collection = database.getMediaCollection();
      const updateData = {
        ...mediaData,
        updatedAt: new Date()
      };
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      console.error('Error updating media:', error);
      throw new Error('Failed to update media');
    }
  }

  async deleteMedia(id) {
    try {
      const collection = database.getMediaCollection();
      await collection.deleteOne({ _id: new ObjectId(id) });
      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Failed to delete media');
    }
  }

  // Author operations
  async getAuthor() {
    try {
      const collection = database.getAuthorCollection();
      const author = await collection.findOne({});
      return author;
    } catch (error) {
      console.error('Error fetching author:', error);
      throw new Error('Failed to fetch author');
    }
  }

  async updateAuthor(authorData) {
    try {
      const collection = database.getAuthorCollection();
      const updateData = {
        ...authorData,
        updatedAt: new Date()
      };
      
      const result = await collection.findOneAndUpdate(
        {},
        { $set: updateData },
        { upsert: true, returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      console.error('Error updating author:', error);
      throw new Error('Failed to update author');
    }
  }

  // Social media operations
  async getSocial() {
    try {
      const collection = database.getSocialCollection();
      const social = await collection.findOne({});
      return social;
    } catch (error) {
      console.error('Error fetching social:', error);
      throw new Error('Failed to fetch social');
    }
  }

  async updateSocial(socialData) {
    try {
      const collection = database.getSocialCollection();
      const updateData = {
        ...socialData,
        updatedAt: new Date()
      };
      
      const result = await collection.findOneAndUpdate(
        {},
        { $set: updateData },
        { upsert: true, returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      console.error('Error updating social:', error);
      throw new Error('Failed to update social');
    }
  }

  // Settings operations
  async getSettings() {
    try {
      const collection = database.getSettingsCollection();
      const settings = await collection.findOne({});
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings');
    }
  }

  async updateSettings(settingsData) {
    try {
      const collection = database.getSettingsCollection();
      const updateData = {
        ...settingsData,
        updatedAt: new Date()
      };
      
      const result = await collection.findOneAndUpdate(
        {},
        { $set: updateData },
        { upsert: true, returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  // User operations
  async getUserByUsername(username) {
    try {
      const collection = database.getUsersCollection();
      const user = await collection.findOne({ username });
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async createUser(userData) {
    try {
      const collection = database.getUsersCollection();
      const newUser = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newUser);
      return { ...newUser, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Dashboard stats
  async getDashboardStats() {
    try {
      const booksCollection = database.getBooksCollection();
      const mediaCollection = database.getMediaCollection();
      
      const [totalBooks, totalMedia] = await Promise.all([
        booksCollection.countDocuments(),
        mediaCollection.countDocuments()
      ]);
      
      return {
        totalBooks,
        totalMedia,
        siteViews: Math.floor(Math.random() * 1000) + 500, // Mock data for now
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }
}

export default new CMSService(); 