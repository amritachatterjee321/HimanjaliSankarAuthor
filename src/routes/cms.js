import express from 'express';
import cmsService from '../services/cmsService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('🔍 Multer fileFilter checking file:', file.originalname, 'MIME type:', file.mimetype);
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      console.log('✅ File accepted by multer');
      cb(null, true);
    } else {
      console.log('❌ File rejected by multer:', file.mimetype);
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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
    
    // Development fallback: allow admin/admin123 without database (development only)
    if (username === 'admin' && password === 'admin123' && process.env.NODE_ENV === 'development') {
      const token = jwt.sign(
        { userId: 'default-admin', username: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({ 
        token,
        user: {
          id: 'default-admin',
          username: 'admin',
          name: 'Admin User'
        },
        message: 'Login successful (development mode)'
      });
      return;
    }
    
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

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  console.log('🔍 Error middleware caught:', error.message);
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  next(error);
});

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
    console.log('Updating book with ID:', req.params.id);
    console.log('Update data:', req.body);
    const updatedBook = await cmsService.updateBook(req.params.id, req.body);
    if (!updatedBook) {
      console.log('Book not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Book not found' });
    }
    console.log('Book updated successfully:', updatedBook);
    res.json({ book: updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Book Cover Image Upload
router.post('/books/:id/cover', authenticateToken, upload.single('coverImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No cover image file provided' });
    }

    const bookId = req.params.id;
    const imageData = {
      title: `Cover for book ${bookId}`,
      category: 'book-covers',
      description: 'Book cover image',
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    // Create the image record
    const image = await cmsService.createImage(imageData);
    
    // Update the book with the cover image URL
    const updatedBook = await cmsService.updateBook(bookId, {
      coverImage: {
        url: image.url,
        filename: image.filename,
        originalName: image.originalName
      }
    });

    res.json({ 
      message: 'Book cover uploaded successfully',
      book: updatedBook,
      image: image
    });
  } catch (error) {
    console.error('Error uploading book cover:', error);
    res.status(500).json({ error: 'Failed to upload book cover' });
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
router.get('/author', authenticateToken, async (req, res) => {
  try {
    const author = await cmsService.getAuthor();
    res.json({ author });
  } catch (error) {
    console.error('Error reading author:', error);
    res.status(500).json({ error: 'Failed to load author' });
  }
});

router.put('/author', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Received author update request:', req.body);
    const author = await cmsService.updateAuthor(req.body);
    console.log('✅ Author updated successfully:', author);
    res.json({ author });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ error: 'Failed to update author' });
  }
});

// Author Image Upload
router.post('/author/image', authenticateToken, upload.single('authorImage'), async (req, res) => {
  try {
    console.log('🖼️ Author image upload request received');
    console.log('📁 File details:', req.file);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No author image file provided' });
    }

    // Additional validation to ensure it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      console.log('❌ Invalid file type:', req.file.mimetype);
      return res.status(400).json({ error: 'Only image files are allowed' });
    }
    
    console.log('✅ File validation passed');

    const imageData = {
      title: 'Author Image',
      category: 'author-images',
      description: 'Author profile image',
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    // Create the image record
    const image = await cmsService.createImage(imageData);
    
    // Update the author with the image URL
    console.log('🖼️ Updating author with image data:', {
      url: image.url,
      filename: image.filename,
      originalName: image.originalName
    });
    
    const updatedAuthor = await cmsService.updateAuthor({
      image: {
        url: image.url,
        filename: image.filename,
        originalName: image.originalName
      }
    });

    res.json({ 
      message: 'Author image uploaded successfully',
      author: updatedAuthor,
      image: image
    });
  } catch (error) {
    console.error('Error uploading author image:', error);
    res.status(500).json({ error: 'Failed to upload author image' });
  }
});

// Error handler for multer errors in author image upload
router.use('/author/image', (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.log('❌ Multer error:', error.message);
    return res.status(400).json({ error: 'File upload error: ' + error.message });
  } else if (error.message === 'Only image files are allowed!') {
    console.log('❌ File type error:', error.message);
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  next(error);
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

// Contact Info API
router.get('/contact', authenticateToken, async (req, res) => {
  try {
    const contact = await cmsService.getContact();
    res.json({ contact });
  } catch (error) {
    console.error('Error reading contact info:', error);
    res.status(500).json({ error: 'Failed to load contact info' });
  }
});

router.put('/contact', authenticateToken, async (req, res) => {
  try {
    const contact = await cmsService.updateContact(req.body);
    res.json({ contact });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ error: 'Failed to update contact info' });
  }
});



// Homepage Configuration API
router.get('/homepage-config', authenticateToken, async (req, res) => {
  try {
    console.log('🏠 Homepage config API called by user:', req.user?.username);
    const homepageConfig = await cmsService.getHomepageConfig();
    console.log('🏠 Homepage config retrieved:', {
      featuredBook: homepageConfig?.featuredBook,
      latestReleaseText: homepageConfig?.latestReleaseText
    });
    res.json({ homepageConfig });
  } catch (error) {
    console.error('Error fetching homepage config:', error);
    res.status(500).json({ error: 'Failed to fetch homepage configuration' });
  }
});

router.put('/homepage-config', authenticateToken, async (req, res) => {
  try {
    console.log('🏠 Received homepage config update request:', req.body);
    const result = await cmsService.updateHomepageConfig(req.body);
    res.json({ 
      message: 'Homepage configuration updated successfully',
      homepageConfig: result 
    });
  } catch (error) {
    console.error('Error updating homepage config:', error);
    res.status(500).json({ 
      error: 'Homepage configuration operation failed',
      message: error.message 
    });
  }
});

// Settings API
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await cmsService.getSettings();
    res.json({ settings });
  } catch (error) {
    console.error('Error reading settings:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.put('/settings', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 PUT /settings endpoint called');
    console.log('🔍 Request body:', { ...req.body, password: req.body.password ? '[HIDDEN]' : undefined });
    
    const settings = await cmsService.updateSettings(req.body);
    console.log('🔍 Service returned:', { ...settings, password: settings?.password ? '[HASHED]' : undefined });
    
    const response = { 
      success: true,
      message: 'Settings updated successfully',
      settings 
    };
    console.log('🔍 Sending response:', { ...response, settings: { ...response.settings, password: '[HASHED]' } });
    
    res.json(response);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const stats = await cmsService.getDashboardStats();
    res.json({ stats });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
});

// Images API
router.get('/images', authenticateToken, async (req, res) => {
  try {
    const images = await cmsService.getAllImages();
    res.json({ images });
  } catch (error) {
    console.error('Error reading images:', error);
    res.status(500).json({ error: 'Failed to load images' });
  }
});

router.post('/images', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageData = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    const image = await cmsService.createImage(imageData);
    res.status(201).json({ image });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.delete('/images/:id', authenticateToken, async (req, res) => {
  try {
    await cmsService.deleteImage(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router; 