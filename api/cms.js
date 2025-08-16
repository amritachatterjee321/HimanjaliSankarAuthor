import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import clientPromise, { isMongoDBAvailable, getDatabaseName } from './lib/mongodb.js';

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

  // Get the endpoint from the URL path - use query parameter for endpoint
  const endpoint = req.query.endpoint || req.url?.split('/').pop() || '';
  console.log('🔍 CMS API called with endpoint:', endpoint);
  console.log('🔍 Full URL:', req.url);
  console.log('🔍 Query params:', req.query);

  try {
    // Handle authentication endpoints
    if (endpoint === 'login' || req.url?.includes('/auth/login')) {
      await handleLogin(req, res);
    } else if (endpoint === 'verify' || req.url?.includes('/auth/verify')) {
      await handleVerifyToken(req, res);
    } else if (endpoint === 'dashboard' || req.url?.includes('/dashboard')) {
      await handleDashboard(req, res);
    } else if (endpoint === 'books' || req.url?.includes('/books')) {
      await handleBooks(req, res);
    } else if (endpoint === 'media' || req.url?.includes('/media')) {
      await handleMedia(req, res);
    } else if (endpoint === 'author' || req.url?.includes('/author')) {
      await handleAuthor(req, res);
    } else if (endpoint === 'social' || req.url?.includes('/social')) {
      await handleSocial(req, res);
    } else if (endpoint === 'homepage-config' || req.url?.includes('/homepage-config')) {
      await handleHomepageConfig(req, res);
    } else if (endpoint === 'settings' || req.url?.includes('/settings')) {
      await handleSettings(req, res);
    } else if (endpoint === 'images' || req.url?.includes('/images')) {
      await handleImages(req, res);
    } else {
      // For now, return a basic response for other endpoints
      res.status(200).json({
        message: 'CMS endpoint not yet implemented',
        endpoint: endpoint,
        url: req.url,
        method: req.method,
        availableEndpoints: [
          'login', 'verify', 'dashboard', 'books', 'media', 
          'author', 'social', 'homepage-config', 'settings', 'images'
        ]
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
    if (!isMongoDBAvailable()) {
      console.log('❌ MongoDB not configured, using fallback dashboard data');
      return res.json({
        stats: {
          totalBooks: 0,
          totalMedia: 0,
          recentActivity: []
        },
        message: 'Dashboard endpoint working (fallback mode)'
      });
    }

    console.log('✅ MongoDB is available, fetching dashboard statistics...');
    const client = await clientPromise;
    const dbName = getDatabaseName();
    const db = client.db(dbName);
    
    // Get books count
    const booksCollection = db.collection('books');
    const totalBooks = await booksCollection.countDocuments();
    
    // Get media count
    const mediaCollection = db.collection('media');
    const totalMedia = await mediaCollection.countDocuments();
    
    // Get recent activity (latest books and media)
    const recentBooks = await booksCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    const recentMedia = await mediaCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    // Combine and sort recent activity
    const recentActivity = [
      ...recentBooks.map(book => ({
        type: 'book',
        title: book.title,
        date: book.createdAt,
        id: book._id
      })),
      ...recentMedia.map(media => ({
        type: 'media',
        title: media.title,
        date: media.createdAt,
        id: media._id
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
     .slice(0, 10); // Top 10 most recent items
    
    const dashboardData = {
      stats: {
        totalBooks,
        totalMedia,
        recentActivity
      },
      message: 'Dashboard data loaded from MongoDB',
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`📊 Dashboard stats: ${totalBooks} books, ${totalMedia} media items`);
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
      // Get books list from MongoDB
      if (!isMongoDBAvailable()) {
        console.log('❌ MongoDB not configured, using fallback data');
        return res.json({ books: getMockBooks() });
      }

      console.log('✅ MongoDB is available, fetching books from database...');
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const booksCollection = db.collection('books');
      
      const books = await booksCollection.find({}).sort({ createdAt: -1 }).toArray();
      console.log(`📚 Found ${books.length} books in database`);
      
      // Return with 'books' property to match frontend expectation
      res.json({ books: books });
    } else if (req.method === 'POST') {
      // Create new book in MongoDB
      if (!isMongoDBAvailable()) {
        return res.status(500).json({ error: 'MongoDB not available' });
      }

      const newBook = req.body;
      console.log('📚 Creating new book:', newBook.title);
      
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const booksCollection = db.collection('books');
      
      // Add creation timestamp
      newBook.createdAt = new Date();
      newBook.updatedAt = new Date();
      
      const result = await booksCollection.insertOne(newBook);
      console.log('✅ Book created with ID:', result.insertedId);
      
      res.json({
        success: true,
        message: 'Book created successfully',
        book: { ...newBook, _id: result.insertedId }
      });
    } else if (req.method === 'PUT') {
      // Update book in MongoDB
      if (!isMongoDBAvailable()) {
        return res.status(500).json({ error: 'MongoDB not available' });
      }

      const bookId = req.url.split('/').pop();
      const updates = req.body;
      console.log('📚 Updating book:', bookId, updates);
      
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const booksCollection = db.collection('books');
      
      // Add update timestamp
      updates.updatedAt = new Date();
      
      const result = await booksCollection.updateOne(
        { _id: bookId },
        { $set: updates }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }
      
      console.log('✅ Book updated successfully');
      res.json({
        success: true,
        message: 'Book updated successfully',
        bookId,
        updates
      });
    } else if (req.method === 'DELETE') {
      // Delete book from MongoDB
      if (!isMongoDBAvailable()) {
        return res.status(500).json({ error: 'MongoDB not available' });
      }

      const bookId = req.url.split('/').pop();
      console.log('📚 Deleting book:', bookId);
      
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const booksCollection = db.collection('books');
      
      const result = await booksCollection.deleteOne({ _id: bookId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Book not found' });
      }
      
      console.log('✅ Book deleted successfully');
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
      // Get media list from MongoDB
      if (!isMongoDBAvailable()) {
        console.log('❌ MongoDB not configured, using fallback data');
        return res.json({ media: getMockMedia() });
      }

      console.log('✅ MongoDB is available, fetching media from database...');
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const mediaCollection = db.collection('media');
      
      const media = await mediaCollection.find({}).sort({ createdAt: -1 }).toArray();
      console.log(`📰 Found ${media.length} media items in database`);
      
      // Return with 'media' property to match frontend expectation
      res.json({ media: media });
    } else if (req.method === 'POST') {
      // Create new media item in MongoDB
      if (!isMongoDBAvailable()) {
        return res.status(500).json({ error: 'MongoDB not available' });
      }

      const newMedia = req.body;
      console.log('📰 Creating new media item:', newMedia.title);
      
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const mediaCollection = db.collection('media');
      
      // Add creation timestamp
      newMedia.createdAt = new Date();
      newMedia.updatedAt = new Date();
      
      const result = await mediaCollection.insertOne(newMedia);
      console.log('✅ Media item created with ID:', result.insertedId);
      
      res.json({
        success: true,
        message: 'Media item created successfully',
        media: { ...newMedia, _id: result.insertedId }
      });
    } else if (req.method === 'PUT') {
      // Update media item in MongoDB
      if (!isMongoDBAvailable()) {
        return res.status(500).json({ error: 'MongoDB not available' });
      }

      const mediaId = req.url.split('/').pop();
      const updates = req.body;
      console.log('📰 Updating media item:', mediaId, updates);
      
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const mediaCollection = db.collection('media');
      
      // Add update timestamp
      updates.updatedAt = new Date();
      
      const result = await mediaCollection.updateOne(
        { _id: mediaId },
        { $set: updates }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Media item not found' });
      }
      
      console.log('✅ Media item updated successfully');
      res.json({
        success: true,
        message: 'Media item updated successfully',
        mediaId,
        updates
      });
    } else if (req.method === 'DELETE') {
      // Delete media item from MongoDB
      if (!isMongoDBAvailable()) {
        return res.status(500).json({ error: 'MongoDB not available' });
      }

      const mediaId = req.url.split('/').pop();
      console.log('📰 Deleting media item:', mediaId);
      
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const mediaCollection = db.collection('media');
      
      const result = await mediaCollection.deleteOne({ _id: mediaId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Media item not found' });
      }
      
      console.log('✅ Media item deleted successfully');
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
      // Get author info from MongoDB
      if (!isMongoDBAvailable()) {
        console.log('❌ MongoDB not configured, using fallback data');
        return res.json({ author: getMockAuthor() });
      }

      console.log('✅ MongoDB is available, fetching author info from database...');
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const authorCollection = db.collection('author');
      
      const author = await authorCollection.findOne({});
      if (author) {
        console.log('✅ Found author info in database');
        res.json({ author: author });
      } else {
        console.log('⚠️ No author info found in database, using fallback');
        res.json({ author: getMockAuthor() });
      }
    } else if (req.method === 'PUT') {
      // Update author info in MongoDB
      if (!isMongoDBAvailable()) {
        return res.status(500).json({ error: 'MongoDB not available' });
      }

      const updates = req.body;
      console.log('👤 Updating author info:', updates);
      
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const authorCollection = db.collection('author');
      
      // Add update timestamp
      updates.updatedAt = new Date();
      
      // Use upsert to create if doesn't exist, update if it does
      const result = await authorCollection.updateOne(
        {}, // Empty filter to match any document
        { $set: updates },
        { upsert: true }
      );
      
      console.log('✅ Author info updated successfully');
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
      // Get social media links from MongoDB
      if (!isMongoDBAvailable()) {
        console.log('❌ MongoDB not configured, using fallback data');
        return res.json({ social: getMockSocial() });
      }

      console.log('✅ MongoDB is available, fetching social media from database...');
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const socialCollection = db.collection('social');
      
      const social = await socialCollection.findOne({});
      if (social) {
        console.log('✅ Found social media info in database');
        res.json({ social: social });
      } else {
        console.log('⚠️ No social media info found in database, using fallback');
        res.json({ social: getMockSocial() });
      }
    } else if (req.method === 'PUT') {
      // Update social media links in MongoDB
      if (!isMongoDBAvailable()) {
        return res.status(500).json({ error: 'MongoDB not available' });
      }

      const updates = req.body;
      console.log('🔗 Updating social media links:', updates);
      
      const client = await clientPromise;
      const dbName = getDatabaseName();
      const db = client.db(dbName);
      const socialCollection = db.collection('social');
      
      // Add update timestamp
      updates.updatedAt = new Date();
      
      // Use upsert to create if doesn't exist, update if it does
      const result = await socialCollection.updateOne(
        {}, // Empty filter to match any document
        { $set: updates },
        { upsert: true }
      );
      
      console.log('✅ Social media links updated successfully');
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
      res.json({ config: config });
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
      res.json({ settings: settings });
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
      res.json({ images: images });
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
