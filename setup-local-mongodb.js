import { MongoClient } from 'mongodb';

const LOCAL_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'Cluster0';

console.log('🔧 Setting up Local MongoDB for Development...');

async function setupLocalMongoDB() {
  try {
    console.log('🔄 Attempting to connect to local MongoDB...');
    
    const client = new MongoClient(LOCAL_URI);
    await client.connect();
    
    console.log('✅ Connected to local MongoDB successfully!');
    
    const db = client.db(DB_NAME);
    
    // Create collections if they don't exist
    const collections = ['books', 'media', 'author', 'settings', 'social', 'users'];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) { // Collection already exists
          console.log(`ℹ️ Collection already exists: ${collectionName}`);
        } else {
          console.log(`⚠️ Issue with collection ${collectionName}:`, error.message);
        }
      }
    }
    
    await client.close();
    console.log('🔌 Local MongoDB setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env file to use: MONGODB_URI=mongodb://127.0.0.1:27017');
    console.log('2. Run: npm run server:dev');
    console.log('3. Run: npm run migrate');
    
  } catch (error) {
    console.error('❌ Failed to connect to local MongoDB:', error.message);
    console.log('\n🔧 To install MongoDB locally:');
    console.log('1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community');
    console.log('2. Install and start the MongoDB service');
    console.log('3. Run this script again');
  }
}

setupLocalMongoDB(); 