import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'Cluster0';

console.log('🔧 Testing MongoDB Atlas Connection with SSL Fixes...');
console.log('Original URI:', MONGODB_URI ? 'Set' : 'Not set');
console.log('DB Name:', DB_NAME);

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

// Test different connection string modifications
const testURIs = [
  {
    uri: MONGODB_URI + '?ssl=false&tls=false',
    description: 'SSL/TLS disabled via query params'
  },
  {
    uri: MONGODB_URI + '?ssl=false&tls=false&tlsAllowInvalidCertificates=true',
    description: 'SSL/TLS disabled + invalid certs allowed'
  },
  {
    uri: MONGODB_URI.replace('mongodb+srv://', 'mongodb://') + '?ssl=false&tls=false',
    description: 'Using mongodb:// instead of mongodb+srv://'
  }
];

async function testConnectionWithURI(uri, description) {
  const options = {
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 20000,
    ssl: false,
    tls: false,
  };

  try {
    console.log(`\n🔄 Testing: ${description}`);
    console.log('URI:', uri);
    
    const client = new MongoClient(uri, options);
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections found:', collections.map(c => c.name));
    
    await client.close();
    console.log('🔌 Connection closed');
    return { success: true, uri, options };
    
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllURIs() {
  for (const test of testURIs) {
    const result = await testConnectionWithURI(test.uri, test.description);
    if (result.success) {
      console.log('\n🎉 Found working configuration!');
      console.log('Working URI:', result.uri);
      console.log('Working options:', JSON.stringify(result.options, null, 2));
      console.log('\n💡 Update your .env file with this working URI');
      return result;
    }
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('💡 This suggests a deeper network connectivity issue:');
  console.log('   1. Check if MongoDB Atlas cluster is accessible');
  console.log('   2. Verify IP whitelist in MongoDB Atlas dashboard');
  console.log('   3. Check corporate firewall/proxy settings');
  console.log('   4. Try connecting from a different network');
  
  return null;
}

testAllURIs();
