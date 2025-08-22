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
    console.log('📡 Connecting to database...');
    await database.connect();
    await cmsService.init();
    console.log('✅ Database connected');
    
    // Migrate books
    const booksData = await readJsonFile(path.join(DATA_DIR, 'books.json'));
    if (booksData && Array.isArray(booksData)) {
      console.log(`📚 Migrating ${booksData.length} books...`);
      for (const book of booksData) {
        // Remove old id and add MongoDB _id
        const { id, ...bookData } = book;
        console.log(`  - Migrating book: ${bookData.title}`);
        await cmsService.createBook(bookData);
      }
      console.log('✅ Books migrated successfully');
    } else {
      console.log('⚠️ No books data found or invalid format');
    }
    
    // Migrate media
    const mediaData = await readJsonFile(path.join(DATA_DIR, 'media.json'));
    if (mediaData && Array.isArray(mediaData)) {
      console.log(`📷 Migrating ${mediaData.length} media items...`);
      for (const media of mediaData) {
        const { id, ...mediaData } = media;
        console.log(`  - Migrating media: ${mediaData.title}`);
        await cmsService.createMedia(mediaData);
      }
      console.log('✅ Media migrated successfully');
    } else {
      console.log('⚠️ No media data found or invalid format');
    }
    
    // Migrate author
    const authorData = await readJsonFile(path.join(DATA_DIR, 'author.json'));
    if (authorData) {
      console.log('👤 Migrating author data...');
      await cmsService.updateAuthor(authorData);
      console.log('✅ Author data migrated successfully');
    } else {
      console.log('⚠️ No author data found');
    }
    
    // Migrate social
    const socialData = await readJsonFile(path.join(DATA_DIR, 'social.json'));
    if (socialData) {
      console.log('🔗 Migrating social links...');
      await cmsService.updateSocial(socialData);
      console.log('✅ Social links migrated successfully');
    } else {
      console.log('⚠️ No social data found');
    }
    
    // Migrate contact
    const contactData = await readJsonFile(path.join(DATA_DIR, 'contact.json'));
    if (contactData) {
      console.log('📧 Migrating contact information...');
      await cmsService.updateContact(contactData);
      console.log('✅ Contact information migrated successfully');
    } else {
      console.log('⚠️ No contact data found');
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
    } else {
      console.log('⚠️ No settings data found');
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('📝 You can now delete the JSON files in the data/ directory');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    console.log('🔌 Disconnecting from database...');
    await database.disconnect();
    console.log('✅ Migration script completed');
  }
}

// Run migration if this script is executed directly
if (process.argv[1] && process.argv[1].endsWith('migrate-to-mongodb.js')) {
  migrateData();
}

export default migrateData; 