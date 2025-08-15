// Simple test API to verify basic functionality
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    console.log('🧪 Simple test API called');
    console.log('  - Method:', req.method);
    console.log('  - URL:', req.url);
    console.log('  - Headers:', req.headers);
    
    res.status(200).json({
      message: 'Simple test API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      dbName: process.env.DB_NAME || 'Not set'
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
