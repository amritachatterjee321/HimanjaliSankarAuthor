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
      // Sample media data for production
      const media = [
        {
          _id: "media-1",
          title: "Short story for BLink",
          type: "short-work",
          source: "BLink - The Hindu Business Line",
          url: "https://www.thehindubusinessline.com/blink/cover/pinky-chadha-is-patriotic/article9490451.ece",
          date: "2024-02-05",
          description: "A compelling short story exploring themes of patriotism and identity."
        },
        {
          _id: "media-2",
          title: "Short story for the anthology Behind the Shadows: Contemporary Stories from Africa and Asia",
          type: "short-work",
          source: "Behind the Shadows Anthology",
          url: "https://example.com/anthology",
          date: "2022-05-08",
          description: "A story exploring cultural identity and the human experience across continents."
        },
        {
          _id: "media-3",
          title: "Short story for Qurbatein, a gender and sexuality bi-annual",
          type: "short-work",
          source: "Qurbatein Journal",
          url: "https://example.com/qurbatein",
          date: "2025-08-04",
          description: "A narrative that challenges traditional gender norms and explores modern relationships."
        },
        {
          _id: "media-4",
          title: "Short story for antiserious",
          type: "short-work",
          source: "Antiserious Literary Magazine",
          url: "https://example.com/antiserious",
          date: "2024-07-13",
          description: "A thought-provoking story that questions the nature of seriousness in literature."
        },
        {
          _id: "media-5",
          title: "Book Review - Literary Times",
          type: "review",
          source: "Literary Times",
          url: "https://example.com/review",
          date: "2024-01-15",
          description: "A comprehensive review of the latest literary works and their impact on contemporary literature."
        },
        {
          _id: "media-6",
          title: "Author Interview - Writers Digest",
          type: "review",
          source: "Writers Digest",
          url: "https://example.com/interview",
          date: "2024-03-20",
          description: "An in-depth conversation about the creative process and the journey of becoming a published author."
        }
      ];

      // Check if specific media is requested
      const { id, type } = req.query;

      if (id) {
        // Return specific media item
        const mediaItem = media.find(m => m._id === id);
        
        if (mediaItem) {
          res.status(200).json(mediaItem);
        } else {
          res.status(404).json({ message: 'Media item not found' });
        }
      } else if (type) {
        // Return media by type
        const filteredMedia = media.filter(m => m.type === type);
        res.status(200).json(filteredMedia);
      } else {
        // Return all media
        res.status(200).json(media);
      }
    } catch (error) {
      console.error('Media API error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
