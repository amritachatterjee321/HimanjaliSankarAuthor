import database from '../config/database.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

class CMSService {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await database.connect();
    
    // Initialize sample data if collections are empty
    await this.initializeSampleData();
  }

  async initializeSampleData() {
    try {
      console.log('🔍 Checking if media collection needs sample data...');
      
      // Check if media collection is empty and add sample data
      const mediaCollection = database.getMediaCollection();
      const mediaCount = await mediaCollection.countDocuments();
      
      console.log(`📊 Current media count: ${mediaCount}`);
      
      if (mediaCount === 0) {
        console.log('📝 Initializing sample media data...');
        const sampleMedia = [
          {
            title: 'Sample Book Review - Literary Magazine',
            type: 'review',
            source: 'Literary Magazine',
            url: 'https://example.com/review',
            date: '2024-01-15',
            description: 'A sample book review for testing purposes.',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            title: 'Sample Short Story - Spring Anthology',
            type: 'short-work',
            source: 'Spring Anthology 2024',
            url: 'https://example.com/short-story',
            date: '2024-03-15',
            description: 'A sample short story for testing purposes.',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        const result = await mediaCollection.insertMany(sampleMedia);
        console.log('✅ Sample media data initialized:', result.insertedCount, 'items');
        
        // Verify the data was inserted
        const newCount = await mediaCollection.countDocuments();
        console.log(`📊 New media count: ${newCount}`);
      } else {
        console.log('✅ Media collection already has data, skipping sample initialization');
      }
    } catch (error) {
      console.error('❌ Error initializing sample data:', error);
    }
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
      console.log('CMS Service: Updating book with ID:', id);
      console.log('CMS Service: Update data:', bookData);
      
      // Validate ObjectId format
      if (!ObjectId.isValid(id)) {
        console.error('CMS Service: Invalid ObjectId format:', id);
        throw new Error('Invalid book ID format');
      }
      
      const collection = database.getBooksCollection();
      const updateData = {
        ...bookData,
        updatedAt: new Date()
      };
      
      console.log('CMS Service: Using ObjectId:', new ObjectId(id));
      
      // First update the document
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      console.log('CMS Service: Update result:', updateResult);
      
      if (updateResult.matchedCount === 0) {
        return null; // Book not found
      }
      
      // Then fetch the updated document
      const updatedBook = await collection.findOne({ _id: new ObjectId(id) });
      return updatedBook;
    } catch (error) {
      console.error('CMS Service: Error updating book:', error);
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
      
      // First update the document
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      if (updateResult.matchedCount === 0) {
        return null; // Media not found
      }
      
      // Then fetch the updated document
      const updatedMedia = await collection.findOne({ _id: new ObjectId(id) });
      return updatedMedia;
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
      
      // Get existing author data to preserve fields
      const existingAuthor = await collection.findOne({});
      
      // Prepare update data - preserve existing fields and add new ones
      const updateData = {
        ...existingAuthor, // Preserve all existing fields
        ...authorData,     // Override with new data
        updatedAt: new Date()
      };
      
      // If this is a new author, add creation timestamp
      if (!existingAuthor) {
        updateData.createdAt = new Date();
      }
      
      console.log('🔄 Updating author with data:', updateData);
      
      const result = await collection.findOneAndUpdate(
        {},
        { $set: updateData },
        { upsert: true, returnDocument: 'after' }
      );
      
      console.log('✅ Author update result:', result.value);
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
      const existingSocial = await collection.findOne({});
      
      if (existingSocial) {
        const result = await collection.findOneAndUpdate(
          {},
          { $set: { ...socialData, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
        return result.value;
      } else {
        const newSocial = {
          ...socialData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await collection.insertOne(newSocial);
        return { ...newSocial, _id: result.insertedId };
      }
    } catch (error) {
      console.error('Error updating social:', error);
      throw new Error('Failed to update social');
    }
  }



  // Homepage Configuration operations
  async getHomepageConfig() {
    try {
      const collection = database.getHomepageConfigCollection();
      const config = await collection.findOne({});
      return config || {
        featuredBook: null,
        latestReleaseText: 'LATEST RELEASE'
      };
    } catch (error) {
      console.error('Error fetching homepage config:', error);
      throw new Error('Failed to fetch homepage configuration');
    }
  }

  async updateHomepageConfig(configData) {
    try {
      const collection = database.getHomepageConfigCollection();
      
      // Filter out MongoDB-specific fields and timestamp fields to prevent conflicts
      const { _id, __v, createdAt, updatedAt, homepageBooks, ...cleanConfigData } = configData;
      
      console.log('🔍 Updating homepage config with clean data:', cleanConfigData);
      
      // Use upsert to either update existing or create new
      const result = await collection.findOneAndUpdate(
        {},
        { 
          $set: { ...cleanConfigData, updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() }
        },
        { 
          upsert: true, 
          returnDocument: 'after' 
        }
      );
      
      return result.value;
    } catch (error) {
      console.error('Error updating homepage config:', error);
      throw new Error('Failed to update homepage configuration');
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
      
      // Filter out _id field to prevent MongoDB immutable field error
      const { _id, ...cleanSettingsData } = settingsData;
      
      // Hash password if it's being updated
      const updateData = {
        ...cleanSettingsData,
        updatedAt: new Date()
      };
      
      if (updateData.password) {
        console.log('🔐 Hashing password before saving to database');
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }
      
      console.log('💾 Updating settings in database:', { ...updateData, password: updateData.password ? '[HASHED]' : undefined });
      
      const result = await collection.findOneAndUpdate(
        {},
        { $set: updateData },
        { upsert: true, returnDocument: 'after' }
      );
      
      console.log('✅ Settings updated successfully in database');
      return result.value;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  // User operations
  async getUserByUsername(username) {
    try {
      // For admin users, get credentials from settings collection
      if (username === 'admin') {
        const settingsCollection = database.getSettingsCollection();
        const settings = await settingsCollection.findOne({});
        
        if (settings && settings.username === username) {
          console.log('✅ Found admin user in settings collection');
          return {
            _id: settings._id,
            username: settings.username,
            password: settings.password,
            name: 'Admin User',
            role: 'admin',
            email: settings.adminEmail
          };
        }
      }
      
      // For other users, check users collection
      const collection = database.getUsersCollection();
      const user = await collection.findOne({ username });
      if (user) {
        console.log('✅ Found user in users collection');
        return user;
      }
      
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    
    // Fallback: return default user if database is not available
    if (username === 'admin') {
      console.log('⚠️ Using fallback admin credentials');
      return {
        _id: 'default-admin',
        username: 'admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
        name: 'Admin User',
        role: 'admin'
      };
    }
    
    console.log('❌ User not found:', username);
    return null;
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
      const imagesCollection = database.getImagesCollection();
      
      const [totalBooks, totalMedia, totalImages] = await Promise.all([
        booksCollection.countDocuments(),
        mediaCollection.countDocuments(),
        imagesCollection.countDocuments()
      ]);
      
      return {
        totalBooks,
        totalMedia,
        totalImages,
        siteViews: Math.floor(Math.random() * 1000) + 500, // Mock data for now
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }

  // Images operations
  async getAllImages() {
    try {
      const collection = database.getImagesCollection();
      const images = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return images;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw new Error('Failed to fetch images');
    }
  }

  async getImageById(id) {
    try {
      const collection = database.getImagesCollection();
      const image = await collection.findOne({ _id: new ObjectId(id) });
      return image;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw new Error('Failed to fetch image');
    }
  }

  async createImage(imageData) {
    try {
      const collection = database.getImagesCollection();
      const newImage = {
        ...imageData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newImage);
      return { ...newImage, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating image:', error);
      throw new Error('Failed to create image');
    }
  }

  async updateImage(id, imageData) {
    try {
      const collection = database.getImagesCollection();
      const updateData = {
        ...imageData,
        updatedAt: new Date()
      };
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      console.error('Error updating image:', error);
      throw new Error('Failed to update image');
    }
  }

  async deleteImage(id) {
    try {
      const collection = database.getImagesCollection();
      await collection.deleteOne({ _id: new ObjectId(id) });
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  // Contact operations
  async getContact() {
    try {
      const collection = database.getContactCollection();
      const contact = await collection.findOne({});
      return contact;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw new Error('Failed to fetch contact');
    }
  }

  async updateContact(contactData) {
    try {
      const collection = database.getContactCollection();
      const updateData = {
        ...contactData,
        updatedAt: new Date()
      };
      
      const result = await collection.updateOne(
        {}, // Empty filter to match any document
        { $set: updateData },
        { upsert: true }
      );
      
      return result;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw new Error('Failed to update contact');
    }
  }
}

export default new CMSService(); 