import express from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// GET /api/about - Get author information
router.get('/', async (req, res) => {
  try {
    // Read the JSON file using fs
    const fs = await import('fs/promises');
    const authorDataPath = join(__dirname, '../../data/author.json');
    
    const authorData = await fs.readFile(authorDataPath, 'utf8');
    const parsedData = JSON.parse(authorData);
    
    res.json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    console.error('Error fetching author data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch author data'
    });
  }
});

// GET /about - Serve the About page
router.get('/page', (req, res) => {
  res.sendFile(join(__dirname, '../../public/index.html'));
});

export default router; 