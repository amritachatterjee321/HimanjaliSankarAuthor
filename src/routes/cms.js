import express from 'express';
import cmsService from '../services/cmsService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Authentication middleware (JWT token check)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Authentication endpoints (no auth required)
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Get user from database
    const user = await cmsService.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Apply authentication to all other CMS routes
router.use(authenticateToken);

// Books API
router.get('/books', async (req, res) => {
  try {
    const books = await cmsService.getAllBooks();
    res.json({ books });
  } catch (error) {
    console.error('Error reading books:', error);
    res.status(500).json({ error: 'Failed to load books' });
  }
});

router.post('/books', async (req, res) => {
  try {
    const newBook = await cmsService.createBook(req.body);
    res.status(201).json({ book: newBook });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

router.put('/books/:id', async (req, res) => {
  try {
    const updatedBook = await cmsService.updateBook(req.params.id, req.body);
    if (!updatedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ book: updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

router.delete('/books/:id', async (req, res) => {
  try {
    await cmsService.deleteBook(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Media API
router.get('/media', async (req, res) => {
  try {
    const media = await cmsService.getAllMedia();
    res.json({ media });
  } catch (error) {
    console.error('Error reading media:', error);
    res.status(500).json({ error: 'Failed to load media' });
  }
});

router.post('/media', async (req, res) => {
  try {
    const newMedia = await cmsService.createMedia(req.body);
    res.status(201).json({ media: newMedia });
  } catch (error) {
    console.error('Error creating media:', error);
    res.status(500).json({ error: 'Failed to create media' });
  }
});

router.put('/media/:id', async (req, res) => {
  try {
    const updatedMedia = await cmsService.updateMedia(req.params.id, req.body);
    if (!updatedMedia) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json({ media: updatedMedia });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

router.delete('/media/:id', async (req, res) => {
  try {
    await cmsService.deleteMedia(req.params.id);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Author API
router.get('/author', async (req, res) => {
  try {
    const author = await cmsService.getAuthor();
    res.json({ author });
  } catch (error) {
    console.error('Error reading author:', error);
    res.status(500).json({ error: 'Failed to load author' });
  }
});

router.put('/author', async (req, res) => {
  try {
    const author = await cmsService.updateAuthor(req.body);
    res.json({ author });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ error: 'Failed to update author' });
  }
});

// Social Media API
router.get('/social', async (req, res) => {
  try {
    const social = await cmsService.getSocial();
    res.json({ social });
  } catch (error) {
    console.error('Error reading social:', error);
    res.status(500).json({ error: 'Failed to load social links' });
  }
});

router.put('/social', async (req, res) => {
  try {
    const social = await cmsService.updateSocial(req.body);
    res.json({ social });
  } catch (error) {
    console.error('Error updating social:', error);
    res.status(500).json({ error: 'Failed to update social links' });
  }
});

// Settings API
router.get('/settings', async (req, res) => {
  try {
    const settings = await cmsService.getSettings();
    res.json({ settings });
  } catch (error) {
    console.error('Error reading settings:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const settings = await cmsService.updateSettings(req.body);
    res.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await cmsService.getDashboardStats();
    res.json({ stats });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
});

export default router; 