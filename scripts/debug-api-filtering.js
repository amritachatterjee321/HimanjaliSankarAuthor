import database from '../src/config/database.js';

async function debugApiFiltering() {
  try {
    console.log('🔄 Connecting to database...');
    await database.connect();
    
    const booksCollection = database.getBooksCollection();
    
    console.log('📚 Simulating API filtering logic...');
    const books = await booksCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    console.log(`✅ Loaded ${books.length} books from MongoDB`);
    console.log('');
    
    // Debug each filter
    console.log('🔍 ADULTS FILTER:');
    const adults = books.filter(book => book.category === 'adults');
    console.log(`Found ${adults.length} adults books:`);
    adults.forEach(book => console.log(`  - ${book.title} (category: "${book.category}")`));
    
    console.log('');
    console.log('🔍 CHILDREN FILTER:');
    const children = books.filter(book => book.category === 'children');
    console.log(`Found ${children.length} children books:`);
    children.forEach(book => console.log(`  - ${book.title} (category: "${book.category}")`));
    
    console.log('');
    console.log('🔍 YOUNG-ADULT FILTER:');
    const youngAdult = books.filter(book => book.category === 'young-adult');
    console.log(`Found ${youngAdult.length} young-adult books:`);
    youngAdult.forEach(book => console.log(`  - ${book.title} (category: "${book.category}")`));
    
    console.log('');
    console.log('🔍 ALL CATEGORIES:');
    books.forEach(book => {
      console.log(`  - ${book.title}: category="${book.category}" (type: ${typeof book.category})`);
    });
    
    // Test the exact API transformation
    console.log('');
    console.log('🔍 API TRANSFORMATION RESULT:');
    const transformedBooks = {
      adults: books.filter(book => book.category === 'adults').map(book => ({
        id: book._id?.toString() || book.id,
        title: book.title,
        category: book.category,
      })),
      children: books.filter(book => book.category === 'children').map(book => ({
        id: book._id?.toString() || book.id,
        title: book.title,
        category: book.category,
      })),
      'young-adult': books.filter(book => book.category === 'young-adult').map(book => ({
        id: book._id?.toString() || book.id,
        title: book.title,
        category: book.category,
      }))
    };
    
    console.log('Final result:');
    console.log(`  adults: ${transformedBooks.adults.length} books`);
    console.log(`  children: ${transformedBooks.children.length} books`);
    console.log(`  young-adult: ${transformedBooks['young-adult'].length} books`);
    
  } catch (error) {
    console.error('❌ Error debugging API filtering:', error);
  } finally {
    console.log('\n🔌 Database connection closed');
  }
}

debugApiFiltering();
