import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import database from '../src/config/database.js';
import cmsService from '../src/services/cmsService.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function migrateData() {
  try {
    console.log('🔄 Starting migration to MongoDB...');
    
    // Connect to database
    await database.connect();
    await cmsService.init();
    
    // Migrate books
    const booksData = await readJsonFile(path.join(DATA_DIR, 'books.json'));
    if (booksData && Array.isArray(booksData)) {
      console.log(`📚 Migrating ${booksData.length} books...`);
      for (const book of booksData) {
        // Remove old id and add MongoDB _id
        const { id, ...bookData } = book;
        await cmsService.createBook(bookData);
      }
      console.log('✅ Books migrated successfully');
    }
    
    // Migrate media
    const mediaData = await readJsonFile(path.join(DATA_DIR, 'media.json'));
    if (mediaData && Array.isArray(mediaData)) {
      console.log(`📷 Migrating ${mediaData.length} media items...`);
      for (const media of mediaData) {
        const { id, ...mediaData } = media;
        await cmsService.createMedia(mediaData);
      }
      console.log('✅ Media migrated successfully');
    }
    
    // Migrate author
    const authorData = await readJsonFile(path.join(DATA_DIR, 'author.json'));
    if (authorData) {
      console.log('👤 Migrating author data...');
      await cmsService.updateAuthor(authorData);
      console.log('✅ Author data migrated successfully');
    }
    
    // Migrate social
    const socialData = await readJsonFile(path.join(DATA_DIR, 'social.json'));
    if (socialData) {
      console.log('🔗 Migrating social links...');
      await cmsService.updateSocial(socialData);
      console.log('✅ Social links migrated successfully');
    }
    
    // Migrate settings and create default user
    const settingsData = await readJsonFile(path.join(DATA_DIR, 'settings.json'));
    if (settingsData) {
      console.log('⚙️ Migrating settings...');
      await cmsService.updateSettings(settingsData);
      console.log('✅ Settings migrated successfully');
      
      // Create default user if username/password exist in settings
      if (settingsData.username && settingsData.password) {
        console.log('👤 Creating default user...');
        const hashedPassword = await bcrypt.hash(settingsData.password, 10);
        await cmsService.createUser({
          username: settingsData.username,
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin'
        });
        console.log('✅ Default user created successfully');
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('📝 You can now delete the JSON files in the data/ directory');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData();
}

export default migrateData; 