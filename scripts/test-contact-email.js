import fetch from 'node-fetch';

// Test the contact form API with email functionality
async function testContactFormAPI() {
  console.log('🧪 Testing Contact Form API with Email...');
  
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Contact Form Submission',
    message: 'This is a test message to verify that the contact form API is working correctly and sending emails.',
    organization: 'Test Organization',
    inquiryType: 'test'
  };
  
  try {
    console.log('📤 Sending test contact form data:', testData);
    
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('📥 API Response:', result);
    
    if (response.ok && result.success) {
      console.log('✅ Contact form API test PASSED');
      console.log('📧 Email should have been sent to admin');
    } else {
      console.log('❌ Contact form API test FAILED');
      console.log('Error:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Contact form API test FAILED:', error.message);
  }
  
  console.log('\n📧 Contact form API test completed');
}

// Run the test
testContactFormAPI().catch(console.error);
