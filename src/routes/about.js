import express from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import database from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// GET /api/about - Get author information
router.get('/', async (req, res) => {
  try {
    let authorData = null;
    
    // First try to get author data from MongoDB (CMS)
    try {
      const authorCollection = database.getAuthorCollection();
      authorData = await authorCollection.findOne({});
      console.log('✅ Loaded author data from MongoDB');
    } catch (error) {
      console.log('⚠️ MongoDB not available, falling back to file data');
      // Fallback to JSON file
      const fs = await import('fs/promises');
      const authorDataPath = join(__dirname, '../../data/author.json');
      const fileData = await fs.readFile(authorDataPath, 'utf8');
      authorData = JSON.parse(fileData);
    }
    
    res.json({
      success: true,
      data: authorData
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