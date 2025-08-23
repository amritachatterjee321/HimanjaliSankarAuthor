import nodemailer from 'nodemailer';

// Email service for sending contact form messages
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Create transporter using environment variables or default configuration
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
      }
    });
  }

  async sendContactFormEmail(contactData, adminEmail) {
    try {
      const { name, email, subject, message, organization, inquiryType } = contactData;
      
      const emailContent = {
        from: process.env.SMTP_USER || process.env.EMAIL_USER,
        to: adminEmail,
        subject: `New Contact Form Message: ${subject || 'Contact Inquiry'}`,
        html: this.generateContactEmailHTML(contactData),
        text: this.generateContactEmailText(contactData)
      };

      console.log('📧 Sending email to admin:', adminEmail);
      console.log('📧 Email content:', {
        subject: emailContent.subject,
        from: emailContent.from,
        to: emailContent.to
      });

      const result = await this.transporter.sendMail(emailContent);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  generateContactEmailHTML(contactData) {
    const { name, email, subject, message, organization, inquiryType } = contactData;
    const timestamp = new Date().toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Message</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-left: 10px; }
          .message { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Message</h2>
            <p><strong>Received:</strong> ${timestamp}</p>
          </div>
          
          <div class="field">
            <span class="label">Name:</span>
            <span class="value">${name}</span>
          </div>
          
          <div class="field">
            <span class="label">Email:</span>
            <span class="value"><a href="mailto:${email}">${email}</a></span>
          </div>
          
          ${subject ? `
          <div class="field">
            <span class="label">Subject:</span>
            <span class="value">${subject}</span>
          </div>
          ` : ''}
          
          ${organization ? `
          <div class="field">
            <span class="label">Organization:</span>
            <span class="value">${organization}</span>
          </div>
          ` : ''}
          
          ${inquiryType ? `
          <div class="field">
            <span class="label">Inquiry Type:</span>
            <span class="value">${inquiryType}</span>
          </div>
          ` : ''}
          
          <div class="message">
            <div class="label">Message:</div>
            <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${message}</div>
          </div>
          
          <div class="footer">
            <p>This message was sent from the contact form on <a href="https://himanjalisankar.com">himanjalisankar.com</a></p>
            <p>You can reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateContactEmailText(contactData) {
    const { name, email, subject, message, organization, inquiryType } = contactData;
    const timestamp = new Date().toLocaleString();
    
    return `
New Contact Form Message
Received: ${timestamp}

Name: ${name}
Email: ${email}
${subject ? `Subject: ${subject}` : ''}
${organization ? `Organization: ${organization}` : ''}
${inquiryType ? `Inquiry Type: ${inquiryType}` : ''}

Message:
${message}

---
This message was sent from the contact form on himanjalisankar.com
You can reply directly to this email to respond to ${name}.
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;
