import clientPromise, { isMongoDBAvailable, getDatabaseName } from './lib/mongodb.js';
import { ObjectId } from 'mongodb';

// Consolidated Vercel serverless function for all API endpoints
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

  // Get the endpoint from query parameter or default to books
  const endpoint = req.query.endpoint || 'books';
  
  console.log('🔍 API Debug Info:');
  console.log('  - Method:', req.method);
  console.log('  - URL:', req.url);
  console.log('  - Endpoint:', endpoint);
  console.log('  - Query:', req.query);
  console.log('  - Headers:', req.headers);
  console.log('  - Body:', req.body);

  try {
    if (endpoint === 'books') {
      await handleBooks(req, res);
    } else if (endpoint === 'media') {
      await handleMedia(req, res);
    } else if (endpoint === 'social') {
      await handleSocial(req, res);
    } else if (endpoint === 'about') {
      await handleAbout(req, res);
    } else if (endpoint === 'contact') {
      await handleContact(req, res);
    } else if (endpoint === 'test') {
      await handleTest(req, res);
    } else if (endpoint === 'debug') {
      // Simple debug endpoint to test response format
      console.log('🔍 Debug endpoint called');
      res.status(200).json({
        success: true,
        data: {
          message: 'Debug endpoint working',
          timestamp: new Date().toISOString(),
          endpoint: endpoint,
          method: req.method,
          url: req.url
        }
      });
    } else {
      // If endpoint not found, try to handle as books (fallback)
      console.log('Endpoint not found, falling back to books:', endpoint);
      await handleBooks(req, res);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Books handler
async function handleBooks(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('📚 Books API called');
      
      if (!isMongoDBAvailable()) {
        console.log('❌ MongoDB not configured, using fallback data');
        return res.status(200).json(getFallbackBooks());
      }

      console.log('✅ MongoDB is available, attempting connection...');
      const client = await clientPromise;
      console.log('✅ MongoDB client connected');
      
      const dbName = getDatabaseName();
      console.log('📊 Database name:', dbName);
      
      const db = client.db(dbName);
      const booksCollection = db.collection('books');
      console.log('📚 Books collection accessed');

      const { id, category, latest } = req.query;

      if (id) {
        try {
          const objectId = new ObjectId(id);
          const book = await booksCollection.findOne({ _id: objectId });
          if (book) {
            res.status(200).json(book);
          } else {
            res.status(404).json({ message: 'Book not found' });
          }
        } catch (error) {
          console.error('Invalid book ID format:', id, error);
          res.status(400).json({ message: 'Invalid book ID format' });
        }
      } else if (latest) {
        const latestBook = await booksCollection
          .find({})
          .sort({ year: -1 })
          .limit(1)
          .toArray();
        
        if (latestBook.length > 0) {
          res.status(200).json(latestBook[0]);
        } else {
          res.status(404).json({ message: 'No books found' });
        }
      } else if (category) {
        const categoryBooks = await booksCollection
          .find({ category: category })
          .toArray();
        res.status(200).json(categoryBooks);
      } else {
        const allBooks = await booksCollection.find({}).toArray();
        const booksByCategory = {
          adults: allBooks.filter(book => book.category === 'adults'),
          children: allBooks.filter(book => book.category === 'children')
        };
        res.status(200).json(booksByCategory);
      }
    } catch (error) {
      console.error('Books API error:', error);
      res.status(200).json(getFallbackBooks());
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Media handler
async function handleMedia(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('📰 Media API called - building response...');
      
      if (!isMongoDBAvailable()) {
        console.log('❌ MongoDB not configured, using fallback data');
        return res.status(200).json({ media: getFallbackMedia() });
      }

      console.log('✅ MongoDB is available, fetching media from database...');
      const client = await clientPromise;
      console.log('✅ MongoDB client connected');
      
      const dbName = getDatabaseName();
      console.log('📊 Database name:', dbName);
      
      const db = client.db(dbName);
      const mediaCollection = db.collection('media');
      console.log('📰 Media collection accessed');

      const { id, type } = req.query;

      if (id) {
        try {
          const objectId = new ObjectId(id);
          const mediaItem = await mediaCollection.findOne({ _id: objectId });
          if (mediaItem) {
            res.status(200).json({ media: [mediaItem] });
          } else {
            res.status(404).json({ message: 'Media item not found' });
          }
        } catch (error) {
          console.error('Invalid media ID format:', id, error);
          res.status(400).json({ message: 'Invalid media ID format' });
        }
      } else if (type) {
        const filteredMedia = await mediaCollection
          .find({ type: type })
          .toArray();
        console.log(`📰 Found ${filteredMedia.length} media items of type ${type}`);
        res.status(200).json({ media: filteredMedia });
      } else {
        const allMedia = await mediaCollection.find({}).toArray();
        console.log(`📰 Found ${allMedia.length} total media items`);
        res.status(200).json({ media: allMedia });
      }
    } catch (error) {
      console.error('Media API error:', error);
      res.status(200).json({ media: getFallbackMedia() });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Social handler
async function handleSocial(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('📱 Social API called - building response...');
      
      if (!isMongoDBAvailable()) {
        console.log('❌ MongoDB not configured, using fallback data');
        const fallbackSocial = [
          {
            _id: "fallback-social-1",
            name: "Instagram",
            url: "https://instagram.com/himanjalisankar",
            active: true
          },
          {
            _id: "fallback-social-2", 
            name: "Facebook",
            url: "https://facebook.com/himanjalisankar",
            active: true
          }
        ];
        
        console.log('📱 Social API using fallback data');
        return res.status(200).json({
          social: fallbackSocial
        });
      }

      console.log('✅ MongoDB is available, fetching social data from database...');
      const client = await clientPromise;
      console.log('✅ MongoDB client connected');
      
      const dbName = getDatabaseName();
      console.log('📊 Database name:', dbName);
      
      const db = client.db(dbName);
      const socialCollection = db.collection('social');
      console.log('📱 Social collection accessed');

      // Fetch social media data from MongoDB
      const socialData = await socialCollection.findOne({});
      
      if (socialData) {
        console.log('✅ Found social data in database:', socialData);
        
        // Transform the data to match the expected format
        const activeSocial = [];
        
        // Add Instagram if available
        if (socialData.instagram && socialData.instagram !== '#') {
          activeSocial.push({
            _id: "social-instagram",
            name: "Instagram",
            url: socialData.instagram,
            active: true
          });
        }
        
        // Add Facebook if available
        if (socialData.facebook && socialData.facebook !== '#') {
          activeSocial.push({
            _id: "social-facebook",
            name: "Facebook",
            url: socialData.facebook,
            active: true
          });
        }
        
        // Add Twitter if available
        if (socialData.twitter && socialData.twitter !== '#') {
          activeSocial.push({
            _id: "social-twitter",
            name: "Twitter",
            url: socialData.twitter,
            active: true
          });
        }
        
        // Add LinkedIn if available
        if (socialData.linkedin && socialData.linkedin !== '#') {
          activeSocial.push({
            _id: "social-linkedin",
            name: "LinkedIn",
            url: socialData.linkedin,
            active: true
          });
        }
        
        console.log('📱 Social API sending response from database:', { social: activeSocial });
        res.status(200).json({
          social: activeSocial
        });
      } else {
        console.log('⚠️ No social data found in database, using fallback');
        const fallbackSocial = [
          {
            _id: "fallback-social-1",
            name: "Instagram",
            url: "https://instagram.com/himanjalisankar",
            active: true
          },
          {
            _id: "fallback-social-2", 
            name: "Facebook",
            url: "https://facebook.com/himanjalisankar",
            active: true
          }
        ];
        
        console.log('📱 Social API sending fallback response:', { social: fallbackSocial });
        res.status(200).json({
          social: fallbackSocial
        });
      }
    } catch (error) {
      console.error('Social API error:', error);
      const fallbackSocial = [
        {
          _id: "fallback-social-1",
          name: "Instagram",
          url: "https://instagram.com/himanjalisankar",
          active: true
        },
        {
          _id: "fallback-social-2", 
          name: "Facebook",
          url: "https://facebook.com/himanjalisankar",
          active: true
        }
      ];
      
      console.log('📱 Social API sending fallback response due to error:', { social: fallbackSocial });
      res.status(200).json({
        social: fallbackSocial
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// About handler
async function handleAbout(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('🏠 About API called - building response...');
      
      if (!isMongoDBAvailable()) {
        console.log('❌ MongoDB not configured, using fallback data');
        const fallbackAuthorInfo = {
          name: "HIMANJALI SANKAR",
          bio: "A passionate author who writes compelling narratives that explore themes of resilience, hope, and human connection. Her work spans both adult and children's literature, offering readers of all ages meaningful stories that resonate with the human experience.",
          achievements: [
            "Published author with works in multiple genres",
            "Contributor to prestigious anthologies",
            "Recipient of literary recognition and awards"
          ],
          genres: ["Contemporary Fiction", "Children's Literature", "Short Stories"],
          website: "https://himanjalisankar.com"
        };
        
        const response = {
          success: true,
          data: fallbackAuthorInfo
        };
        
        console.log('🏠 About API using fallback data');
        return res.status(200).json(response);
      }

      console.log('✅ MongoDB is available, fetching author data from database...');
      const client = await clientPromise;
      console.log('✅ MongoDB client connected');
      
      const dbName = getDatabaseName();
      console.log('📊 Database name:', dbName);
      
      const db = client.db(dbName);
      const authorCollection = db.collection('author');
      console.log('👤 Author collection accessed');

      // Fetch author data from MongoDB
      const authorData = await authorCollection.findOne({});
      
      if (authorData) {
        console.log('✅ Found author data in database:', authorData);
        
        // Transform the data to match the expected format
        const authorInfo = {
          name: authorData.name || "HIMANJALI SANKAR",
          bio: authorData.bio || "A passionate author who writes compelling narratives that explore themes of resilience, hope, and human connection. Her work spans both adult and children's literature, offering readers of all ages meaningful stories that resonate with the human experience.",
          achievements: authorData.awards || [
            "Published author with works in multiple genres",
            "Contributor to prestigious anthologies",
            "Recipient of literary recognition and awards"
          ],
          genres: authorData.genres || ["Contemporary Fiction", "Children's Literature", "Short Stories"],
          website: authorData.website || "https://himanjalisankar.com"
        };
        
        // Add image if available
        if (authorData.image && authorData.image.url) {
          authorInfo.image = authorData.image;
        }
        
        const response = {
          success: true,
          data: authorInfo
        };
        
        console.log('🏠 About API response structure:', {
          hasSuccess: 'success' in response,
          hasData: 'data' in response,
          successValue: response.success,
          dataKeys: Object.keys(response.data)
        });
        
        console.log('🏠 About API sending response from database:', response);
        res.status(200).json(response);
      } else {
        console.log('⚠️ No author data found in database, using fallback');
        const fallbackAuthorInfo = {
          name: "HIMANJALI SANKAR",
          bio: "A passionate author who writes compelling narratives that explore themes of resilience, hope, and human connection. Her work spans both adult and children's literature, offering readers of all ages meaningful stories that resonate with the human experience.",
          achievements: [
            "Published author with works in multiple genres",
            "Contributor to prestigious anthologies",
            "Recipient of literary recognition and awards"
          ],
          genres: ["Contemporary Fiction", "Children's Literature", "Short Stories"],
          website: "https://himanjalisankar.com"
        };
        
        const response = {
          success: true,
          data: fallbackAuthorInfo
        };
        
        console.log('🏠 About API sending fallback response:', response);
        res.status(200).json(response);
      }
    } catch (error) {
      console.error('About API error:', error);
      const fallbackResponse = {
        success: true,
        data: {
          name: "HIMANJALI SANKAR",
          bio: "A passionate author who writes compelling narratives.",
          achievements: ["Published author", "Contributor to anthologies"],
          genres: ["Contemporary Fiction", "Children's Literature"],
          website: "https://himanjalisankar.com"
        }
      };
      
      console.log('🏠 About API sending fallback response due to error:', fallbackResponse);
      res.status(200).json(fallbackResponse);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Contact handler
async function handleContact(req, res) {
  if (req.method === 'GET') {
    try {
      const contactConfig = {
        title: "Get in Touch",
        subtitle: "I'd love to hear from you. Send me a message and I'll respond as soon as possible.",
        fields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "subject", label: "Subject", type: "text", required: true },
          { name: "message", label: "Message", type: "textarea", required: true }
        ],
        submitText: "Send Message",
        successMessage: "Thank you! Your message has been sent successfully.",
        errorMessage: "Sorry, there was an error sending your message. Please try again."
      };
      
      res.status(200).json(contactConfig);
    } catch (error) {
      console.error('Contact API error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      }

      console.log('Contact form submission:', {
        name, email, subject, message,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({ 
        message: 'Message sent successfully!',
        success: true
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      res.status(500).json({ 
        message: 'Failed to send message. Please try again.',
        success: false
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Test handler
async function handleTest(req, res) {
  if (req.method === 'GET') {
    try {
      res.status(200).json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        mongodbConfigured: !!process.env.MONGODB_URI,
        databaseName: process.env.DB_NAME || 'not set'
      });
    } catch (error) {
      console.error('Test API error:', error);
      res.status(500).json({ 
        message: 'Test API error',
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Fallback data functions
function getFallbackBooks() {
  return {
    adults: [
      {
        _id: "fallback-1",
        title: "The Burnings",
        year: "2024",
        shortDescription: "A compelling narrative that explores themes of resilience and hope in the face of adversity.",
        coverImage: {
          url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop"
        },
        amazonLink: "https://amazon.com/dp/B0C1234567",
        category: "adults"
      },
      {
        _id: "fallback-2",
        title: "Echoes of Tomorrow",
        year: "2023",
        shortDescription: "A thought-provoking story about the future and human connection.",
        coverImage: {
          url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop"
        },
        amazonLink: "https://amazon.com/dp/B0C2345678",
        category: "adults"
      }
    ],
    children: [
      {
        _id: "fallback-3",
        title: "The Little Explorer",
        year: "2024",
        shortDescription: "An adventure story for young readers about discovering the world around them.",
        coverImage: {
          url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
        },
        amazonLink: "https://amazon.com/dp/B0C4567890",
        category: "children"
      }
    ]
  };
}

function getFallbackMedia() {
  return [
    {
      _id: "fallback-media-1",
      title: "Short story for BLink",
      type: "short-work",
      source: "BLink - The Hindu Business Line",
      url: "https://www.thehindubusinessline.com/blink/cover/pinky-chadha-is-patriotic/article9490451.ece",
      date: "2024-02-05",
      description: "A compelling short story exploring themes of patriotism and identity."
    },
    {
      _id: "fallback-media-2",
      title: "Sample Book Review - Literary Magazine",
      type: "review",
      source: "Literary Magazine",
      url: "https://example.com/review",
      date: "2024-01-15",
      description: "A sample book review for testing purposes."
    },
    {
      _id: "fallback-media-3",
      title: "Short story for the anthology Behind the Shadows",
      type: "short-work",
      source: "Behind the Shadows Anthology",
      url: "https://example.com/anthology",
      date: "2022-05-08",
      description: "A story exploring cultural identity and the human experience across continents."
    }
  ];
}
