const fetch = require('node-fetch');

async function testAuthorAPI() {
  try {
    console.log('Testing author API...');
    const response = await fetch('http://localhost:3000/api/about');
    const data = await response.json();
    
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\nAuthor Data Source Analysis:');
      console.log('- Name:', data.data.name);
      console.log('- Bio length:', data.data.bio?.length || 0);
      console.log('- Awards count:', data.data.awards?.length || 0);
      console.log('- Genres count:', data.data.genres?.length || 0);
      console.log('- Has MongoDB _id:', !!data.data._id);
      
      if (data.data._id) {
        console.log('- Source: MongoDB (CMS Database)');
      } else {
        console.log('- Source: Static JSON file');
      }
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAuthorAPI();
