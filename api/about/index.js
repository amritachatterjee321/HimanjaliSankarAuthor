// Vercel serverless function for about API
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
      // Return author information
      const authorInfo = {
        name: "HIMANJALI SANKAR",
        bio: "A passionate author who writes compelling narratives that explore themes of resilience, hope, and human connection. Her work spans both adult and children's literature, offering readers of all ages meaningful stories that resonate with the human experience.",
        achievements: [
          "Published author with works in multiple genres",
          "Contributor to prestigious anthologies",
          "Recipient of literary recognition and awards"
        ],
        genres: ["Contemporary Fiction", "Children's Literature", "Short Stories"],
        website: "https://himanjalisankar.com"
      };
      
      res.status(200).json(authorInfo);
    } catch (error) {
      console.error('About API error:', error);
      
      // Return fallback data on error
      res.status(200).json({
        name: "HIMANJALI SANKAR",
        bio: "A passionate author who writes compelling narratives.",
        achievements: ["Published author", "Contributor to anthologies"],
        genres: ["Contemporary Fiction", "Children's Literature"],
        website: "https://himanjalisankar.com"
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
