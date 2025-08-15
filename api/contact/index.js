// Vercel serverless function for contact API
export default async function handler(req, res) {
  // Enable CORS for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Return contact form configuration
      const contactConfig = {
        title: "Get in Touch",
        subtitle: "I'd love to hear from you. Send me a message and I'll respond as soon as possible.",
        fields: [
          {
            name: "name",
            label: "Name",
            type: "text",
            required: true
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            required: true
          },
          {
            name: "subject",
            label: "Subject",
            type: "text",
            required: true
          },
          {
            name: "message",
            label: "Message",
            type: "textarea",
            required: true
          }
        ],
        submitText: "Send Message",
        successMessage: "Thank you! Your message has been sent successfully.",
        errorMessage: "Sorry, there was an error sending your message. Please try again."
      };
      
      res.status(200).json(contactConfig);
    } catch (error) {
      console.error('Contact API error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, subject, message } = req.body;

      // Basic validation
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
          message: 'All fields are required' 
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: 'Please enter a valid email address' 
        });
      }

      // Log the contact form submission (in production, you'd send an email)
      console.log('Contact form submission:', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      });

      // For now, just return success
      // In production, you'd integrate with an email service
      res.status(200).json({ 
        message: 'Message sent successfully!',
        success: true
      });
    } catch (error) {
      console.error('Contact form submission error:', error);
      res.status(500).json({ 
        message: 'Failed to send message. Please try again.',
        success: false
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
