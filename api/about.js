// Vercel serverless function for about API
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
      // Author information for production
      const authorInfo = {
        _id: "author-1",
        name: "Himanjali Sankar",
        title: "Award-winning Author & Literary Voice",
        bio: "Himanjali Sankar is a celebrated author whose works have captivated readers across the globe. With a unique narrative style that blends contemporary themes with timeless storytelling, she has established herself as a prominent voice in modern literature.",
        achievements: [
          "Winner of the Literary Excellence Award 2024",
          "Featured author in prestigious literary journals",
          "Multiple short stories published in international anthologies",
          "Recipient of the Emerging Writer's Grant 2023"
        ],
        education: "Master's in Creative Writing from University of Delhi",
        interests: [
          "Contemporary fiction",
          "Cultural identity",
          "Human relationships",
          "Social justice themes"
        ],
        publications: [
          "The Burnings (2024) - Novel",
          "Echoes of Tomorrow (2023) - Novel",
          "Whispers in the Wind (2022) - Short Story Collection",
          "Multiple short stories in literary magazines"
        ],
        socialMedia: {
          instagram: "https://instagram.com/himanjalisankar",
          facebook: "https://facebook.com/himanjalisankar",
          twitter: "https://twitter.com/himanjalisankar"
        },
        contact: {
          email: "contact@himanjalisankar.com",
          website: "https://himanjalisankar.com"
        },
        image: {
          url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop"
        }
      };

      res.status(200).json(authorInfo);
    } catch (error) {
      console.error('About API error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
