import database from '../src/config/database.js';
import cmsService from '../src/services/cmsService.js';

async function testIdComparison() {
  try {
    console.log('🔍 Testing ID comparison between featured book and books collection...');
    
    // Connect to database
    await database.connect();
    console.log('✅ Connected to MongoDB');
    
    // Get homepage config
    const homepageConfig = await cmsService.getHomepageConfig();
    console.log('🏠 Homepage config:', {
      featuredBook: homepageConfig.featuredBook,
      featuredBookType: typeof homepageConfig.featuredBook,
      featuredBookLength: homepageConfig.featuredBook?.length
    });
    
    // Get all books
    const booksCollection = database.getBooksCollection();
    const allBooks = await booksCollection.find({}).toArray();
    
    console.log('\n📚 Books in database:');
    allBooks.forEach(book => {
      console.log(`- ${book.title}:`);
      console.log(`  _id: ${book._id} (type: ${typeof book._id})`);
      console.log(`  _id.toString(): ${book._id?.toString()} (type: ${typeof book._id?.toString()})`);
      console.log(`  id: ${book.id} (type: ${typeof book.id})`);
    });
    
    // Test exact comparison
    console.log('\n🔍 Testing exact comparisons:');
    const featuredBookId = homepageConfig.featuredBook;
    
    allBooks.forEach(book => {
      const bookIdString = book._id?.toString();
      const exactMatch = bookIdString === featuredBookId;
      const looseMatch = book._id == featuredBookId; // Using == for type coercion
      
      console.log(`\n${book.title}:`);
      console.log(`  Featured book ID: "${featuredBookId}" (type: ${typeof featuredBookId})`);
      console.log(`  Book _id.toString(): "${bookIdString}" (type: ${typeof bookIdString})`);
      console.log(`  Exact match (===): ${exactMatch}`);
      console.log(`  Loose match (==): ${looseMatch}`);
      
      if (exactMatch) {
        console.log(`  ✅ EXACT MATCH FOUND: ${book.title}`);
      }
    });
    
    // Test the CMS logic
    console.log('\n🔍 Testing CMS comparison logic:');
    const cmsBooks = allBooks.map(book => {
      const bookWithConsistentId = {
        ...book,
        _id: book._id || book.id,
        id: book._id || book.id
      };
      if (bookWithConsistentId._id) {
        bookWithConsistentId._id = bookWithConsistentId._id.toString();
      }
      return bookWithConsistentId;
    });
    
    console.log('📚 Books after CMS processing:');
    cmsBooks.forEach(book => {
      console.log(`- ${book.title}: _id = "${book._id}" (type: ${typeof book._id})`);
    });
    
    // Test CMS find logic
    const featuredBook = cmsBooks.find(book => {
      const bookId = book._id || book.id;
      const bookIdString = bookId?.toString() || bookId;
      const matches = bookIdString === homepageConfig.featuredBook;
      console.log(`  Comparing "${bookIdString}" === "${homepageConfig.featuredBook}" = ${matches}`);
      return matches;
    });
    
    if (featuredBook) {
      console.log(`✅ CMS logic found featured book: ${featuredBook.title}`);
    } else {
      console.log('❌ CMS logic did not find featured book');
    }
    
  } catch (error) {
    console.error('❌ Error testing ID comparison:', error);
  } finally {
    await database.disconnect();
    console.log('\n✅ Test completed');
  }
}

// Run the test
testIdComparison();
