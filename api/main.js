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
    } else if (endpoint === 'contact-info') {
      await handleContactInfo(req, res);
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

      const { id, category, latest, 'second-featured': secondFeatured } = req.query;

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
        // First try to get featured book from CMS homepage configuration
        try {
          console.log('🔄 Attempting to fetch featured book from CMS homepage configuration...');
          const homepageConfigCollection = db.collection('homepageConfig');
          const homepageConfig = await homepageConfigCollection.findOne({});
          
          if (homepageConfig && homepageConfig.featuredBook) {
            // Get the featured book from the books collection
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
                coverClass: featuredBook.coverClass,
                latestReleaseText: homepageConfig.latestReleaseText || "LATEST RELEASE"
              };
              return res.status(200).json(transformedLatest);
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
        
        // Fallback to getting the latest book by year
        const latestBook = await booksCollection
          .find({})
          .sort({ year: -1 })
          .limit(1)
          .toArray();
        
        if (latestBook.length > 0) {
          const book = latestBook[0];
          const transformedLatest = {
            id: book._id?.toString() || book.id,
            title: book.title,
            subtitle: "Latest Release",
            description: book.description,
            shortDescription: book.shortDescription || book.description?.substring(0, 200),
            year: book.year,
            genre: book.genre,
            category: book.category,
            amazonLink: book.amazonLink,
            awards: book.awards || [],
            reviews: book.reviews || [],
            coverImage: book.coverImage,
            coverClass: book.coverClass,
            latestReleaseText: "LATEST RELEASE"
          };
          res.status(200).json(transformedLatest);
        } else {
          res.status(404).json({ message: 'No books found' });
        }
      } else if (secondFeatured) {
        // Handle second featured book request
        try {
          console.log('🔄 Attempting to fetch second featured book from CMS homepage configuration...');
          const homepageConfigCollection = db.collection('homepageConfig');
          const homepageConfig = await homepageConfigCollection.findOne({});
          
          if (homepageConfig && homepageConfig.secondFeaturedBook) {
            console.log('✅ Found homepage config with second featured book:', homepageConfig.secondFeaturedBook);
            
            // Get the second featured book from the books collection
            let secondFeaturedBook = null;
            try {
              if (ObjectId.isValid(homepageConfig.secondFeaturedBook)) {
                secondFeaturedBook = await booksCollection.findOne({ 
                  _id: new ObjectId(homepageConfig.secondFeaturedBook)
                });
              } else {
                // Try to find by string ID if ObjectId is invalid
                secondFeaturedBook = await booksCollection.findOne({ 
                  id: homepageConfig.secondFeaturedBook
                });
              }
            } catch (error) {
              console.error('❌ Error finding second featured book:', error.message);
              // Try alternative search
              secondFeaturedBook = await booksCollection.findOne({ 
                $or: [
                  { id: homepageConfig.secondFeaturedBook },
                  { title: homepageConfig.secondFeaturedBook }
                ]
              });
            }
            
            if (secondFeaturedBook) {
              console.log('✅ Using CMS homepage config for second featured book:', secondFeaturedBook.title);
              const transformedSecondFeatured = {
                id: secondFeaturedBook._id?.toString() || secondFeaturedBook.id,
                title: secondFeaturedBook.title,
                subtitle: "Featured Release",
                description: secondFeaturedBook.description,
                shortDescription: secondFeaturedBook.shortDescription || secondFeaturedBook.description?.substring(0, 200),
                year: secondFeaturedBook.year,
                genre: secondFeaturedBook.genre,
                category: secondFeaturedBook.category,
                amazonLink: secondFeaturedBook.amazonLink,
                awards: secondFeaturedBook.awards || [],
                reviews: secondFeaturedBook.reviews || [],
                coverImage: secondFeaturedBook.coverImage,
                coverClass: secondFeaturedBook.coverClass,
                secondFeaturedReleaseText: homepageConfig.secondFeaturedReleaseText || "FEATURED RELEASE"
              };
              return res.status(200).json(transformedSecondFeatured);
            } else {
              console.log('❌ Second featured book from CMS config not found in books collection');
            }
          } else {
            console.log('❌ No second featured book configured in CMS homepage config');
          }
        } catch (error) {
          console.error('❌ Error accessing CMS homepage configuration:', error.message);
          console.log('🔄 Falling back to books collection');
        }
        
        // Fallback to getting the second book by year
        const books = await booksCollection
          .find({})
          .sort({ year: -1 })
          .limit(2)
          .toArray();
        
        if (books.length > 1) {
          const secondBook = books[1];
          const transformedSecondFeatured = {
            id: secondBook._id?.toString() || secondBook.id,
            title: secondBook.title,
            subtitle: "Featured Release",
            description: secondBook.description,
            shortDescription: secondBook.shortDescription || secondBook.description?.substring(0, 200),
            year: secondBook.year,
            genre: secondBook.genre,
            category: secondBook.category,
            amazonLink: secondBook.amazonLink,
            awards: secondBook.awards || [],
            reviews: secondBook.reviews || [],
            coverImage: secondBook.coverImage,
            coverClass: secondBook.coverClass,
            secondFeaturedReleaseText: "FEATURED RELEASE"
          };
          return res.status(200).json(transformedSecondFeatured);
        } else {
          // Fallback to static data
          const fallbackSecondFeatured = {
            id: "second-featured",
            title: "Whispers of Yesterday",
            subtitle: "Featured Release",
            description: "A captivating story of love, loss, and the power of memories.",
            shortDescription: "A captivating story of love, loss, and the power of memories.",
            year: 2023,
            genre: "Fiction",
            category: "adults",
            amazonLink: "https://amazon.com/whispers-yesterday",
            awards: ["Literary Excellence Award"],
            reviews: [
              {
                text: "A beautifully crafted narrative that resonates deeply",
                source: "Literary Review",
                rating: 5
              }
            ],
            secondFeaturedReleaseText: "FEATURED RELEASE"
          };
          return res.status(200).json(fallbackSecondFeatured);
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
          children: allBooks.filter(book => book.category === 'children'),
          'young-adult': allBooks.filter(book => book.category === 'young-adult')
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
        console.log('❌ MongoDB not configured - returning error in production');
        return res.status(503).json({ 
          success: false, 
          error: 'Database service unavailable',
          message: 'Author information is currently unavailable. Please try again later.'
        });
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
          awards: authorData.awards || [
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
        console.log('⚠️ No author data found in database - returning error');
        return res.status(404).json({ 
          success: false, 
          error: 'Author data not found',
          message: 'Author information has not been configured yet.'
        });
      }
    } catch (error) {
      console.error('About API error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        message: 'Unable to retrieve author information at this time.'
      });
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
      const { name, email, subject, message, organization, inquiryType } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      }

      console.log('📧 Contact form submission:', {
        name, email, subject, message, organization, inquiryType,
        timestamp: new Date().toISOString()
      });

      // Get admin email from settings
      let adminEmail = 'himanjali.sankar@gmail.com'; // Default fallback
      
      try {
        if (isMongoDBAvailable()) {
          const client = await clientPromise;
          const dbName = getDatabaseName();
          const db = client.db(dbName);
          const settingsCollection = db.collection('settings');
          
          const settings = await settingsCollection.findOne({ _id: 'cms-settings' });
          if (settings && settings.adminEmail) {
            adminEmail = settings.adminEmail;
            console.log('✅ Found admin email in settings:', adminEmail);
          } else {
            console.log('⚠️ No admin email found in settings, using default');
          }
        } else {
          console.log('⚠️ MongoDB not available, using default admin email');
        }
      } catch (error) {
        console.error('⚠️ Error fetching admin email from settings:', error);
      }

      // Send email
      try {
        const emailService = (await import('./lib/email.js')).default;
        const emailResult = await emailService.sendContactFormEmail(
          { name, email, subject, message, organization, inquiryType },
          adminEmail
        );
        
        console.log('✅ Email sent successfully:', emailResult.messageId);
        
        res.status(200).json({ 
          message: 'Message sent successfully!',
          success: true
        });
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        
        // Still return success to user but log the error
        res.status(200).json({ 
          message: 'Message received! We\'ll get back to you soon.',
          success: true,
          note: 'Email delivery may be delayed'
        });
      }
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

// Contact Info handler
async function handleContactInfo(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('📞 Contact Info API called - building response...');
      
      if (!isMongoDBAvailable()) {
        console.log('❌ MongoDB not configured, using fallback data');
        const fallbackContactInfo = {
          name: "Himanjali Sankar",
          email: "contact@himanjalisankar.com",
          phone: "+1 (555) 123-4567",
          address: "1234 Main St, Suite 100, New York, NY 10001",
          website: "https://himanjalisankar.com",
          socialMedia: {
            facebook: "https://facebook.com/himanjalisankar",
            twitter: "https://twitter.com/himanjalisankar",
            instagram: "https://instagram.com/himanjalisankar",
            linkedin: "https://linkedin.com/in/himanjalisankar"
          },
          businessHours: "Monday - Friday: 9:00 AM - 5:00 PM EST",
          additionalInfo: "For media inquiries and speaking engagements, please contact us directly."
        };
        
        const response = {
          success: true,
          data: fallbackContactInfo
        };
        
        console.log('📞 Contact Info API using fallback data');
        return res.status(200).json(response);
      }

      console.log('✅ MongoDB is available, fetching contact info from database...');
      const client = await clientPromise;
      console.log('✅ MongoDB client connected');
      
      const dbName = getDatabaseName();
      console.log('📊 Database name:', dbName);
      
      const db = client.db(dbName);
      const contactInfoCollection = db.collection('contactInfo');
      console.log('📞 Contact Info collection accessed');

      // Fetch contact info from MongoDB
      const contactInfoData = await contactInfoCollection.findOne({ isActive: true });
      
      if (contactInfoData) {
        console.log('✅ Found contact info in database:', contactInfoData);
        
        // Transform the data to match the expected format
        const contactInfo = {
          name: contactInfoData.name || "Himanjali Sankar",
          email: contactInfoData.email || "contact@himanjalisankar.com",
          phone: contactInfoData.phone || "+1 (555) 123-4567",
          address: contactInfoData.address || "1234 Main St, Suite 100, New York, NY 10001",
          website: contactInfoData.website || "https://himanjalisankar.com",
          socialMedia: contactInfoData.socialMedia || {
            facebook: "https://facebook.com/himanjalisankar",
            twitter: "https://twitter.com/himanjalisankar",
            instagram: "https://instagram.com/himanjalisankar",
            linkedin: "https://linkedin.com/in/himanjalisankar"
          },
          businessHours: contactInfoData.businessHours || "Monday - Friday: 9:00 AM - 5:00 PM EST",
          additionalInfo: contactInfoData.additionalInfo || "For media inquiries and speaking engagements, please contact us directly."
        };
        
        const response = {
          success: true,
          data: contactInfo
        };
        
        console.log('📞 Contact Info API sending response from database:', response);
        res.status(200).json(response);
      } else {
        console.log('⚠️ No contact info found in database, using fallback');
        const fallbackContactInfo = {
          name: "Himanjali Sankar",
          email: "contact@himanjalisankar.com",
          phone: "+1 (555) 123-4567",
          address: "1234 Main St, Suite 100, New York, NY 10001",
          website: "https://himanjalisankar.com",
          socialMedia: {
            facebook: "https://facebook.com/himanjalisankar",
            twitter: "https://twitter.com/himanjalisankar",
            instagram: "https://instagram.com/himanjalisankar",
            linkedin: "https://linkedin.com/in/himanjalisankar"
          },
          businessHours: "Monday - Friday: 9:00 AM - 5:00 PM EST",
          additionalInfo: "For media inquiries and speaking engagements, please contact us directly."
        };
        
        const response = {
          success: true,
          data: fallbackContactInfo
        };
        
        console.log('📞 Contact Info API sending fallback response:', response);
        res.status(200).json(response);
      }
    } catch (error) {
      console.error('Contact Info API error:', error);
      const fallbackResponse = {
        success: true,
        data: {
          name: "Himanjali Sankar",
          email: "contact@himanjalisankar.com",
          phone: "+1 (555) 123-4567",
          address: "1234 Main St, Suite 100, New York, NY 10001",
          website: "https://himanjalisankar.com",
          socialMedia: {
            facebook: "https://facebook.com/himanjalisankar",
            twitter: "https://twitter.com/himanjalisankar",
            instagram: "https://instagram.com/himanjalisankar",
            linkedin: "https://linkedin.com/in/himanjalisankar"
          },
          businessHours: "Monday - Friday: 9:00 AM - 5:00 PM EST",
          additionalInfo: "For media inquiries and speaking engagements, please contact us directly."
        }
      };
      
      console.log('📞 Contact Info API sending fallback response due to error:', fallbackResponse);
      res.status(200).json(fallbackResponse);
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, phone, address, website, socialMedia, businessHours, additionalInfo } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      }

      console.log('Contact Info form submission:', {
        name, email, phone, address, website, socialMedia, businessHours, additionalInfo,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({ 
        message: 'Contact info updated successfully!',
        success: true
      });
    } catch (error) {
      console.error('Contact Info form submission error:', error);
      res.status(500).json({ 
        message: 'Failed to update contact info. Please try again.',
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
    ],
    'young-adult': [
      {
        _id: "fallback-4",
        title: "The Midnight Library",
        year: "2024",
        shortDescription: "A magical coming-of-age story about identity, belonging, and the power of storytelling.",
        coverImage: {
          url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop"
        },
        amazonLink: "https://amazon.com/dp/B0C5678901",
        category: "young-adult"
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
