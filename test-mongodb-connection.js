// Test MongoDB connection
import clientPromise, { isMongoDBAvailable, getDatabaseName } from './api/lib/mongodb.js';

async function testMongoDBConnection() {
  console.log('🧪 Testing MongoDB connection...');
  
  try {
    // Check if MongoDB is available
    const available = isMongoDBAvailable();
    console.log('MongoDB available:', available);
    
    if (!available) {
      console.log('❌ MongoDB not available - no MONGODB_URI');
      return;
    }
    
    // Try to connect
    console.log('🔌 Attempting to connect to MongoDB...');
    const client = await clientPromise;
    console.log('✅ MongoDB client connected successfully');
    
    const dbName = getDatabaseName();
    console.log('📊 Database name:', dbName);
    
    const db = client.db(dbName);
    console.log('✅ Database accessed successfully');
    
    // Test homepage config collection
    const configCollection = db.collection('homepageConfig');
    console.log('✅ Homepage config collection accessed');
    
    // Test a simple operation
    const testDoc = await configCollection.findOne({});
    console.log('✅ Test query successful, found:', testDoc ? '1 document' : '0 documents');
    
    console.log('🎉 All MongoDB tests passed!');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

testMongoDBConnection();
