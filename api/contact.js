// Vercel serverless function for contact form API
export default async function handler(req, res) {
  // Enable CORS for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          message: 'All fields are required',
          required: ['name', 'email', 'subject', 'message']
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Please provide a valid email address'
        });
      }

      // In production, you would typically:
      // 1. Send an email notification
      // 2. Store the message in a database
      // 3. Integrate with a CRM system
      
      // For now, we'll just log the contact form submission
      console.log('Contact form submission:', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return success response
      res.status(200).json({
        message: 'Thank you for your message! We will get back to you soon.',
        success: true,
        submittedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Contact API error:', error);
      res.status(500).json({
        message: 'Failed to submit contact form. Please try again later.',
        success: false
      });
    }
  } else if (req.method === 'GET') {
    // Return contact form configuration
    res.status(200).json({
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'subject', label: 'Subject', type: 'text', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true }
      ],
      message: 'Contact form is ready to receive submissions'
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
