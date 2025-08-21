// Test script to verify homepage configuration
import clientPromise, { isMongoDBAvailable, getDatabaseName } from './api/lib/mongodb.js';
import { ObjectId } from 'mongodb';

async function testHomepageConfig() {
  console.log('🧪 Testing homepage configuration...');
  
  try {
    if (!isMongoDBAvailable()) {
      console.log('❌ MongoDB not available');
      return;
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());
    
    // Test homepage config collection
    const configCollection = db.collection('homepageConfig');
    console.log('✅ Homepage config collection accessed');
    
    // Get current config
    const config = await configCollection.findOne({});
    console.log('📋 Current homepage config:', config);
    
    // Test books collection
    const booksCollection = db.collection('books');
    const books = await booksCollection.find({}).toArray();
    console.log(`📚 Found ${books.length} books in database`);
    
    if (books.length > 0) {
      console.log('📖 Sample book:', {
        id: books[0]._id,
        title: books[0].title,
        category: books[0].category
      });
    }
    
    // Test latest book endpoint logic
    if (config && config.featuredBook) {
      console.log('🎯 Featured book ID from config:', config.featuredBook);
      
      const featuredBook = await booksCollection.findOne({ 
        $or: [
          { _id: new ObjectId(config.featuredBook) },
          { id: config.featuredBook }
        ]
      });
      
      if (featuredBook) {
        console.log('✅ Featured book found:', featuredBook.title);
      } else {
        console.log('❌ Featured book not found in books collection');
      }
    } else {
      console.log('⚠️ No featured book configured');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testHomepageConfig();
