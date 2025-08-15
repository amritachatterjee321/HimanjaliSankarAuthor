import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ObjectId } from 'mongodb';
import database from '../config/database.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Data file paths
const DATA_DIR = join(__dirname, '../../data');
const BOOKS_FILE = join(DATA_DIR, 'books.json');
const AUTHOR_FILE = join(DATA_DIR, 'author.json');

// Helper function to read JSON file
async function readJsonFile(filePath) {
  try {
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Default books data structure (fallback when no CMS data exists)
const defaultBooksData = {
  latest: null,
  adults: [],
  children: []
};

// GET /api/books - Get all books
router.get('/', async (req, res) => {
  // Set headers to prevent caching
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    // First, try to get books from MongoDB (CMS data)
    let books = [];
    let featuredBookData = null;
    let homepageBooksData = [];
    
    try {
      const booksCollection = database.getBooksCollection();
      books = await booksCollection.find({}).sort({ createdAt: -1 }).toArray();
      
      // Get homepage configuration from CMS
    try {
      const homepageConfigCollection = database.getHomepageConfigCollection();
      const homepageConfig = await homepageConfigCollection.findOne({});
      
        if (homepageConfig) {
          console.log('✅ Found homepage configuration from CMS:', {
            featuredBook: homepageConfig.featuredBook,
            homepageBooks: homepageConfig.homepageBooks?.length || 0
          });
          
          // Get featured book
          if (homepageConfig.featuredBook) {
            const featuredBook = books.find(book => 
              book._id?.toString() === homepageConfig.featuredBook || 
              book.id === homepageConfig.featuredBook
            );
        
        if (featuredBook) {
              console.log('✅ Found featured book from CMS config:', featuredBook.title);
          featuredBookData = {
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
                coverClass: featuredBook.coverClass
                };
              } else {
              console.log('⚠️ Featured book from CMS config not found in books collection');
            }
          }
          
          // Get homepage books in the order specified by CMS
          if (homepageConfig.homepageBooks && Array.isArray(homepageConfig.homepageBooks)) {
            homepageBooksData = homepageConfig.homepageBooks
              .map(bookId => {
                const book = books.find(b => 
                  b._id?.toString() === bookId || 
                  b.id === bookId
                );
                return book;
              })
              .filter(book => book) // Remove any undefined books
              .map(book => ({
                id: book._id?.toString() || book.id,
                title: book.title,
                year: book.year,
                genre: book.genre,
                category: book.category,
                description: book.description,
                shortDescription: book.shortDescription,
                amazonLink: book.amazonLink,
                awards: book.awards || [],
                coverImage: book.coverImage,
                coverClass: book.coverClass
              }));
            
            console.log(`✅ Loaded ${homepageBooksData.length} homepage books from CMS config`);
          }
        } else {
          console.log('⚠️ No homepage configuration found in CMS');
        }
      } catch (error) {
        console.log('⚠️ Error accessing homepage configuration:', error.message);
      }
      
      console.log(`✅ Loaded ${books.length} books from MongoDB`);
    } catch (error) {
      console.log('⚠️ MongoDB not available, falling back to file data');
      // Fallback to JSON file
      books = await readJsonFile(BOOKS_FILE) || [];
    }
    
    // Transform CMS books to match the expected format
    const transformedBooks = {
      latest: featuredBookData || null,
      homepageBooks: homepageBooksData.length > 0 ? homepageBooksData : [], // Direct access to homepage books
      adults: books.filter(book => book.category === 'adults').map(book => ({
        id: book._id?.toString() || book.id,
        title: book.title,
        year: book.year,
        genre: book.genre,
        category: book.category,
        description: book.description,
        shortDescription: book.shortDescription,
        amazonLink: book.amazonLink,
        awards: book.awards || [],
        coverImage: book.coverImage,
        coverClass: book.coverClass
      })),
      children: books.filter(book => book.category === 'children').map(book => ({
        id: book._id?.toString() || book.id,
        title: book.title,
        year: book.year,
        genre: book.genre,
        category: book.category,
        description: book.description,
        shortDescription: book.shortDescription,
        amazonLink: book.amazonLink,
        awards: book.awards || [],
        coverImage: book.coverImage,
        coverClass: book.coverClass
      }))
    };
    
    res.json(transformedBooks);
  } catch (error) {
    console.error('Error reading books:', error);
    res.status(500).json({ error: 'Failed to load books' });
  }
});

// GET /api/books/latest - Get latest/featured book
router.get('/latest', async (req, res) => {
  // Set headers to prevent caching
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    // First try to get featured book from CMS homepage configuration
    try {
      console.log('🔄 Attempting to fetch featured book from CMS homepage configuration...');
      const homepageConfigCollection = database.getHomepageConfigCollection();
      const homepageConfig = await homepageConfigCollection.findOne({});
      
      if (homepageConfig && homepageConfig.featuredBook) {
        // Get the featured book from the books collection
        const booksCollection = database.getBooksCollection();
        const featuredBook = await booksCollection.findOne({ 
          $or: [
            { _id: new ObjectId(homepageConfig.featuredBook) },
            { id: homepageConfig.featuredBook }
          ]
        });
        
        if (featuredBook) {
          console.log('✅ Using CMS homepage config for featured book:', featuredBook.title);
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
            coverClass: featuredBook.coverClass
          };
          return res.json(transformedLatest);
        } else {
          console.log('❌ Featured book from CMS config not found in books collection');
        }
      } else {
        console.log('❌ No featured book configured in CMS homepage config');
      }
    } catch (error) {
      console.error('❌ Error accessing CMS homepage configuration:', error.message);
      console.log('🔄 Falling back to books collection');
    }
    
    // Fallback to file-based data
    console.log('📖 Using fallback file data');
    const cmsBooks = await readJsonFile(BOOKS_FILE) || [];
    
    if (cmsBooks.length > 0) {
      const latestBook = cmsBooks[0];
      const transformedLatest = {
        id: latestBook.id,
        title: latestBook.title,
        subtitle: "Latest Release",
        description: latestBook.description,
        shortDescription: latestBook.shortDescription,
        publicationYear: latestBook.year?.toString() || "2024",
        publisher: "Literary Press",
        amazonLink: latestBook.amazonLink,
        pages: "324",
        isbn: "978-1234567890",
        awards: latestBook.awards || ["Rising Voice Literary Award Finalist"],
        reviews: latestBook.reviews && Array.isArray(latestBook.reviews) && latestBook.reviews.length > 0 ? latestBook.reviews.map(review => {
          if (typeof review === 'string' && review.includes(' - ')) {
            const parts = review.split(' - ');
            return {
              text: parts[0] || review,
              source: parts[1] || "Literary Review",
              rating: 5
            };
          } else {
            return {
              text: review || "Review text",
              source: "Literary Review",
              rating: 5
            };
          }
        }) : [
          {
            text: "A masterful debut that captures the complexity of human relationships.",
            source: "Publishers Weekly",
            rating: 5
          }
        ]
      };
      res.json(transformedLatest);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Error reading latest book:', error);
    res.status(500).json({ error: 'Failed to load latest book' });
  }
});

