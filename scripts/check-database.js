import database from '../src/config/database.js';
import cmsService from '../src/services/cmsService.js';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...');
    
    // Connect to database
    await database.connect();
    await cmsService.init();
    
    // Check books
    console.log('\n📚 Checking books...');
    const books = await cmsService.getAllBooks();
    console.log(`Found ${books.length} books:`);
    books.forEach(book => {
      console.log(`- ${book.title} (${book.year})`);
    });
    
    // Check media
    console.log('\n📷 Checking media...');
    const media = await cmsService.getAllMedia();
    console.log(`Found ${media.length} media items:`);
    media.forEach(item => {
      console.log(`- ${item.title} (${item.source})`);
    });
    
    // Check author
    console.log('\n👤 Checking author...');
    const author = await cmsService.getAuthor();
    if (author) {
      console.log(`Author: ${author.name}`);
    } else {
      console.log('No author data found');
    }
    
    // Check social
    console.log('\n🔗 Checking social...');
    const social = await cmsService.getSocial();
    if (social) {
      console.log(`Social links: ${Object.keys(social).length} found`);
    } else {
      console.log('No social data found');
    }
    
    // Check users
    console.log('\n👥 Checking users...');
    const usersCollection = database.getUsersCollection();
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.name})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await database.disconnect();
    console.log('\n✅ Database check completed');
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabase();
}

export default checkDatabase; 