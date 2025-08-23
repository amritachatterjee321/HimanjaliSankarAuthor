import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // Set proper headers for image serving
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Path to the image file
    const imagePath = path.join(process.cwd(), 'public', 'himanjalisankar.png');
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.error('Image file not found:', imagePath);
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Read and serve the image
    const imageBuffer = fs.readFileSync(imagePath);
    res.status(200).send(imageBuffer);
    
  } catch (error) {
    console.error('Error serving social image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
}
