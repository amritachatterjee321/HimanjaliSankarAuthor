import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Import database and routes
import database from './src/config/database.js';
import cmsService from './src/services/cmsService.js';
import contactRoutes from './src/routes/contact.js';
import booksRoutes from './src/routes/books.js';
import cmsRoutes from './src/routes/cms.js';
import aboutRoutes from './src/routes/about.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database connection
async function initializeDatabase() {
  try {
    // Check if we're in development mode and should skip MongoDB
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_MONGODB === 'true') {
      console.log('⚠️ Development mode: Skipping MongoDB connection');
      console.log('💡 To enable MongoDB:');
      console.log('   1. Set SKIP_MONGODB=false in your .env file');
      console.log('   2. Or use local MongoDB: MONGODB_URI=mongodb://127.0.0.1:27017');
      return;
    }
    
    try {
      await database.connect();
      await cmsService.init();
      console.log('✅ Database initialized successfully');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      
      // In development mode, continue without database
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Development mode: Continuing without database connection');
        console.log('📝 Note: Some features may not work without MongoDB');
        console.log('🔧 To fix MongoDB connection:');
        console.log('   1. Check your MongoDB Atlas network access settings');
        console.log('   2. Verify your connection string in .env file');
        console.log('   3. Try using a local MongoDB installation');
        console.log('   4. Or set SKIP_MONGODB=true to skip database entirely');
        return;
      }
      
      // Re-throw error for production mode
      throw dbError;
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    // In development mode, allow the server to start without MongoDB
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Development mode: Continuing without database connection');
      console.log('📝 Note: Some features may not work without MongoDB');
      console.log('🔧 To fix MongoDB connection:');
      console.log('   1. Check your MongoDB Atlas network access settings');
      console.log('   2. Verify your connection string in .env file');
      console.log('   3. Try using a local MongoDB installation');
      return;
    }
    
    // Only exit in production mode
    console.error('❌ Production mode: Cannot continue without database');
    process.exit(1);
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "https://www.googletagmanager.com", "'unsafe-inline'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};
app.use(cors(corsOptions));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes - enable in both development and production
app.use('/api/contact', contactRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/about', aboutRoutes);

// Public social media endpoint (no authentication required)
app.get('/api/social', async (req, res) => {
  try {
    const social = await cmsService.getSocial();
    res.json({ social });
  } catch (error) {
    console.error('Error reading social media:', error);
    res.status(500).json({ error: 'Failed to load social links' });
  }
});

// Public media endpoint (no authentication required)
app.get('/api/media', async (req, res) => {
  try {
    const media = await cmsService.getAllMedia();
    res.json({ media });
  } catch (error) {
    console.error('Error reading media:', error);
    res.status(500).json({ error: 'Failed to load media' });
  }
});

// Serve static files (including favicon)
app.use(express.static(join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.ico')) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }
}));

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'public', 'uploads')));

// Serve data files
app.use('/data', express.static(join(__dirname, 'data')));

// CMS route - serve the CMS interface
app.get('/cms', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'cms', 'index.html'));
});

app.get('/cms/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'cms', 'index.html'));
});

// About page route
app.get('/about', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'about.html'));
});

// Books page route
app.get('/books', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'books.html'));
});

// Book detail page route
app.get('/book-detail', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'book-detail.html'));
});

// Individual book page route
app.get('/book/:id', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'book-detail.html'));
});

// Test page route
app.get('/test', (req, res) => {
  res.sendFile(join(__dirname, 'test-book-detail.html'));
});

// Simple test page route
app.get('/test-simple', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'test-simple.html'));
});

// Media page route
app.get('/media', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'media.html'));
});

// Contact page route
app.get('/contact', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'contact.html'));
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  
  // Remove catch-all route for multi-page application
  // Each page should be served by its specific route
} else {
  // Development route - serve the main index.html
  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🎨 CMS Interface: http://localhost:${PORT}/cms`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

// Image optimization middleware
import sharp from 'sharp';
import { existsSync } from 'fs';

// Serve optimized images
app.get('/uploads/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = join(__dirname, 'public', 'uploads', filename);
    const { width, height, quality, format } = req.query;
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return res.status(404).send('Image not found');
    }
    
    // If no optimization parameters, serve original
    if (!width && !height && !quality && !format) {
      return res.sendFile(filePath);
    }
    
    // Create optimized image
    let sharpInstance = sharp(filePath);
    
    // Resize if width or height specified
    if (width || height) {
      sharpInstance = sharpInstance.resize(
        width ? parseInt(width) : null,
        height ? parseInt(height) : null,
        { fit: 'cover', withoutEnlargement: true }
      );
    }
    
    // Set quality
    if (quality) {
      sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) });
    }
    
    // Convert format if specified
    if (format === 'webp') {
      sharpInstance = sharpInstance.webp({ quality: quality ? parseInt(quality) : 80 });
    } else if (format === 'avif') {
      sharpInstance = sharpInstance.avif({ quality: quality ? parseInt(quality) : 80 });
    }
    
    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=31536000', // 1 year
      'Content-Type': format === 'webp' ? 'image/webp' : 
                     format === 'avif' ? 'image/avif' : 'image/jpeg'
    });
    
    // Stream the optimized image
    sharpInstance.pipe(res);
    
  } catch (error) {
    console.error('Image optimization error:', error);
    res.status(500).send('Image processing error');
  }
});
