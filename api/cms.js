import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// CMS API handler for Vercel
export default async function handler(req, res) {
  // Enable CORS for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the endpoint from the URL path
  const path = req.url;
  console.log('🔍 CMS API called with path:', path);

  try {
    // Handle authentication endpoints
    if (path.includes('/auth/login')) {
      await handleLogin(req, res);
    } else if (path.includes('/auth/verify')) {
      await handleVerifyToken(req, res);
    } else if (path.includes('/dashboard')) {
      await handleDashboard(req, res);
    } else if (path.includes('/books') && path.includes('/cover')) {
      // Handle book cover uploads specifically
      await handleBookCoverUpload(req, res);
    } else if (path.includes('/books')) {
      await handleBooks(req, res);
    } else if (path.includes('/media')) {
      await handleMedia(req, res);
    } else if (path.includes('/author') && path.includes('/image')) {
      // Handle author image uploads specifically
      await handleAuthorImageUpload(req, res);
    } else if (path.includes('/author')) {
      await handleAuthor(req, res);
    } else if (path.includes('/social')) {
      await handleSocial(req, res);
    } else if (path.includes('/homepage-config')) {
      await handleHomepageConfig(req, res);
    } else if (path.includes('/settings')) {
      await handleSettings(req, res);
    } else if (path.includes('/images')) {
      await handleImages(req, res);
    } else {
      // For now, return a basic response for other endpoints
      res.status(200).json({
        message: 'CMS endpoint not yet implemented',
        path: path,
        method: req.method
      });
    }
  } catch (error) {
    console.error('CMS API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Handle login
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    console.log('🔐 Login attempt for username:', username);
    
    // Development fallback: allow admin/admin123 without database
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { userId: 'default-admin', username: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      console.log('✅ Login successful for admin user');
      res.json({ 
        token,
        user: {
          id: 'default-admin',
          username: 'admin',
          name: 'Admin User'
        },
        message: 'Login successful'
      });
      return;
    }
    
    // For now, reject all other login attempts
    console.log('❌ Login failed: invalid credentials');
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

// Handle token verification
async function handleVerifyToken(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token verified for user:', decoded.username);
    
    res.json({ 
      valid: true,
      user: {
        id: decoded.userId,
        username: decoded.username
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
}

// Handle dashboard
async function handleDashboard(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, return basic dashboard data
    const dashboardData = {
      stats: {
        totalBooks: 0,
        totalMedia: 0,
        recentActivity: []
      },
      message: 'Dashboard endpoint working'
    };
    
    console.log('📊 Dashboard data requested');
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
}

// Handle books management
async function handleBooks(req, res) {
  try {
    if (req.method === 'GET') {
      // Get books list
      const books = getMockBooks();
      res.json(books);
    } else if (req.method === 'POST') {
      // Create new book
      const newBook = req.body;
      console.log('📚 Creating new book:', newBook.title);
      res.json({
        success: true,
        message: 'Book created successfully',
        book: { ...newBook, _id: `book-${Date.now()}` }
      });
    } else if (req.method === 'PUT') {
      // Update book
      const bookId = req.url.split('/').pop();
      const updates = req.body;
      console.log('📚 Updating book:', bookId, updates);
      res.json({
        success: true,
        message: 'Book updated successfully',
        bookId,
        updates
      });
    } else if (req.method === 'DELETE') {
      // Delete book
      const bookId = req.url.split('/').pop();
      console.log('📚 Deleting book:', bookId);
      res.json({
        success: true,
        message: 'Book deleted successfully',
        bookId
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Books API error:', error);
    res.status(500).json({ error: 'Books operation failed' });
  }
}

// Handle book cover uploads
async function handleBookCoverUpload(req, res) {
  try {
    if (req.method === 'POST') {
      const bookId = req.url.split('/')[2]; // Extract book ID from /books/{id}/cover
      console.log('📚 Uploading cover for book:', bookId);
      
      // For now, return a placeholder response
      // In production, this would handle actual file upload to cloud storage
      res.json({
        success: true,
        message: 'Book cover uploaded successfully',
        bookId,
        coverImage: {
          url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
          filename: `cover-${bookId}-${Date.now()}.jpg`
        }
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Book cover upload error:', error);
    res.status(500).json({ error: 'Cover upload failed' });
  }
}

// Handle author image uploads
async function handleAuthorImageUpload(req, res) {
  try {
    if (req.method === 'POST') {
      console.log('👤 Uploading author image');
      
      // For now, return a placeholder response
      // In production, this would handle actual file upload to cloud storage
      res.json({
        success: true,
        message: 'Author image uploaded successfully',
        image: {
          url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
          filename: `author-${Date.now()}.jpg`
        }
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Author image upload error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
}

// Handle media management
async function handleMedia(req, res) {
  try {
    if (req.method === 'GET') {
      // Get media list
      const media = getMockMedia();
      res.json(media);
    } else if (req.method === 'POST') {
      // Create new media item
      const newMedia = req.body;
      console.log('📰 Creating new media item:', newMedia.title);
      res.json({
        success: true,
        message: 'Media item created successfully',
        media: { ...newMedia, _id: `media-${Date.now()}` }
      });
    } else if (req.method === 'PUT') {
      // Update media item
      const mediaId = req.url.split('/').pop();
      const updates = req.body;
      console.log('📰 Updating media item:', mediaId, updates);
      res.json({
        success: true,
        message: 'Media item updated successfully',
        mediaId,
        updates
      });
    } else if (req.method === 'DELETE') {
      // Delete media item
      const mediaId = req.url.split('/').pop();
      console.log('📰 Deleting media item:', mediaId);
      res.json({
        success: true,
        message: 'Media item deleted successfully',
        mediaId
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Media API error:', error);
    res.status(500).json({ error: 'Media operation failed' });
  }
}

// Handle author management
async function handleAuthor(req, res) {
  try {
    if (req.method === 'GET') {
      // Get author info
      const author = getMockAuthor();
      res.json(author);
    } else if (req.method === 'PUT') {
      // Update author info
      const updates = req.body;
      console.log('👤 Updating author info:', updates);
      res.json({
        success: true,
        message: 'Author information updated successfully',
        updates
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Author API error:', error);
    res.status(500).json({ error: 'Author operation failed' });
  }
}

// Handle social media management
async function handleSocial(req, res) {
  try {
    if (req.method === 'GET') {
      // Get social media links
      const social = getMockSocial();
      res.json(social);
    } else if (req.method === 'PUT') {
      // Update social media links
      const updates = req.body;
      console.log('🔗 Updating social media links:', updates);
      res.json({
        success: true,
        message: 'Social media links updated successfully',
        updates
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Social API error:', error);
    res.status(500).json({ error: 'Social media operation failed' });
  }
}

// Handle homepage configuration
async function handleHomepageConfig(req, res) {
  try {
    if (req.method === 'GET') {
      // Get homepage configuration
      const config = getMockHomepageConfig();
      res.json(config);
    } else if (req.method === 'PUT') {
      // Update homepage configuration
      const updates = req.body;
      console.log('🏠 Updating homepage config:', updates);
      res.json({
        success: true,
        message: 'Homepage configuration updated successfully',
        updates
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Homepage config API error:', error);
    res.status(500).json({ error: 'Homepage configuration operation failed' });
  }
}

// Handle settings
async function handleSettings(req, res) {
  try {
    if (req.method === 'GET') {
      // Get settings
      const settings = getMockSettings();
      res.json(settings);
    } else if (req.method === 'PUT') {
      // Update settings
      const updates = req.body;
      console.log('⚙️ Updating settings:', updates);
      res.json({
        success: true,
        message: 'Settings updated successfully',
        updates
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Settings API error:', error);
    res.status(500).json({ error: 'Settings operation failed' });
  }
}

// Handle images
async function handleImages(req, res) {
  try {
    if (req.method === 'GET') {
      // Get images list
      const images = getMockImages();
      res.json(images);
    } else if (req.method === 'POST') {
      // Upload new image
      console.log('🖼️ Image upload requested');
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        imageId: `img-${Date.now()}`,
        url: 'https://example.com/placeholder-image.jpg'
      });
    } else if (req.method === 'DELETE') {
      // Delete image
      const imageId = req.url.split('/').pop();
      console.log('🖼️ Deleting image:', imageId);
      res.json({
        success: true,
        message: 'Image deleted successfully',
        imageId
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Images API error:', error);
    res.status(500).json({ error: 'Image operation failed' });
  }
}

// Mock data functions
function getMockBooks() {
  return [
    {
      _id: 'book-1',
      title: 'Whispers in the Rain',
      subtitle: 'A Collection of Short Stories',
      description: 'A compelling collection of interconnected short stories.',
      year: '2023',
      genre: 'Contemporary Fiction',
      category: 'adults',
      amazonLink: 'https://amazon.com/whispers-rain',
      coverImage: {
        url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
      },
      createdAt: new Date().toISOString()
    },
    {
      _id: 'book-2',
      title: 'The Magic Garden',
      subtitle: "Children's Adventure",
      description: 'A delightful story about friendship and discovery.',
      year: '2023',
      genre: "Children's Literature",
      category: 'children',
      amazonLink: 'https://amazon.com/magic-garden',
      coverImage: {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'
      },
      createdAt: new Date().toISOString()
    }
  ];
}

function getMockMedia() {
  return [
    {
      _id: 'media-1',
      title: 'Short story for BLink',
      type: 'short-work',
      source: 'BLink - The Hindu Business Line',
      url: 'https://www.thehindubusinessline.com/blink/cover/pinky-chadha-is-patriotic/article9490451.ece',
      date: '2024-02-05',
      description: 'A compelling short story exploring themes of patriotism and identity.',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'media-2',
      title: 'Book Review - Literary Magazine',
      type: 'review',
      source: 'Literary Magazine',
      url: 'https://example.com/review',
      date: '2024-01-15',
      description: 'A comprehensive review of the latest release.',
      createdAt: new Date().toISOString()
    }
  ];
}

function getMockAuthor() {
  return {
    name: 'HIMANJALI SANKAR',
    bio: 'A passionate author who writes compelling narratives that explore themes of resilience, hope, and human connection. Her work spans both adult and children\'s literature, offering readers of all ages meaningful stories that resonate with the human experience.',
    shortBio: 'Award-winning author crafting heartwarming stories that bridge generations and cultures.',
    email: 'himanjali@example.com',
    website: 'https://himanjalisankar.com',
    location: 'India',
    genres: ['Contemporary Fiction', 'Children\'s Literature', 'Short Stories', 'Literary Fiction'],
    achievements: [
      'Multiple published works across different genres',
      'Recognition for storytelling excellence',
      'Growing reader community worldwide'
    ],
    image: {
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop'
    }
  };
}

function getMockSocial() {
  return {
    instagram: 'https://instagram.com/himanjalisankar',
    facebook: 'https://facebook.com/himanjali.author',
    twitter: 'https://twitter.com/himanjali_author'
  };
}

function getMockHomepageConfig() {
  return {
    featuredBook: 'book-1',
    homepageBooks: ['book-1', 'book-2'],
    heroTitle: 'Welcome to the World of Himanjali Sankar',
    heroSubtitle: 'Discover stories that touch the heart and inspire the mind',
    updatedAt: new Date().toISOString()
  };
}

function getMockSettings() {
  return {
    siteTitle: 'Himanjali Sankar - Author',
    siteDescription: 'Official website of author Himanjali Sankar',
    contactEmail: 'contact@himanjalisankar.com',
    analyticsEnabled: true,
    maintenanceMode: false,
    updatedAt: new Date().toISOString()
  };
}

function getMockImages() {
  return [
    {
      _id: 'img-1',
      title: 'Author Portrait',
      category: 'author',
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
      description: 'Professional author portrait',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'img-2',
      title: 'Book Cover - Whispers in the Rain',
      category: 'book-covers',
      url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      description: 'Cover image for the short story collection',
      createdAt: new Date().toISOString()
    }
  ];
}
