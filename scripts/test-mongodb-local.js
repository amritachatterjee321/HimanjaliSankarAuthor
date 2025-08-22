const { MongoClient } = require('mongodb');

// Local MongoDB connection string
const MONGODB_URI = 'mongodb://admin:password123@localhost:27017/himanjali?authSource=admin';
const DB_NAME = 'himanjali';

async function testMongoDBConnection() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('🔌 Testing MongoDB connection...');
        
        // Connect to MongoDB
        await client.connect();
        console.log('✅ Connected to MongoDB successfully!');
        
        // Get database
        const db = client.db(DB_NAME);
        console.log(`📊 Using database: ${DB_NAME}`);
        
        // Test collections
        const collections = await db.listCollections().toArray();
        console.log('\n📚 Available collections:');
        collections.forEach(collection => {
            console.log(`  - ${collection.name}`);
        });
        
        // Test data retrieval
        console.log('\n🔍 Testing data retrieval...');
        
        // Test books collection
        const booksCount = await db.collection('books').countDocuments();
        console.log(`📖 Books count: ${booksCount}`);
        
        if (booksCount > 0) {
            const sampleBook = await db.collection('books').findOne();
            console.log(`📖 Sample book: ${sampleBook.title} (${sampleBook.year})`);
        }
        
        // Test media collection
        const mediaCount = await db.collection('media').countDocuments();
        console.log(`📰 Media count: ${mediaCount}`);
        
        // Test social collection
        const socialCount = await db.collection('social').countDocuments();
        console.log(`🔗 Social links count: ${socialCount}`);
        
        // Test author collection
        const authorCount = await db.collection('author').countDocuments();
        console.log(`👤 Author records count: ${authorCount}`);
        
        // Test settings collection
        const settingsCount = await db.collection('settings').countDocuments();
        console.log(`⚙️ Settings records count: ${settingsCount}`);
        
        console.log('\n✅ All tests passed! MongoDB is working correctly.');
        
    } catch (error) {
        console.error('❌ MongoDB connection test failed:');
        console.error(error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Make sure MongoDB is running:');
            console.log('   Run: scripts\\mongodb-local.bat start');
        } else if (error.message.includes('Authentication failed')) {
            console.log('\n💡 Check your credentials in the connection string');
        }
        
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n🔌 Connection closed.');
    }
}

// Run the test
testMongoDBConnection();
