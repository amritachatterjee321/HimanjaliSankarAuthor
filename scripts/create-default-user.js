import database from '../src/config/database.js';
import cmsService from '../src/services/cmsService.js';
import bcrypt from 'bcryptjs';

async function createDefaultUser() {
  try {
    console.log('🔄 Checking for default user...');
    
    // Connect to database
    console.log('📡 Connecting to database...');
    await database.connect();
    await cmsService.init();
    console.log('✅ Database connected');
    
    // Check if default user exists
    console.log('🔍 Checking if admin user exists...');
    const existingUser = await cmsService.getUserByUsername('admin');
    
    if (existingUser) {
      console.log('✅ Default user already exists');
      console.log('👤 Username: admin');
      console.log('🔑 Password: admin123');
    } else {
      console.log('👤 Creating default user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await cmsService.createUser({
        username: 'admin',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin'
      });
      console.log('✅ Default user created successfully');
      console.log('👤 Username: admin');
      console.log('🔑 Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Failed to create default user:', error);
    process.exit(1);
  } finally {
    console.log('🔌 Disconnecting from database...');
    await database.disconnect();
    console.log('✅ Script completed');
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDefaultUser();
}

export default createDefaultUser; 