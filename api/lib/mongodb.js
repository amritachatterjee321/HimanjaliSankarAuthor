import { MongoClient } from 'mongodb';

// Check if MongoDB URI is available
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'Cluster0';

let client;
let clientPromise;

// Only try to connect if we have a MongoDB URI
if (uri) {
  const options = {
    maxPoolSize: parseInt(process.env.MONGODB_OPTIONS_MAX_POOL_SIZE) || 10,
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_OPTIONS_SERVER_SELECTION_TIMEOUT_MS) || 5000,
    socketTimeoutMS: parseInt(process.env.MONGODB_OPTIONS_SOCKET_TIMEOUT_MS) || 45000,
  };

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // If no MongoDB URI, create a mock client promise that always rejects
  clientPromise = Promise.reject(new Error('MongoDB URI not configured'));
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Export a helper function to check if MongoDB is available
export const isMongoDBAvailable = () => !!uri;

// Export database name
export const getDatabaseName = () => dbName;
