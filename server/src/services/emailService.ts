import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs/promises';
// Import SendGrid
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email configuration types
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email templates
interface PasswordResetEmailData {
  email: string;
  firstName: string;
  resetToken: string;
  resetUrl: string;
  expiresIn: string;
}

// Email service configuration for nodemailer fallback
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'test@oneshot.com',
    pass: process.env.SMTP_PASS || 'test-password'
  }
};

// Create transporter (used as fallback if SendGrid is not configured)
const createTransporter = () => {
  if (process.env.NODE_ENV === 'test') {
    // Use test account for testing
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'test-password'
      }
    });
  }

  return nodemailer.createTransport(emailConfig);
};

// Add template IDs near the top of the file
const EMAIL_TEMPLATES = {
  WELCOME: process.env.SENDGRID_WELCOME_TEMPLATE_ID || 'd-xxxxxxxxxxxxxxxxxxxxxxx',
  PASSWORD_RESET: process.env.SENDGRID_PASSWORD_RESET_TEMPLATE_ID || 'd-xxxxxxxxxxxxxxxxxxxxxxx',
  PASSWORD_RESET_CONFIRMATION: process.env.SENDGRID_PASSWORD_RESET_CONFIRMATION_TEMPLATE_ID || 'd-xxxxxxxxxxxxxxxxxxxxxxx',
  PROFILE_VERIFICATION: process.env.SENDGRID_PROFILE_VERIFICATION_TEMPLATE_ID || 'd-xxxxxxxxxxxxxxxxxxxxxxx',
};

/**
 * Generate password reset email HTML template
 */