// GET /api/books/category/:category - Get books by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const cmsBooks = await readJsonFile(BOOKS_FILE) || [];
    
    if (category === 'adults' || category === 'children') {
              const categoryBooks = cmsBooks.filter(book => book.category === category).map(book => ({
          id: book.id,
          title: book.title,
          genre: book.genre,
          coverClass: `${category}-${book.id}`,
          year: book.year?.toString() || "2023",
          description: book.description,
          amazonLink: book.amazonLink,
          isbn: book.isbn || "978-1234567891",
          awards: book.awards || (category === 'adults' ? ["Best Short Fiction Collection 2023"] : undefined),
          ageRange: book.ageRange || (category === 'children' ? "6-10 years" : undefined)
        }));
      res.json(categoryBooks);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error reading books by category:', error);
    res.status(500).json({ error: 'Failed to load books by category' });
  }
});

// GET /api/books/:id - Get specific book
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Looking for book with ID:', id);
    
    let book = null;
    
    if (id === 'latest') {
      // Get featured book from CMS
      try {
        const booksCollection = database.getBooksCollection();
        const featuredBook = await booksCollection.findOne({ featured: true });
        
        if (featuredBook) {
          book = {
            id: featuredBook._id.toString(),
            title: featuredBook.title,
            subtitle: "Latest Release",
            genre: featuredBook.genre || "Fiction",
            description: featuredBook.description || "A compelling featured book from Himanjali Sankar.",
            coverClass: featuredBook.coverClass || "featured",
            publicationYear: featuredBook.year?.toString() || "2024",
            publisher: "Literary Press",
            amazonLink: featuredBook.amazonLink || "#",
            pages: "324",
            isbn: "978-1234567890",
            awards: ["Rising Voice Literary Award Finalist"],
            reviews: [
              {
                text: "A masterful debut that captures the complexity of human relationships.",
                source: "Publishers Weekly",
                rating: 5
              }
            ],
            coverImage: featuredBook.coverImage
          };
        }
      } catch (cmsError) {
        console.error('Error fetching featured book from CMS:', cmsError);
      }
      
      // Fallback to static data if CMS fails
      if (!book) {
        const cmsBooks = await readJsonFile(BOOKS_FILE) || [];
        if (cmsBooks.length > 0) {
          const latestBook = cmsBooks[0];
          book = {
            id: latestBook.id,
            title: latestBook.title,
            subtitle: "Latest Release",
            description: latestBook.description,
            shortDescription: latestBook.shortDescription,
            publicationYear: latestBook.year?.toString() || "2024",
            publisher: "Literary Press",
            amazonLink: latestBook.amazonLink,
            pages: "324",
            isbn: "978-1234567890",
            awards: latestBook.awards || ["Rising Voice Literary Award Finalist"],
            reviews: latestBook.reviews && Array.isArray(latestBook.reviews) && latestBook.reviews.length > 0 ? latestBook.reviews.map(review => {
              if (typeof review === 'string' && review.includes(' - ')) {
                const parts = review.split(' - ');
                return {
                  text: parts[0] || review,
                  source: parts[1] || "Literary Review",
                  rating: 5
                };
              } else {
                return {
                  text: review || "Review text",
                  source: "Literary Review",
                  rating: 5
                };
              }
            }) : [
              {
                text: "A masterful debut that captures the complexity of human relationships.",
                source: "Publishers Weekly",
                rating: 5
              }
            ]
          };
        }
      }
    } else {
      // First try to find book in books collection (CMS data)
      try {
        const booksCollection = database.getBooksCollection();
        
        // Validate ObjectId format
        let cmsBook = null;
        try {
          if (ObjectId.isValid(id)) {
            cmsBook = await booksCollection.findOne({ _id: new ObjectId(id) });
          } else {
            console.log('⚠️ Invalid ObjectId format:', id);
            // Try to find by string ID as fallback
            cmsBook = await booksCollection.findOne({ id: id });
          }
        } catch (objectIdError) {
          console.log('⚠️ ObjectId conversion failed, trying string ID:', objectIdError.message);
          cmsBook = await booksCollection.findOne({ id: id });
        }
        
        if (cmsBook) {
          console.log('✅ Found book in CMS:', cmsBook.title);
          book = {
            id: cmsBook._id.toString(),
            title: cmsBook.title,
            subtitle: cmsBook.category === 'children' ? "Children's Fiction" : "Adult Fiction",
            description: cmsBook.description || "A compelling story from Himanjali Sankar.",
            shortDescription: cmsBook.shortDescription,
            publicationYear: cmsBook.year?.toString() || "2024",
            publisher: "Literary Press",
            amazonLink: cmsBook.amazonLink || "#",
            pages: "324",
            isbn: "978-1234567891",
            awards: cmsBook.awards || ["Rising Voice Literary Award Finalist"],
            ageRange: cmsBook.category === 'children' ? "6-10 years" : undefined,
            reviews: cmsBook.reviews && Array.isArray(cmsBook.reviews) && cmsBook.reviews.length > 0 ? cmsBook.reviews.map(review => {
              if (typeof review === 'string' && review.includes(' - ')) {
                const parts = review.split(' - ');
                return {
                  text: parts[0] || review,
                  source: parts[1] || "Literary Review",
                  rating: 5
                };
              } else {
                return {
                  text: review || "Review text",
                  source: "Literary Review",
                  rating: 5
                };
              }
            }) : [
              {
                text: "A compelling narrative that showcases the author's storytelling prowess.",
                source: "Literary Review",
                rating: 5
              }
            ],
            coverImage: cmsBook.coverImage
          };
        }
      } catch (cmsError) {
        console.error('Error fetching from CMS:', cmsError);
      }
      
      // Fallback to static JSON data if not found in CMS
      if (!book) {
        const cmsBooks = await readJsonFile(BOOKS_FILE) || [];
        book = cmsBooks.find(b => b.id === id);
        if (book) {
          // Return the complete book data structure
          book = {
            id: book.id,
            title: book.title,
            subtitle: book.category === 'children' ? "Children's Fiction" : "Adult Fiction",
            description: book.description,
            shortDescription: book.shortDescription,
            publicationYear: book.year?.toString() || "2023",
            publisher: book.publisher || "Literary Press",
            amazonLink: book.amazonLink,
            pages: book.pages?.toString() || "324",
            isbn: book.isbn || "978-1234567891",
            awards: book.awards || (book.category === 'adults' ? ["Best Short Fiction Collection 2023"] : undefined),
            ageRange: book.ageRange || (book.category === 'children' ? "6-10 years" : undefined),
            reviews: book.reviews || []
          };
        }
      }
    }
    
    if (book) {
      console.log('✅ Returning book data for:', book.title);
      res.json(book);
    } else {
      console.log('❌ Book not found for ID:', id);
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    console.error('Error reading book by id:', error);
    res.status(500).json({ error: 'Failed to load book' });
  }
});

export default router;
