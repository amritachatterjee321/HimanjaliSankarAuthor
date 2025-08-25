import database from '../src/config/database.js';
import { ObjectId } from 'mongodb';

const sampleYoungAdultBook = {
  title: "The Midnight Library",
  genre: "Contemporary Fiction",
  year: 2024,
  description: "A coming-of-age story that explores identity, belonging, and the choices that shape our lives. When sixteen-year-old Maya discovers an old library in her new town, she finds herself drawn into a world where every book tells a different version of her story. As she navigates the challenges of adolescence, family dynamics, and first love, Maya learns that the most important story is the one she writes for herself.",
  shortDescription: "A magical coming-of-age story about identity, belonging, and the power of storytelling.",
  amazonLink: "https://amazon.com/midnight-library",
  category: "young-adult",
  createdAt: new Date(),
  publisher: "Young Adult Press",
  pages: "280",
  isbn: "978-1234567894",
  awards: ["Best Young Adult Debut 2024", "Teen Choice Award Nominee"],
  reviews: [
    {
      text: "A beautifully written story that perfectly captures the complexity of teenage emotions and the search for identity.",
      source: "Teen Reads",
      rating: 5
    },
    {
      text: "Sankar's debut YA novel is both magical and grounded, offering readers a story that feels both fantastical and deeply real.",
      source: "YA Book Review",
      rating: 4
    }
  ],
  coverImage: {
            url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    altText: "Cover image for The Midnight Library"
  },
  coverClass: "young-adult-midnight-library"
};

async function addSampleYoungAdultBook() {
  try {
    console.log('🔄 Connecting to database...');
    await database.connect();
    
    const booksCollection = database.getBooksCollection();
    
    console.log('📚 Adding sample Young Adult book...');
    const result = await booksCollection.insertOne(sampleYoungAdultBook);
    
    console.log('✅ Sample Young Adult book added successfully!');
    console.log('📖 Book ID:', result.insertedId);
    console.log('📖 Title:', sampleYoungAdultBook.title);
    console.log('📖 Category:', sampleYoungAdultBook.category);
    
    // Verify the book was added
    const addedBook = await booksCollection.findOne({ _id: result.insertedId });
    console.log('✅ Verification - Book found in database:', addedBook.title);
    
  } catch (error) {
    console.error('❌ Error adding sample Young Adult book:', error);
  } finally {
    await database.close();
    console.log('🔌 Database connection closed');
  }
}

addSampleYoungAdultBook();
