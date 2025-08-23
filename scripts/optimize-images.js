import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
const optimizedDir = path.join(__dirname, '..', 'public', 'uploads', 'optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

async function optimizeImage(inputPath, outputPath, options = {}) {
  const {
    width = 800,
    height = 1200,
    quality = 85,
    format = 'webp'
  } = options;

  try {
    let sharpInstance = sharp(inputPath);
    
    // Resize image
    sharpInstance = sharpInstance.resize(width, height, {
      fit: 'cover',
      withoutEnlargement: true
    });
    
    // Set quality and format
    if (format === 'webp') {
      sharpInstance = sharpInstance.webp({ quality });
    } else if (format === 'jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality });
    } else if (format === 'avif') {
      sharpInstance = sharpInstance.avif({ quality });
    }
    
    // Save optimized image
    await sharpInstance.toFile(outputPath);
    
    // Get file sizes
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ Optimized: ${path.basename(inputPath)}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(1)}KB`);
    console.log(`   Optimized: ${(optimizedSize / 1024).toFixed(1)}KB`);
    console.log(`   Savings: ${savings}%`);
    
    return { originalSize, optimizedSize, savings };
  } catch (error) {
    console.error(`❌ Failed to optimize ${path.basename(inputPath)}:`, error.message);
    return null;
  }
}

async function optimizeAllImages() {
  console.log('🖼️ Starting image optimization...\n');
  
  const files = fs.readdirSync(uploadsDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext);
  });
  
  if (files.length === 0) {
    console.log('No images found to optimize.');
    return;
  }
  
  console.log(`Found ${files.length} images to optimize.\n`);
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let successCount = 0;
  
  for (const file of files) {
    const inputPath = path.join(uploadsDir, file);
    const nameWithoutExt = path.parse(file).name;
    
    // Create WebP version
    const webpPath = path.join(optimizedDir, `${nameWithoutExt}.webp`);
    const result = await optimizeImage(inputPath, webpPath, {
      width: 800,
      height: 1200,
      quality: 85,
      format: 'webp'
    });
    
    if (result) {
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
      successCount++;
    }
    
    // Create smaller JPEG version for thumbnails
    const thumbnailPath = path.join(optimizedDir, `${nameWithoutExt}-thumb.jpg`);
    await optimizeImage(inputPath, thumbnailPath, {
      width: 200,
      height: 300,
      quality: 70,
      format: 'jpeg'
    });
  }
  
  console.log('\n📊 Optimization Summary:');
  console.log(`✅ Successfully optimized: ${successCount}/${files.length} images`);
  console.log(`📦 Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`📦 Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`💾 Total space saved: ${((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(2)}MB`);
  console.log(`📈 Average compression: ${((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)}%`);
  
  console.log('\n🎯 Next steps:');
  console.log('1. Update your CMS to use optimized images from /uploads/optimized/');
  console.log('2. Consider implementing a CDN for even better performance');
  console.log('3. Monitor your website loading speed improvements');
}

// Run the optimization
optimizeAllImages().catch(console.error);
