import clientPromise from './lib/mongodb.js';

// Vercel serverless function for media API
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
      const mediaCollection = db.collection('media');

      // Check if specific media is requested
      const { id, type } = req.query;

      if (id) {
        // Return specific media item
        const mediaItem = await mediaCollection.findOne({ _id: id });
        
        if (mediaItem) {
          res.status(200).json(mediaItem);
        } else {
          res.status(404).json({ message: 'Media item not found' });
        }
      } else if (type) {
        // Return media by type
        const filteredMedia = await mediaCollection
          .find({ type: type })
          .toArray();
        res.status(200).json(filteredMedia);
      } else {
        // Return all media
        const allMedia = await mediaCollection.find({}).toArray();
        res.status(200).json(allMedia);
      }
    } catch (error) {
      console.error('Media API error:', error);
      
      // Fallback to sample data if database connection fails
      const fallbackMedia = [
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
        }
      ];
      
      res.status(200).json(fallbackMedia);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
