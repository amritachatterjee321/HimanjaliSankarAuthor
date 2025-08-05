import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'Cluster0';

console.log('🔍 Testing MongoDB Connection...');
console.log('Database Name:', DB_NAME);
console.log('Connection URI (masked):', MONGODB_URI ? MONGODB_URI.replace(/\/\/.*@/, '//***:***@') : 'NOT SET');

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect...');
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.code === 8000) {
      console.log('\n🔧 Authentication Error - Check:');
      console.log('1. Username and password are correct');
      console.log('2. User has proper permissions');
      console.log('3. Network access is configured');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Network Error - Check:');
      console.log('1. Cluster name is correct');
      console.log('2. Internet connection is working');
    }
  }
}

testConnection(); 