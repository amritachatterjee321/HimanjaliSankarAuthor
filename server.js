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
const PORT = process.env.PORT || 3000;

// Initialize database connection
async function initializeDatabase() {
  try {
    await database.connect();
    await cmsService.init();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
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
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
};
app.use(cors(corsOptions));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/contact', contactRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/about', aboutRoutes);

// Serve static files (including favicon)
app.use(express.static(join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.ico')) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }
}));

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
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Development route
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Himanjali Sankar Author Website API',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
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
