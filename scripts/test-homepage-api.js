import fetch from 'node-fetch';

async function testHomepageAPI() {
  try {
    console.log('🔍 Testing homepage configuration API endpoint...');
    
    // Test the API endpoint directly
    const response = await fetch('http://localhost:3000/api/cms/homepage-config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 The server might not be running. Start it with:');
      console.log('   npm start');
      console.log('   or');
      console.log('   node server.js');
    }
  }
}

// Run the test
testHomepageAPI();
