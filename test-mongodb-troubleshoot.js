import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'Cluster0';

console.log('🔧 Troubleshooting MongoDB Atlas Connection...');
console.log('URI:', MONGODB_URI ? 'Set' : 'Not set');
console.log('DB Name:', DB_NAME);

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

async function testConnectionWithOptions(options, description) {
  try {
    console.log(`\n🔄 Testing: ${description}`);
    console.log('Options:', JSON.stringify(options, null, 2));
    
    const client = new MongoClient(MONGODB_URI, options);
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections found:', collections.map(c => c.name));
    
    await client.close();
    console.log('🔌 Connection closed');
    return true;
    
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function troubleshootConnection() {
  const testConfigs = [
    {
      options: {
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 15000,
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
      },
      description: 'SSL/TLS with invalid certs allowed'
    },
    {
      options: {
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 15000,
        ssl: false,
        tls: false,
      },
      description: 'SSL/TLS disabled'
    },
    {
      options: {
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 15000,
        ssl: true,
        tls: true,
        tlsInsecure: true,
      },
      description: 'SSL/TLS insecure mode'
    },
    {
      options: {
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 15000,
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        tlsInsecure: true,
      },
      description: 'SSL/TLS with all security disabled'
    }
  ];

  for (const config of testConfigs) {
    const success = await testConnectionWithOptions(config.options, config.description);
    if (success) {
      console.log('\n🎉 Found working configuration!');
      console.log('Use these options in your database.js:');
      console.log(JSON.stringify(config.options, null, 2));
      return;
    }
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('💡 Possible issues:');
  console.log('   1. Network firewall blocking MongoDB Atlas');
  console.log('   2. Corporate network restrictions');
  console.log('   3. MongoDB Atlas cluster is down');
  console.log('   4. IP whitelist restrictions in Atlas');
}

troubleshootConnection();
