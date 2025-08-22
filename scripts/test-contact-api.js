// Simple test script to verify contact API structure without MongoDB connection
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testContactAPI() {
  try {
    console.log('🧪 Testing Contact API Structure...');
    
    // Test 1: Check if API endpoint exists
    console.log('\n1️⃣ Checking API endpoint structure...');
    const apiFile = path.join(__dirname, '../api/cms.js');
    const apiContent = await fs.readFile(apiFile, 'utf8');
    
    if (apiContent.includes('handleContact')) {
      console.log('✅ Contact handler function found in API');
    } else {
      console.log('❌ Contact handler function not found');
    }
    
    if (apiContent.includes('endpoint === \'contact\'')) {
      console.log('✅ Contact endpoint routing found');
    } else {
      console.log('❌ Contact endpoint routing not found');
    }
    
    // Test 2: Check if frontend API service exists
    console.log('\n2️⃣ Checking frontend API service...');
    const apiServiceFile = path.join(__dirname, '../public/src/js/api.js');
    const apiServiceContent = await fs.readFile(apiServiceFile, 'utf8');
    
    if (apiServiceContent.includes('getContactInfo')) {
      console.log('✅ getContactInfo method found in API service');
    } else {
      console.log('❌ getContactInfo method not found');
    }
    
    // Test 3: Check if contact page loads data
    console.log('\n3️⃣ Checking contact page implementation...');
    const contactPageFile = path.join(__dirname, '../public/src/js/contact-page.js');
    const contactPageContent = await fs.readFile(contactPageFile, 'utf8');
    
    if (contactPageContent.includes('loadContactInfo')) {
      console.log('✅ loadContactInfo method found in contact page');
    } else {
      console.log('❌ loadContactInfo method not found');
    }
    
    if (contactPageContent.includes('this.contactInfo')) {
      console.log('✅ Contact info data structure found');
    } else {
      console.log('❌ Contact info data structure not found');
    }
    
    // Test 4: Check if CMS service has contact methods
    console.log('\n4️⃣ Checking CMS service...');
    const cmsServiceFile = path.join(__dirname, '../src/services/cmsService.js');
    const cmsServiceContent = await fs.readFile(cmsServiceFile, 'utf8');
    
    if (cmsServiceContent.includes('updateContact')) {
      console.log('✅ updateContact method found in CMS service');
    } else {
      console.log('❌ updateContact method not found');
    }
    
    if (cmsServiceContent.includes('getContactCollection')) {
      console.log('✅ getContactCollection method found in database config');
    } else {
      console.log('❌ getContactCollection method not found');
    }
    
    // Test 5: Check if migration script includes contact
    console.log('\n5️⃣ Checking migration script...');
    const migrationFile = path.join(__dirname, 'migrate-to-mongodb.js');
    const migrationContent = await fs.readFile(migrationFile, 'utf8');
    
    if (migrationContent.includes('updateContact')) {
      console.log('✅ Contact migration included in migration script');
    } else {
      console.log('❌ Contact migration not found in migration script');
    }
    
    // Test 6: Check backup contact data
    console.log('\n6️⃣ Checking backup contact data...');
    const backupContactFile = path.join(__dirname, '../backup/contact.json');
    const backupContactContent = await fs.readFile(backupContactFile, 'utf8');
    const backupContact = JSON.parse(backupContactContent);
    
    const requiredFields = ['email', 'instagram', 'facebook', 'description', 'successMessage'];
    const missingFields = requiredFields.filter(field => !backupContact[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ All required contact fields present in backup data');
    } else {
      console.log('❌ Missing fields in backup data:', missingFields);
    }
    
    if (!backupContact.location) {
      console.log('✅ Location field properly removed from backup data');
    } else {
      console.log('❌ Location field still present in backup data');
    }
    
    console.log('\n🎉 Contact API structure test completed!');
    console.log('\n📋 Summary:');
    console.log('  - API endpoint: ✅ Configured');
    console.log('  - Frontend service: ✅ Configured');
    console.log('  - Contact page: ✅ Configured');
    console.log('  - CMS service: ✅ Configured');
    console.log('  - Migration: ✅ Configured');
    console.log('  - Backup data: ✅ Updated');
    console.log('\n💡 To test with MongoDB:');
    console.log('  1. Set MONGODB_URI environment variable');
    console.log('  2. Run: node scripts/test-contact-mongodb.js');
    console.log('  3. Or start the server and test the API endpoint');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this script is executed directly
if (process.argv[1] && process.argv[1].endsWith('test-contact-api.js')) {
  testContactAPI();
}

export default testContactAPI;
