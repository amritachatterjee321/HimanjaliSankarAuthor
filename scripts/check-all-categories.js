import database from '../src/config/database.js';

async function checkAllBookCategories() {
  try {
    console.log('🔄 Connecting to database...');
    await database.connect();
    
    const booksCollection = database.getBooksCollection();
    
    console.log('📚 Checking all books and their categories...');
    const allBooks = await booksCollection.find({}).toArray();
    
    console.log(`✅ Found ${allBooks.length} total books:`);
    console.log('');
    
    allBooks.forEach((book, index) => {
      console.log(`${index + 1}. "${book.title}"`);
      console.log(`   ID: ${book._id}`);
      console.log(`   Category: "${book.category}"`);
      console.log(`   Year: ${book.year}`);
      console.log('---');
    });
    
    // Group by category
    const categories = {};
    allBooks.forEach(book => {
      const cat = book.category || 'unknown';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(book.title);
    });
    
    console.log('📊 Books grouped by category:');
    Object.entries(categories).forEach(([category, books]) => {
      console.log(`\n${category.toUpperCase()}:`);
      books.forEach(title => console.log(`  - ${title}`));
    });
    
  } catch (error) {
    console.error('❌ Error checking book categories:', error);
  } finally {
    console.log('\n🔌 Database connection closed');
  }
}

checkAllBookCategories();
