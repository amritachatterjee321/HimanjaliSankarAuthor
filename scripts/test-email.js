import dotenv from 'dotenv';
import emailService from '../api/lib/email.js';

// Load environment variables
dotenv.config();

async function testEmailService() {
  console.log('🧪 Testing Email Service...');
  
  // Test connection
  console.log('\n1. Testing email connection...');
  const connectionTest = await emailService.testConnection();
  console.log('Connection test result:', connectionTest ? '✅ PASSED' : '❌ FAILED');
  
  // Test email sending
  console.log('\n2. Testing email sending...');
  const testContactData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Contact Form Submission',
    message: 'This is a test message from the contact form to verify email functionality.',
    organization: 'Test Organization',
    inquiryType: 'test'
  };
  
  const adminEmail = process.env.ADMIN_EMAIL || 'himanjali.sankar@gmail.com';
  
  try {
    const result = await emailService.sendContactFormEmail(testContactData, adminEmail);
    console.log('✅ Email test PASSED:', result);
  } catch (error) {
    console.error('❌ Email test FAILED:', error.message);
  }
  
  console.log('\n📧 Email service test completed');
}

// Run the test
testEmailService().catch(console.error);
