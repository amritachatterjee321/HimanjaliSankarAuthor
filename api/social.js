// Vercel serverless function for social media API
export default async function handler(req, res) {
  // Enable CORS for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // For now, return static social media data
      // This can be updated later to fetch from MongoDB
      const socialMedia = [
        {
          _id: "social-1",
          name: "Instagram",
          url: "https://instagram.com/himanjalisankar",
          active: true
        },
        {
          _id: "social-2", 
          name: "Facebook",
          url: "https://facebook.com/himanjalisankar",
          active: true
        }
      ];

      // Only return active social media platforms
      const activeSocial = socialMedia.filter(social => social.active);
      
      res.status(200).json(activeSocial);
    } catch (error) {
      console.error('Social API error:', error);
      
      // Return fallback data on error
      res.status(200).json([
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
      ]);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
