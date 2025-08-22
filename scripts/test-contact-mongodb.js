import clientPromise, { isMongoDBAvailable, getDatabaseName } from '../api/lib/mongodb.js';

async function testContactMongoDB() {
  try {
    console.log('🧪 Testing Contact MongoDB Connection...');
    
    // Test MongoDB availability
    if (!isMongoDBAvailable()) {
      console.log('❌ MongoDB not available');
      return;
    }
    
    console.log('✅ MongoDB is available');
    
    // Connect to database
    const client = await clientPromise;
    const dbName = getDatabaseName();
    const db = client.db(dbName);
    const contactCollection = db.collection('contact');
    
    console.log(`📡 Connected to database: ${dbName}`);
    console.log(`📧 Accessing contact collection...`);
    
    // Test reading contact data
    const contact = await contactCollection.findOne({});
    if (contact) {
      console.log('✅ Found existing contact data:');
      console.log(JSON.stringify(contact, null, 2));
    } else {
      console.log('⚠️ No contact data found, creating sample data...');
      
      // Create sample contact data
      const sampleContact = {
        email: 'himanjali@example.com',
        instagram: '@himanjalisankar',
        facebook: 'himanjali.author',
        description: 'I\'d love to hear from you! Whether you have a question about my books, want to discuss a collaboration, or just want to say hello, feel free to reach out.',
        successMessage: 'Thank you for your message! I\'ll get back to you soon.',
        updatedAt: new Date()
      };
      
      const result = await contactCollection.insertOne(sampleContact);
      console.log('✅ Sample contact data created with ID:', result.insertedId);
    }
    
    // Test API endpoint
    console.log('\n🌐 Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/cms?endpoint=contact');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint working:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ API endpoint failed:', response.status);
    }
    
    console.log('\n🎉 Contact MongoDB test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this script is executed directly
if (process.argv[1] && process.argv[1].endsWith('test-contact-mongodb.js')) {
  testContactMongoDB();
}

export default testContactMongoDB;
