import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Data file paths
const DATA_DIR = path.join(__dirname, '../../data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const MEDIA_FILE = path.join(DATA_DIR, 'media.json');
const AUTHOR_FILE = path.join(DATA_DIR, 'author.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Helper function to read JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
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
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Authentication middleware (simple token check)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // In production, verify JWT token
  if (token === 'dummy_token') {
    next();
  } else {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Authentication endpoints (no auth required)
router.post('/auth/login', async (req, res) => {
  try {
    const settings = await readJsonFile(SETTINGS_FILE) || {};
    const { username, password } = req.body;

    if (username === settings.username && password === settings.password) {
      res.json({ 
        token: 'dummy_token',
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token === 'dummy_token') {
    res.json({ valid: true });
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Apply authentication to all other CMS routes
router.use(authenticateToken);

// Books API
router.get('/books', async (req, res) => {
  try {
    const books = await readJsonFile(BOOKS_FILE) || [];
    res.json({ books });
  } catch (error) {
    console.error('Error reading books:', error);
    res.status(500).json({ error: 'Failed to load books' });
  }
});

router.post('/books', async (req, res) => {
  try {
    const books = await readJsonFile(BOOKS_FILE) || [];
    const newBook = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    books.push(newBook);
    await writeJsonFile(BOOKS_FILE, books);
    res.status(201).json({ book: newBook });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

router.put('/books/:id', async (req, res) => {
  try {
    const books = await readJsonFile(BOOKS_FILE) || [];
    const bookIndex = books.findIndex(book => book.id === req.params.id);
    
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' });
    }

    books[bookIndex] = {
      ...books[bookIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await writeJsonFile(BOOKS_FILE, books);
    res.json({ book: books[bookIndex] });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

router.delete('/books/:id', async (req, res) => {
  try {
    const books = await readJsonFile(BOOKS_FILE) || [];
    const bookIndex = books.findIndex(book => book.id === req.params.id);
    
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' });
    }

    books.splice(bookIndex, 1);
    await writeJsonFile(BOOKS_FILE, books);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Media API
router.get('/media', async (req, res) => {
  try {
    const media = await readJsonFile(MEDIA_FILE) || [];
    res.json({ media });
  } catch (error) {
    console.error('Error reading media:', error);
    res.status(500).json({ error: 'Failed to load media' });
  }
});

router.post('/media', async (req, res) => {
  try {
    const media = await readJsonFile(MEDIA_FILE) || [];
    const newMedia = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    media.push(newMedia);
    await writeJsonFile(MEDIA_FILE, media);
    res.status(201).json({ media: newMedia });
  } catch (error) {
    console.error('Error creating media:', error);
    res.status(500).json({ error: 'Failed to create media' });
  }
});

router.put('/media/:id', async (req, res) => {
  try {
    const media = await readJsonFile(MEDIA_FILE) || [];
    const mediaIndex = media.findIndex(item => item.id === req.params.id);
    
    if (mediaIndex === -1) {
      return res.status(404).json({ error: 'Media not found' });
    }

    media[mediaIndex] = {
      ...media[mediaIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await writeJsonFile(MEDIA_FILE, media);
    res.json({ media: media[mediaIndex] });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

router.delete('/media/:id', async (req, res) => {
  try {
    const media = await readJsonFile(MEDIA_FILE) || [];
    const mediaIndex = media.findIndex(item => item.id === req.params.id);
    
    if (mediaIndex === -1) {
      return res.status(404).json({ error: 'Media not found' });
    }

    media.splice(mediaIndex, 1);
    await writeJsonFile(MEDIA_FILE, media);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Author API
router.get('/author', async (req, res) => {
  try {
    const author = await readJsonFile(AUTHOR_FILE) || {};
    res.json({ author });
  } catch (error) {
    console.error('Error reading author:', error);
    res.status(500).json({ error: 'Failed to load author' });
  }
});

router.put('/author', async (req, res) => {
  try {
    const author = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await writeJsonFile(AUTHOR_FILE, author);
    res.json({ author });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ error: 'Failed to update author' });
  }
});

// Social Media API
router.get('/social', async (req, res) => {
  try {
    const social = await readJsonFile(path.join(DATA_DIR, 'social.json')) || {};
    res.json({ social });
  } catch (error) {
    console.error('Error reading social:', error);
    res.status(500).json({ error: 'Failed to load social links' });
  }
});

router.put('/social', async (req, res) => {
  try {
    const social = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await writeJsonFile(path.join(DATA_DIR, 'social.json'), social);
    res.json({ social });
  } catch (error) {
    console.error('Error updating social:', error);
    res.status(500).json({ error: 'Failed to update social links' });
  }
});

// Settings API
router.get('/settings', async (req, res) => {
  try {
    const settings = await readJsonFile(SETTINGS_FILE) || {};
    res.json({ settings });
  } catch (error) {
    console.error('Error reading settings:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const settings = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await writeJsonFile(SETTINGS_FILE, settings);
    res.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const books = await readJsonFile(BOOKS_FILE) || [];
    const media = await readJsonFile(MEDIA_FILE) || [];
    
    const stats = {
      totalBooks: books.length,
      totalMedia: media.length,
      siteViews: Math.floor(Math.random() * 1000) + 500, // Mock data
      lastUpdated: new Date().toISOString()
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
});

export default router; 