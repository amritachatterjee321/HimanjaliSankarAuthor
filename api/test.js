// Simple test API endpoint to verify routing
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Return a simple test response
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
