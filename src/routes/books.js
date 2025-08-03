import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
  latest: {
    id: "latest",
    title: "Echoes of Tomorrow",
    subtitle: "Latest Release",
    genre: "A Novel",
    description: "A compelling exploration of memory, time, and the choices that define us. Set against the backdrop of contemporary India, this novel follows three generations of women as they navigate love, loss, and the enduring power of hope. Through masterful storytelling and rich character development, Sankar weaves a narrative that resonates with universal themes while maintaining cultural authenticity.",
    coverClass: "featured",
    publicationYear: "2024",
    publisher: "Literary Press",
    amazonLink: `https://amazon.com/echoes-tomorrow?tag=${process.env.AMAZON_AFFILIATE_ID}`,
    pages: "324",
    isbn: "978-1234567890",
    awards: ["Rising Voice Literary Award Finalist"],
    reviews: [
      {
        text: "A masterful debut that captures the complexity of human relationships.",
        source: "Publishers Weekly",
        rating: 5
      }
    ]
  }
};

// GET /api/books - Get all books
router.get('/', async (req, res) => {
  try {
    // Read books from CMS data file
    const cmsBooks = await readJsonFile(BOOKS_FILE) || [];
    
    // Transform CMS books to match the expected format
    const transformedBooks = {
      latest: cmsBooks.length > 0 ? {
        id: cmsBooks[0].id,
        title: cmsBooks[0].title,
        subtitle: "Latest Release",
        genre: cmsBooks[0].genre,
        description: cmsBooks[0].description,
        coverClass: "featured",
        publicationYear: cmsBooks[0].year?.toString() || "2024",
        publisher: "Literary Press",
        amazonLink: cmsBooks[0].amazonLink,
        pages: "324",
        isbn: "978-1234567890",
        awards: ["Rising Voice Literary Award Finalist"],
        reviews: [
          {
            text: "A masterful debut that captures the complexity of human relationships.",
            source: "Publishers Weekly",
            rating: 5
          }
        ]
      } : defaultBooksData.latest,
      adults: cmsBooks.filter(book => book.category === 'adults').map(book => ({
        id: book.id,
        title: book.title,
        genre: book.genre,
        coverClass: `adult-${book.id}`,
        year: book.year?.toString() || "2023",
        description: book.description,
        amazonLink: book.amazonLink,
        isbn: "978-1234567891",
        awards: ["Best Short Fiction Collection 2023"]
      })),
      children: cmsBooks.filter(book => book.category === 'children').map(book => ({
        id: book.id,
        title: book.title,
        genre: book.genre,
        coverClass: `children-${book.id}`,
        year: book.year?.toString() || "2023",
        description: book.description,
        amazonLink: book.amazonLink,
        isbn: "978-1234567893",
        ageRange: "6-10 years"
      }))
    };
    
    res.json(transformedBooks);
  } catch (error) {
    console.error('Error reading books:', error);
    res.status(500).json({ error: 'Failed to load books' });
  }
});

// GET /api/books/latest - Get latest book
router.get('/latest', async (req, res) => {
  try {
    const cmsBooks = await readJsonFile(BOOKS_FILE) || [];
    
    if (cmsBooks.length > 0) {
      const latestBook = cmsBooks[0];
      const transformedLatest = {
        id: latestBook.id,
        title: latestBook.title,
        subtitle: "Latest Release",
        genre: latestBook.genre,
        description: latestBook.description,
        coverClass: "featured",
        publicationYear: latestBook.year?.toString() || "2024",
        publisher: "Literary Press",
        amazonLink: latestBook.amazonLink,
        pages: "324",
        isbn: "978-1234567890",
        awards: ["Rising Voice Literary Award Finalist"],
        reviews: [
          {
            text: "A masterful debut that captures the complexity of human relationships.",
            source: "Publishers Weekly",
            rating: 5
          }
        ]
      };
      res.json(transformedLatest);
    } else {
      res.json(defaultBooksData.latest);
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
        isbn: "978-1234567891",
        awards: category === 'adults' ? ["Best Short Fiction Collection 2023"] : undefined,
        ageRange: category === 'children' ? "6-10 years" : undefined
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
    const cmsBooks = await readJsonFile(BOOKS_FILE) || [];
    
    let book = null;
    if (id === 'latest') {
      if (cmsBooks.length > 0) {
        const latestBook = cmsBooks[0];
        book = {
          id: latestBook.id,
          title: latestBook.title,
          subtitle: "Latest Release",
          genre: latestBook.genre,
          description: latestBook.description,
          coverClass: "featured",
          publicationYear: latestBook.year?.toString() || "2024",
          publisher: "Literary Press",
          amazonLink: latestBook.amazonLink,
          pages: "324",
          isbn: "978-1234567890",
          awards: ["Rising Voice Literary Award Finalist"],
          reviews: [
            {
              text: "A masterful debut that captures the complexity of human relationships.",
              source: "Publishers Weekly",
              rating: 5
            }
          ]
        };
      } else {
        book = defaultBooksData.latest;
      }
    } else {
      book = cmsBooks.find(b => b.id.toString() === id);
      if (book) {
        // Transform to match expected format
        book = {
          id: book.id,
          title: book.title,
          genre: book.genre,
          coverClass: `${book.category}-${book.id}`,
          year: book.year?.toString() || "2023",
          description: book.description,
          amazonLink: book.amazonLink,
          isbn: "978-1234567891",
          awards: book.category === 'adults' ? ["Best Short Fiction Collection 2023"] : undefined,
          ageRange: book.category === 'children' ? "6-10 years" : undefined
        };
      }
    }
    
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    console.error('Error reading book by id:', error);
    res.status(500).json({ error: 'Failed to load book' });
  }
});

export default router;
