// CMS Authentication API
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      // Basic authentication (you should implement proper JWT authentication)
      // For now, using a simple check - you can enhance this later
      if (username === 'admin' && password === 'password') {
        // Generate a simple token (in production, use proper JWT)
        const token = 'Bearer ' + Buffer.from(username + ':' + Date.now()).toString('base64');
        
        res.status(200).json({
          success: true,
          message: 'Login successful',
          token: token,
          user: { username: username }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } catch (error) {
      console.error('CMS Auth error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
