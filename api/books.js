import clientPromise from './lib/mongodb.js';

// Vercel serverless function for books API
export default async function handler(req, res) {
  // Enable CORS for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Connect to MongoDB
      const client = await clientPromise;
      const db = client.db(process.env.DB_NAME || 'Cluster0');
      const booksCollection = db.collection('books');

      // Check if specific book is requested
      const { id, category, latest } = req.query;

      if (id) {
        // Return specific book
        const book = await booksCollection.findOne({ _id: id });
        
        if (book) {
          res.status(200).json(book);
        } else {
          res.status(404).json({ message: 'Book not found' });
        }
      } else if (latest) {
        // Return latest book (most recent by year)
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
        // Return books by category
        const categoryBooks = await booksCollection
          .find({ category: category })
          .toArray();
        
        res.status(200).json(categoryBooks);
      } else {
        // Return all books grouped by category
        const allBooks = await booksCollection.find({}).toArray();
        
        // Group books by category
        const booksByCategory = {
          adults: allBooks.filter(book => book.category === 'adults'),
          children: allBooks.filter(book => book.category === 'children')
        };
        
        res.status(200).json(booksByCategory);
      }
    } catch (error) {
      console.error('Books API error:', error);
      
      // Fallback to sample data if database connection fails
      const fallbackBooks = {
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
          }
        ],
        children: []
      };
      
      res.status(200).json(fallbackBooks);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
