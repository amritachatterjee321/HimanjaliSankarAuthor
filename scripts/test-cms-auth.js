import fetch from 'node-fetch';

async function testCMSAuth() {
  try {
    console.log('🔍 Testing CMS authentication and homepage config...');
    
    // Step 1: Login to get a token
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/cms/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    console.log('🔐 Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Login failed:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('🔐 Login successful, token received:', loginData.token ? 'Yes' : 'No');
    
    const token = loginData.token;
    console.log('🔐 Token value:', token.substring(0, 20) + '...');
    
    // Step 2: Test homepage config with token
    console.log('\n🏠 Step 2: Testing homepage config with token...');
    const configResponse = await fetch('http://localhost:3000/api/cms/homepage-config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('🏠 Config response status:', configResponse.status);
    
    if (!configResponse.ok) {
      const errorText = await configResponse.text();
      console.error('❌ Homepage config failed:', errorText);
      return;
    }
    
    const configData = await configResponse.json();
    console.log('🏠 Homepage config response:', JSON.stringify(configData, null, 2));
    
    // Step 3: Test without token (should fail)
    console.log('\n🚫 Step 3: Testing homepage config without token...');
    const noTokenResponse = await fetch('http://localhost:3000/api/cms/homepage-config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🚫 No token response status:', noTokenResponse.status);
    const noTokenError = await noTokenResponse.text();
    console.log('🚫 No token error:', noTokenError);
    
  } catch (error) {
    console.error('❌ Error testing CMS auth:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 The server might not be running. Start it with:');
      console.log('   npm start');
    }
  }
}

// Run the test
testCMSAuth();
