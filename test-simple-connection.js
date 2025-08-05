import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing Simple MongoDB Connection...');

async function testSimpleConnection() {
  try {
    console.log('🔄 Attempting to connect...');
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    // Test basic operations
    const db = client.db('Cluster0');
    console.log('✅ Database access successful');
    
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections found:', collections.length);
    
    await client.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.code === 8000) {
      console.log('\n🔧 Authentication Error Details:');
      console.log('- Username: amritachatterjee321');
      console.log('- Password contains special characters that may need encoding');
      console.log('- Check MongoDB Atlas Database Access permissions');
      console.log('- Check MongoDB Atlas Network Access settings');
    }
  }
}

testSimpleConnection(); 