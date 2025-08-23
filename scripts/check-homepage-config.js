import database from '../src/config/database.js';
import cmsService from '../src/services/cmsService.js';

async function checkHomepageConfig() {
  try {
    console.log('🔍 Checking homepage configuration...');
    
    // Connect to database
    await database.connect();
    await cmsService.init();
    
    // Check homepage configuration
    console.log('\n🏠 Checking homepage configuration...');
    const homepageConfig = await cmsService.getHomepageConfig();
    console.log('Homepage config:', JSON.stringify(homepageConfig, null, 2));
    
    // Check if featured book exists
    if (homepageConfig.featuredBook) {
      console.log(`\n📚 Featured book ID: ${homepageConfig.featuredBook}`);
      
      // Try to find the book in the books collection
      const booksCollection = database.getBooksCollection();
      const featuredBook = await booksCollection.findOne({ 
        $or: [
          { _id: homepageConfig.featuredBook },
          { id: homepageConfig.featuredBook }
        ]
      });
      
      if (featuredBook) {
        console.log(`✅ Found featured book: ${featuredBook.title}`);
        console.log(`Book ID: ${featuredBook._id}`);
        console.log(`Book ID (string): ${featuredBook._id?.toString()}`);
      } else {
        console.log('❌ Featured book not found in books collection');
        
        // List all books to see what IDs are available
        const allBooks = await booksCollection.find({}).toArray();
        console.log('\n📚 All books in database:');
        allBooks.forEach(book => {
          console.log(`- ${book.title} (ID: ${book._id}, String ID: ${book._id?.toString()})`);
        });
      }
    } else {
      console.log('❌ No featured book configured');
    }
    
    // Check books collection
    console.log('\n📚 Checking books collection...');
    const books = await cmsService.getAllBooks();
    console.log(`Found ${books.length} books:`);
    books.forEach(book => {
      console.log(`- ${book.title} (ID: ${book._id}, String ID: ${book._id?.toString()})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking homepage configuration:', error);
  } finally {
    await database.disconnect();
    console.log('\n✅ Homepage configuration check completed');
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkHomepageConfig();
}

export default checkHomepageConfig;
