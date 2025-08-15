import clientPromise, { isMongoDBAvailable, getDatabaseName } from '../../lib/mongodb.js';

// CMS Books API - requires authentication
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check authentication (you can implement proper JWT validation here)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    if (!isMongoDBAvailable()) {
      return res.status(500).json({ message: 'Database not available' });
    }

    const client = await clientPromise;
    const db = client.db(getDatabaseName());
    const booksCollection = db.collection('books');

    if (req.method === 'GET') {
      // Get all books
      const books = await booksCollection.find({}).toArray();
      res.status(200).json(books);
    } else if (req.method === 'POST') {
      // Create new book
      const bookData = req.body;
      const result = await booksCollection.insertOne(bookData);
      res.status(201).json({ 
        message: 'Book created successfully',
        bookId: result.insertedId 
      });
    } else if (req.method === 'PUT') {
      // Update book
      const { id, ...updateData } = req.body;
      const result = await booksCollection.updateOne(
        { _id: id },
        { $set: updateData }
      );
      res.status(200).json({ 
        message: 'Book updated successfully',
        modifiedCount: result.modifiedCount 
      });
    } else if (req.method === 'DELETE') {
      // Delete book
      const { id } = req.query;
      const result = await booksCollection.deleteOne({ _id: id });
      res.status(200).json({ 
        message: 'Book deleted successfully',
        deletedCount: result.deletedCount 
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('CMS Books API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
