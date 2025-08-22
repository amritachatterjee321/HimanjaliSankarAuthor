import database from '../src/config/database.js';

async function checkYoungAdultBooks() {
  try {
    console.log('🔄 Connecting to database...');
    await database.connect();
    
    const booksCollection = database.getBooksCollection();
    
    console.log('📚 Checking Young Adult books...');
    const yaBooks = await booksCollection.find({ category: 'young-adult' }).toArray();
    
    console.log(`✅ Found ${yaBooks.length} Young Adult books:`);
    yaBooks.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} (ID: ${book._id})`);
      console.log(`   Category: ${book.category}`);
      console.log(`   Year: ${book.year}`);
      console.log(`   Created: ${book.createdAt}`);
      console.log('---');
    });
    
    // Also check all books to see the total count
    const allBooks = await booksCollection.find({}).toArray();
    console.log(`📊 Total books in database: ${allBooks.length}`);
    
    const categories = {};
    allBooks.forEach(book => {
      const cat = book.category || 'unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    console.log('📊 Books by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} books`);
    });
    
  } catch (error) {
    console.error('❌ Error checking Young Adult books:', error);
  } finally {
    console.log('🔌 Database connection closed');
  }
}

checkYoungAdultBooks();
