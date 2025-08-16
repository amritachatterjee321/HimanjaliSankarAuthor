import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// CMS API handler for Vercel
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

  // Get the endpoint from the URL path
  const path = req.url;
  console.log('🔍 CMS API called with path:', path);

  try {
    // Handle authentication endpoints
    if (path.includes('/auth/login')) {
      await handleLogin(req, res);
    } else if (path.includes('/auth/verify')) {
      await handleVerifyToken(req, res);
    } else if (path.includes('/dashboard')) {
      await handleDashboard(req, res);
    } else {
      // For now, return a basic response for other endpoints
      res.status(200).json({
        message: 'CMS endpoint not yet implemented',
        path: path,
        method: req.method
      });
    }
  } catch (error) {
    console.error('CMS API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Handle login
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    console.log('🔐 Login attempt for username:', username);
    
    // Development fallback: allow admin/admin123 without database
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { userId: 'default-admin', username: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      console.log('✅ Login successful for admin user');
      res.json({ 
        token,
        user: {
          id: 'default-admin',
          username: 'admin',
          name: 'Admin User'
        },
        message: 'Login successful'
      });
      return;
    }
    
    // For now, reject all other login attempts
    console.log('❌ Login failed: invalid credentials');
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

// Handle token verification
async function handleVerifyToken(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token verified for user:', decoded.username);
    
    res.json({ 
      valid: true,
      user: {
        id: decoded.userId,
        username: decoded.username
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
}

// Handle dashboard
async function handleDashboard(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, return basic dashboard data
    const dashboardData = {
      stats: {
        totalBooks: 0,
        totalMedia: 0,
        recentActivity: []
      },
      message: 'Dashboard endpoint working'
    };
    
    console.log('📊 Dashboard data requested');
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
}
