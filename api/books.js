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
      // Sample book data for production
      const books = {
        adults: [
          {
            _id: "book-1",
            title: "The Burnings",
            year: "2024",
            shortDescription: "A compelling narrative that explores themes of resilience and hope in the face of adversity. This powerful story follows characters as they navigate through challenging circumstances.",
            coverImage: {
              url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop"
            },
            amazonLink: "https://amazon.com/dp/B0C1234567",
            category: "adults"
          },
          {
            _id: "book-2",
            title: "Echoes of Tomorrow",
            year: "2023",
            shortDescription: "A thought-provoking story about the future and human connection. This novel explores what it means to be human in an increasingly digital world.",
            coverImage: {
              url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop"
            },
            amazonLink: "https://amazon.com/dp/B0C2345678",
            category: "adults"
          },
          {
            _id: "book-3",
            title: "Whispers in the Wind",
            year: "2022",
            shortDescription: "A mystical tale that weaves together elements of fantasy and reality. Readers will be transported to a world where magic and truth coexist.",
            coverImage: {
              url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
            },
            amazonLink: "https://amazon.com/dp/B0C3456789",
            category: "adults"
          }
        ],
        children: [
          {
            _id: "book-4",
            title: "The Little Explorer",
            year: "2024",
            shortDescription: "An adventure story for young readers about discovering the world around them. Perfect for children learning about curiosity and exploration.",
            coverImage: {
              url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
            },
            amazonLink: "https://amazon.com/dp/B0C4567890",
            category: "children"
          },
          {
            _id: "book-5",
            title: "Dreams and Wishes",
            year: "2023",
            shortDescription: "A heartwarming tale about friendship and dreams. This story teaches children about the importance of believing in themselves.",
            coverImage: {
              url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop"
            },
            amazonLink: "https://amazon.com/dp/B0C5678901",
            category: "children"
          }
        ]
      };

      // Check if specific book is requested
      const { id, category, latest } = req.query;

      if (id) {
        // Return specific book
        const allBooks = [...books.adults, ...books.children];
        const book = allBooks.find(b => b._id === id);
        
        if (book) {
          res.status(200).json(book);
        } else {
          res.status(404).json({ message: 'Book not found' });
        }
      } else if (latest) {
        // Return latest book (first adult book)
        res.status(200).json(books.adults[0]);
      } else if (category) {
        // Return books by category
        const categoryBooks = books[category] || [];
        res.status(200).json(categoryBooks);
      } else {
        // Return all books
        res.status(200).json(books);
      }
    } catch (error) {
      console.error('Books API error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
