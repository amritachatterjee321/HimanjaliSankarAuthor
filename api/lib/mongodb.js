import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// Export a helper function to check if MongoDB is available
export const isMongoDBAvailable = () => {
  const available = !!uri;
  console.log('🔍 MongoDB Availability Check:');
  console.log('  - MONGODB_URI exists:', !!uri);
  console.log('  - URI length:', uri ? uri.length : 0);
  console.log('  - Available:', available);
  return available;
};

// Export database name
export const getDatabaseName = () => {
  const dbName = process.env.DB_NAME || 'Cluster0';
  console.log('🔍 Database Name Check:');
  console.log('  - DB_NAME env var:', process.env.DB_NAME);
  console.log('  - Using database name:', dbName);
  return dbName;
};
