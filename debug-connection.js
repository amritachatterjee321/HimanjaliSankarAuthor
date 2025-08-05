import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'Cluster0';

console.log('🔍 Debugging MongoDB Connection...');
console.log('Database Name:', DB_NAME);
console.log('Full Connection URI:', MONGODB_URI);

if (!MONGODB_URI) {
  console.log('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

// Parse the connection string to identify issues
const uriParts = MONGODB_URI.split('@');
if (uriParts.length !== 2) {
  console.log('❌ Invalid connection string format - missing @');
  process.exit(1);
}

const credentials = uriParts[0].replace('mongodb+srv://', '');
const hostPart = uriParts[1];

console.log('\n📋 Connection String Analysis:');
console.log('Credentials part:', credentials);
console.log('Host part:', hostPart);

// Check if database name is in the host part
if (hostPart.includes('/Cluster0')) {
  console.log('✅ Database name found in connection string');
} else {
  console.log('❌ Database name missing from connection string');
  console.log('Expected format: mongodb+srv://username:password@cluster.mongodb.net/Cluster0?retryWrites=true&w=majority');
}

// Check for query parameters
if (hostPart.includes('?')) {
  console.log('✅ Query parameters found');
} else {
  console.log('❌ Query parameters missing');
}

console.log('\n🔧 Recommended Connection String Format:');
console.log('mongodb+srv://username:password@cluster0.fkcljb4.mongodb.net/Cluster0?retryWrites=true&w=majority'); 