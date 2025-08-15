// Vercel serverless function for social media API
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
      // Social media data for production
      const socialMedia = [
        {
          _id: "social-1",
          name: "Instagram",
          url: "https://instagram.com/himanjalisankar",
          icon: "I",
          active: true
        },
        {
          _id: "social-2",
          name: "Facebook",
          url: "https://facebook.com/himanjalisankar",
          icon: "F",
          active: true
        },
        {
          _id: "social-3",
          name: "Twitter",
          url: "https://twitter.com/himanjalisankar",
          icon: "T",
          active: false
        },
        {
          _id: "social-4",
          name: "LinkedIn",
          url: "https://linkedin.com/in/himanjalisankar",
          icon: "L",
          active: false
        }
      ];

      // Return only active social media platforms
      const activeSocialMedia = socialMedia.filter(social => social.active);
      
      res.status(200).json(activeSocialMedia);
    } catch (error) {
      console.error('Social media API error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
