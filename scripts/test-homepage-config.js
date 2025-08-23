import database from '../src/config/database.js';

async function testHomepageConfig() {
  try {
    console.log('🔍 Testing homepage configuration data flow...');
    
    // Connect to database
    await database.connect();
    console.log('✅ Connected to MongoDB');
    
    // Check homepage config collection directly
    const homepageConfigCollection = database.getHomepageConfigCollection();
    console.log('📊 Checking homepage config collection...');
    
    const config = await homepageConfigCollection.findOne({});
    console.log('🏠 Raw homepage config from database:', JSON.stringify(config, null, 2));
    
    if (config) {
      console.log('✅ Found homepage config in database');
      console.log('📚 Featured book ID:', config.featuredBook);
      console.log('📝 Latest release text:', config.latestReleaseText);
      
      // Check if featured book exists in books collection
      if (config.featuredBook) {
        const booksCollection = database.getBooksCollection();
        const allBooks = await booksCollection.find({}).toArray();
        
        console.log('\n📚 All books in database:');
        allBooks.forEach(book => {
          console.log(`- ${book.title} (ID: ${book._id}, String ID: ${book._id?.toString()})`);
        });
        
        // Test the string comparison logic
        const featuredBookString = config.featuredBook.toString();
        console.log(`\n🔍 Testing string comparison: "${featuredBookString}"`);
        
        const foundBook = allBooks.find(book => {
          const bookIdString = book._id?.toString() || book._id;
          const matches = bookIdString === featuredBookString;
          console.log(`  Comparing "${bookIdString}" === "${featuredBookString}" = ${matches}`);
          return matches;
        });
        
        if (foundBook) {
          console.log(`✅ Featured book found using string comparison: ${foundBook.title}`);
        } else {
          console.log('❌ Featured book not found using string comparison');
        }
      } else {
        console.log('❌ No featured book configured');
      }
    } else {
      console.log('❌ No homepage config found in database');
    }
    
  } catch (error) {
    console.error('❌ Error testing homepage config:', error);
  } finally {
    await database.disconnect();
    console.log('\n✅ Test completed');
  }
}

// Run the test
testHomepageConfig();