function generatePasswordResetHTML(data: PasswordResetEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your OneShot Password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .reset-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .reset-button:hover {
            background-color: #1d4ed8;
        }
        .token-info {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 14px;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">OneShot</div>
            <h1 class="title">Reset Your Password</h1>
        </div>
        
        <p>Hi ${data.firstName},</p>
        
        <p>We received a request to reset your password for your OneShot account. If you didn't make this request, you can safely ignore this email.</p>
        
        <p>To reset your password, click the button below:</p>
        
        <div style="text-align: center;">
            <a href="${data.resetUrl}" class="reset-button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <div class="token-info">${data.resetUrl}</div>
        
        <div class="warning">
            <strong>Security Notice:</strong>
            <ul>
                <li>This link will expire in ${data.expiresIn}</li>
                <li>This link can only be used once</li>
                <li>If you didn't request this reset, please contact support</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This email was sent to ${data.email}</p>
            <p>OneShot - Student Athlete Recruiting Platform</p>
            <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Generate password reset email plain text version
 */
function generatePasswordResetText(data: PasswordResetEmailData): string {
  return `
OneShot - Reset Your Password

Hi ${data.firstName},

We received a request to reset your password for your OneShot account. If you didn't make this request, you can safely ignore this email.

To reset your password, visit this link:
${data.resetUrl}

Security Notice:
- This link will expire in ${data.expiresIn}
- This link can only be used once
- If you didn't request this reset, please contact support

This email was sent to ${data.email}

OneShot - Student Athlete Recruiting Platform
  `;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetToken: string,
  resetUrl: string,
  expiresIn: string
): Promise<void> {
  try {
    if (process.env.SENDGRID_API_KEY) {
      // Use SendGrid with template
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@oneshotrecruits.com',
        templateId: EMAIL_TEMPLATES.PASSWORD_RESET,
        dynamicTemplateData: {
          firstName,
          resetUrl,
          expiresIn,
          resetToken
        }
      };
      
      await sgMail.send(msg);
      console.log(`Password reset email sent to ${email} using SendGrid template`);
    } else {
      // Fallback to existing nodemailer implementation
      // ... existing code ...
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send password reset confirmation email
 */
export async function sendPasswordResetConfirmationEmail(
  email: string, 
  firstName: string
): Promise<void> {
  try {
    if (process.env.SENDGRID_API_KEY) {
      // Use SendGrid with template
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@oneshotrecruits.com',
        templateId: EMAIL_TEMPLATES.PASSWORD_RESET_CONFIRMATION,
        dynamicTemplateData: {
          firstName
        }
      };
      
      await sgMail.send(msg);
      console.log(`Password reset confirmation email sent to ${email} using SendGrid template`);
    } else {
      // Fallback to existing nodemailer implementation
      // ... existing code ...
    }
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    throw new Error('Failed to send password reset confirmation email');
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string
): Promise<void> {
  try {
    if (process.env.SENDGRID_API_KEY) {
      // Use SendGrid with template
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@oneshotrecruits.com',
        templateId: EMAIL_TEMPLATES.WELCOME,
        dynamicTemplateData: {
          firstName
        }
      };
      
      await sgMail.send(msg);
      console.log(`Welcome email sent to ${email} using SendGrid template`);
    } else {
      const transporter = createTransporter();
      
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to OneShot</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        h1 {
            color: #0056b3;
            margin-top: 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #0056b3;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.8em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://www.oneshotrecruits.com/logo.png" alt="OneShot Logo" class="logo">
            <h1>Welcome to OneShot!</h1>
        </div>
        
        <p>Hi ${firstName},</p>
        
        <p>Welcome to OneShot! We're thrilled to have you join our community of athletes and coaches.</p>
        
        <p>With your new account, you can:</p>
        <ul>
            <li>Create and customize your athletic profile</li>
            <li>Upload highlight videos and game footage</li>
            <li>Connect with coaches and scouts</li>
            <li>Track your recruiting journey</li>
        </ul>
        
        <p>To get started, click the button below to complete your profile:</p>
        
        <div style="text-align: center;">
            <a href="https://www.oneshotrecruits.com/profile" class="cta-button">Complete Your Profile</a>
        </div>
        
        <p>If you have any questions, our support team is always here to help. Just reply to this email!</p>
        
        <p>Best regards,<br>
        The OneShot Team</p>
        
        <div class="footer">
            <p>© 2025 OneShot. All rights reserved.</p>
            <p>123 Athlete Way, Sports City, SC 12345</p>
        </div>
    </div>
</body>
</html>
      `;
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@oneshotrecruits.com',
        to: email,
        subject: `Welcome to OneShot, ${firstName}!`,
        html: htmlContent
      });
      
      console.log(`Welcome email sent to ${email} using nodemailer`);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}

/**
 * Send profile verification email
 */
export async function sendProfileVerificationEmail(
  email: string,
  firstName: string,
  verificationUrl: string
): Promise<void> {
  try {
    if (process.env.SENDGRID_API_KEY) {
      // Use SendGrid with template
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@oneshotrecruits.com',
        templateId: EMAIL_TEMPLATES.PROFILE_VERIFICATION,
        dynamicTemplateData: {
          firstName,
          verificationUrl
        }
      };
      
      await sgMail.send(msg);
      console.log(`Profile verification email sent to ${email} using SendGrid template`);
    } else {
      const transporter = createTransporter();
      
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your OneShot Profile</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        h1 {
            color: #0056b3;
            margin-top: 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #0056b3;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.8em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://www.oneshotrecruits.com/logo.png" alt="OneShot Logo" class="logo">
            <h1>Verify Your Profile</h1>
        </div>
        
        <p>Hi ${firstName},</p>
        
        <p>Thank you for creating your OneShot profile! To ensure the security of our community, we need to verify your email address.</p>
        
        <p>Please click the button below to verify your profile:</p>
        
        <div style="text-align: center;">
            <a href="${verificationUrl}" class="cta-button">Verify My Profile</a>
        </div>
        
        <p>If you didn't create a OneShot account, you can safely ignore this email.</p>
        
        <p>Best regards,<br>
        The OneShot Team</p>
        
        <div class="footer">
            <p>© 2025 OneShot. All rights reserved.</p>
            <p>123 Athlete Way, Sports City, SC 12345</p>
        </div>
    </div>
</body>
</html>
      `;
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@oneshotrecruits.com',
        to: email,
        subject: `Verify Your OneShot Profile, ${firstName}`,
        html: htmlContent
      });
      
      console.log(`Profile verification email sent to ${email} using nodemailer`);
    }
  } catch (error) {
    console.error('Error sending profile verification email:', error);
    throw new Error('Failed to send profile verification email');
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    // Check if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      // There's no direct verification method for SendGrid, 
      // but we can check if the API key starts with "SG."
      if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        console.warn('SendGrid API key does not start with "SG." - it may be invalid');
      }
      
      if (!process.env.SENDGRID_FROM_EMAIL) {
        console.warn('SENDGRID_FROM_EMAIL not set - using default');
      }
      
      console.log('SendGrid configuration appears valid');
      return true;
    } else {
      // Fall back to nodemailer verification
      const transporter = createTransporter();
      
      // Verify the connection by connecting to the SMTP server
      await transporter.verify();
      console.log('Email configuration test passed');
      return true;
    }
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
} 