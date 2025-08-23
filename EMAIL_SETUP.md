# Email Setup for Contact Form

This document explains how to set up email functionality for the contact form on Himanjali Sankar's website.

## Overview

When someone submits a message through the contact form, an email will be automatically sent to the admin email address configured in the CMS settings.

## Features

- **Automatic Email Sending**: Contact form submissions trigger emails to the admin
- **Rich Email Content**: HTML and text versions of emails with formatted contact information
- **Admin Email Configuration**: Admin email is retrieved from CMS settings
- **Fallback Support**: Default admin email if settings are not available
- **Error Handling**: Graceful handling of email delivery failures

## Setup Instructions

### 1. Email Provider Configuration

The system uses **nodemailer** to send emails. You can configure it with any SMTP provider:

#### Option A: Gmail (Recommended)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use these settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-app-password
   ```

#### Option B: Other SMTP Providers
Configure with your preferred email provider:
```
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin email for receiving contact form messages
ADMIN_EMAIL=himanjali.sankar@gmail.com
```

### 3. CMS Settings Configuration

1. Log into the CMS at `/cms`
2. Go to Settings section
3. Set the **Admin Email** field to the email address where you want to receive contact form messages
4. Save the settings

## Email Content

Each contact form submission generates an email with:

### HTML Version
- Professional formatting with CSS styling
- Contact information in organized sections
- Clickable email links
- Timestamp and source information

### Text Version
- Plain text alternative for email clients that don't support HTML
- All the same information in a simple format

### Email Fields Included
- **Name**: Contact's full name
- **Email**: Contact's email address (clickable)
- **Subject**: Message subject (if provided)
- **Organization**: Contact's organization (if provided)
- **Inquiry Type**: Type of inquiry (if selected)
- **Message**: The main message content
- **Timestamp**: When the message was received

## Testing

### Test Email Service
Run the test script to verify email configuration:

```bash
node scripts/test-email.js
```

This will:
1. Test the SMTP connection
2. Send a test email to the admin address
3. Report success or failure

### Test Contact Form
1. Go to the contact page on your website
2. Fill out and submit the contact form
3. Check if you receive the email at the admin address

## Troubleshooting

### Common Issues

#### "Email sending failed" Error
- Check SMTP credentials in environment variables
- Verify email provider settings
- Ensure 2FA is enabled for Gmail (if using Gmail)
- Check if your email provider allows SMTP access

#### "Connection failed" Error
- Verify SMTP_HOST and SMTP_PORT are correct
- Check firewall settings
- Ensure network connectivity

#### Emails not received
- Check spam/junk folder
- Verify admin email address in CMS settings
- Check email provider's sending limits

### Debug Mode
Enable detailed logging by setting:
```env
LOG_LEVEL=DEBUG
```

This will show detailed email service logs in the console.

## Security Considerations

1. **Environment Variables**: Never commit email passwords to version control
2. **App Passwords**: Use app-specific passwords instead of account passwords
3. **Rate Limiting**: Consider implementing rate limiting for contact form submissions
4. **Email Validation**: The system validates email format before sending

## Production Deployment

### Vercel Deployment
1. Add environment variables in Vercel dashboard
2. Ensure all SMTP variables are set
3. Test email functionality after deployment

### Other Platforms
1. Set environment variables according to your platform's requirements
2. Ensure SMTP ports are not blocked
3. Test email functionality thoroughly

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test with the email test script
4. Check your email provider's documentation for SMTP settings
