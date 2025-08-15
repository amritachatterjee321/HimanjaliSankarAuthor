import clientPromise, { isMongoDBAvailable, getDatabaseName } from '../../lib/mongodb.js';

// CMS Social Media API - requires authentication
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
    const socialCollection = db.collection('social');

    if (req.method === 'GET') {
      // Get social media configuration
      const social = await socialCollection.find({}).toArray();
      res.status(200).json(social);
    } else if (req.method === 'POST') {
      // Create new social media item
      const socialData = req.body;
      const result = await socialCollection.insertOne(socialData);
      res.status(201).json({ 
        message: 'Social media item created successfully',
        socialId: result.insertedId 
      });
    } else if (req.method === 'PUT') {
      // Update social media item
      const { id, ...updateData } = req.body;
      const result = await socialCollection.updateOne(
        { _id: id },
        { $set: updateData }
      );
      res.status(200).json({ 
        message: 'Social media item updated successfully',
        modifiedCount: result.modifiedCount 
      });
    } else if (req.method === 'DELETE') {
      // Delete social media item
      const { id } = req.query;
      const result = await socialCollection.deleteOne({ _id: id });
      res.status(200).json({ 
        message: 'Social media item deleted successfully',
        deletedCount: result.deletedCount 
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('CMS Social API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
