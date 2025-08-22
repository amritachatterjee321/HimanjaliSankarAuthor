// Production Contact API Test Script
// This script tests the contact API functionality that will be used in production

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testProductionContactAPI() {
  console.log('🚀 Testing Contact API for Production Deployment...\n');
  
  const results = {
    vercelConfig: false,
    apiEndpoint: false,
    mongoDBConfig: false,
    environmentVars: false,
    fallbackData: false,
    errorHandling: false,
    securityHeaders: false
  };

  try {
    // Test 1: Vercel Configuration
    console.log('1️⃣ Checking Vercel Configuration...');
    const vercelFile = path.join(__dirname, '../vercel.json');
    const vercelContent = await fs.readFile(vercelFile, 'utf8');
    const vercelConfig = JSON.parse(vercelContent);
    
    // Check if contact API routes are configured
    const contactRoutes = vercelConfig.rewrites.filter(route => 
      route.source.includes('contact') || route.destination.includes('contact')
    );
    
    if (contactRoutes.length > 0) {
      console.log('✅ Contact API routes found in vercel.json:');
      contactRoutes.forEach(route => {
        console.log(`   - ${route.source} → ${route.destination}`);
      });
      results.vercelConfig = true;
    } else {
      console.log('❌ No contact API routes found in vercel.json');
    }

    // Test 2: API Endpoint Structure
    console.log('\n2️⃣ Checking API Endpoint Structure...');
    const apiFile = path.join(__dirname, '../api/cms.js');
    const apiContent = await fs.readFile(apiFile, 'utf8');
    
    const requiredFunctions = [
      'handleContact',
      'getMockContact',
      'isMongoDBAvailable',
      'clientPromise'
    ];
    
    const missingFunctions = requiredFunctions.filter(func => !apiContent.includes(func));
    
    if (missingFunctions.length === 0) {
      console.log('✅ All required functions found in API');
      results.apiEndpoint = true;
    } else {
      console.log('❌ Missing functions:', missingFunctions);
    }

    // Test 3: MongoDB Configuration
    console.log('\n3️⃣ Checking MongoDB Configuration...');
    const mongoFile = path.join(__dirname, '../api/lib/mongodb.js');
    const mongoContent = await fs.readFile(mongoFile, 'utf8');
    
    if (mongoContent.includes('process.env.MONGODB_URI') && 
        mongoContent.includes('isMongoDBAvailable') &&
        mongoContent.includes('getDatabaseName')) {
      console.log('✅ MongoDB configuration properly set up');
      results.mongoDBConfig = true;
    } else {
      console.log('❌ MongoDB configuration incomplete');
    }

    // Test 4: Environment Variables
    console.log('\n4️⃣ Checking Environment Variables...');
    const envFile = path.join(__dirname, '../env.example');
    const envContent = await fs.readFile(envFile, 'utf8');
    
    const requiredEnvVars = ['MONGODB_URI', 'DB_NAME', 'NODE_ENV'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !envContent.includes(envVar));
    
    if (missingEnvVars.length === 0) {
      console.log('✅ All required environment variables documented');
      results.environmentVars = true;
    } else {
      console.log('❌ Missing environment variables:', missingEnvVars);
    }

    // Test 5: Fallback Data
    console.log('\n5️⃣ Checking Fallback Data...');
    if (apiContent.includes('getMockContact')) {
      const mockContactMatch = apiContent.match(/function getMockContact\(\) \{[\s\S]*?return \{[\s\S]*?\};[\s\S]*?\}/);
      if (mockContactMatch) {
        console.log('✅ Fallback contact data function found');
        results.fallbackData = true;
      } else {
        console.log('❌ Fallback contact data function incomplete');
      }
    } else {
      console.log('❌ No fallback contact data function found');
    }

    // Test 6: Error Handling
    console.log('\n6️⃣ Checking Error Handling...');
    const errorHandlingPatterns = [
      'try {',
      'catch (error)',
      'res.status(500)',
      'console.error'
    ];
    
    const missingErrorHandling = errorHandlingPatterns.filter(pattern => !apiContent.includes(pattern));
    
    if (missingErrorHandling.length === 0) {
      console.log('✅ Proper error handling implemented');
      results.errorHandling = true;
    } else {
      console.log('❌ Missing error handling patterns:', missingErrorHandling);
    }

    // Test 7: Security Headers
    console.log('\n7️⃣ Checking Security Headers...');
    if (vercelContent.includes('X-Content-Type-Options') && 
        vercelContent.includes('X-Frame-Options') && 
        vercelContent.includes('X-XSS-Protection')) {
      console.log('✅ Security headers configured in vercel.json');
      results.securityHeaders = true;
    } else {
      console.log('❌ Security headers not properly configured');
    }

    // Test 8: Production Deployment Documentation
    console.log('\n8️⃣ Checking Production Documentation...');
    const prodDeploymentFile = path.join(__dirname, '../PRODUCTION_DEPLOYMENT.md');
    try {
      const prodContent = await fs.readFile(prodDeploymentFile, 'utf8');
      if (prodContent.includes('MONGODB_URI') && prodContent.includes('Environment Variables')) {
        console.log('✅ Production deployment documentation exists');
      } else {
        console.log('⚠️ Production deployment documentation incomplete');
      }
    } catch (error) {
      console.log('❌ Production deployment documentation not found');
    }

    // Summary
    console.log('\n📋 Production Readiness Summary:');
    console.log('================================');
    
    const passedTests = Object.values(results).filter(result => result).length;
    const totalTests = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test.replace(/([A-Z])/g, ' $1').trim()}`);
    });
    
    console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Contact API is ready for production deployment!');
    } else {
      console.log('⚠️ Some issues need to be addressed before production deployment');
    }

    // Production Deployment Checklist
    console.log('\n📝 Production Deployment Checklist:');
    console.log('===================================');
    console.log('1. Set MONGODB_URI environment variable in Vercel');
    console.log('2. Set DB_NAME environment variable in Vercel');
    console.log('3. Set NODE_ENV=production in Vercel');
    console.log('4. Deploy to Vercel using git push');
    console.log('5. Test contact API endpoint after deployment');
    console.log('6. Verify MongoDB connection in production');
    console.log('7. Test CMS contact management functionality');

    // API Endpoint Testing Instructions
    console.log('\n🧪 Testing Instructions After Deployment:');
    console.log('=========================================');
    console.log('1. Test GET /api/cms?endpoint=contact');
    console.log('2. Test PUT /api/cms?endpoint=contact (with auth)');
    console.log('3. Verify contact page loads dynamic data');
    console.log('4. Test CMS contact form updates');
    console.log('5. Check MongoDB connection logs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this script is executed directly
if (process.argv[1] && process.argv[1].endsWith('test-production-contact-api.js')) {
  testProductionContactAPI();
}

export default testProductionContactAPI;
