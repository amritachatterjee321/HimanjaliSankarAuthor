import database from '../src/config/database.js';
import cmsService from '../src/services/cmsService.js';

async function testCMSHomepage() {
  try {
    console.log('🔍 Testing CMS homepage configuration loading...');
    
    // Connect to database
    await database.connect();
    console.log('✅ Connected to MongoDB');
    
    // Test the CMS service directly
    console.log('📊 Testing cmsService.getHomepageConfig()...');
    const homepageConfig = await cmsService.getHomepageConfig();
    console.log('🏠 Homepage config from service:', JSON.stringify(homepageConfig, null, 2));
    
    // Check if the service is returning the expected data
    if (homepageConfig && homepageConfig.featuredBook) {
      console.log('✅ Featured book is configured:', homepageConfig.featuredBook);
      
      // Test getting the featured book from the books collection
      const booksCollection = database.getBooksCollection();
      const featuredBook = await booksCollection.findOne({ 
        _id: homepageConfig.featuredBook 
      });
      
      if (featuredBook) {
        console.log('✅ Featured book found in database:', featuredBook.title);
      } else {
        console.log('❌ Featured book not found in database');
      }
    } else {
      console.log('❌ No featured book configured in homepage config');
    }
    
    // Test the API endpoint logic
    console.log('\n📊 Testing API endpoint logic...');
    const booksCollection = database.getBooksCollection();
    const allBooks = await booksCollection.find({}).toArray();
    
    console.log('📚 All books in database:');
    allBooks.forEach(book => {
      console.log(`- ${book.title} (ID: ${book._id})`);
    });
    
    if (homepageConfig && homepageConfig.featuredBook) {
      const featuredBook = allBooks.find(book => 
        book._id?.toString() === homepageConfig.featuredBook?.toString()
      );
      
      if (featuredBook) {
        console.log('✅ Featured book found using string comparison:', featuredBook.title);
        
        // Test the transformation logic
        const transformedLatest = {
          id: featuredBook._id?.toString() || featuredBook.id,
          title: featuredBook.title,
          subtitle: "Latest Release",
          description: featuredBook.description,
          shortDescription: featuredBook.shortDescription || featuredBook.description?.substring(0, 200),
          year: featuredBook.year,
          genre: featuredBook.genre,
          category: featuredBook.category,
          amazonLink: featuredBook.amazonLink,
          awards: featuredBook.awards || [],
          reviews: featuredBook.reviews || [],
          coverImage: featuredBook.coverImage,
          coverClass: featuredBook.coverClass,
          latestReleaseText: homepageConfig.latestReleaseText || "LATEST RELEASE"
        };
        
        console.log('✅ Transformed featured book data:', JSON.stringify(transformedLatest, null, 2));
      } else {
        console.log('❌ Featured book not found using string comparison');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing CMS homepage:', error);
  } finally {
    await database.disconnect();
    console.log('\n✅ Test completed');
  }
}

// Run the test
testCMSHomepage();
