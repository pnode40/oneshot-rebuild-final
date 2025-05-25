import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs/promises';

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

// Email service configuration
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'test@oneshot.com',
    pass: process.env.SMTP_PASS || 'test-password'
  }
};

// Create transporter
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
  resetToken: string, 
  firstName: string
): Promise<void> {
  try {
    const transporter = createTransporter();
    
    // Generate reset URL (in production, this would be your frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const emailData: PasswordResetEmailData = {
      email,
      firstName,
      resetToken,
      resetUrl,
      expiresIn: '1 hour'
    };

    const htmlContent = generatePasswordResetHTML(emailData);
    const textContent = generatePasswordResetText(emailData);

    const mailOptions = {
      from: `"OneShot Support" <${process.env.SMTP_FROM || 'noreply@oneshot.com'}>`,
      to: email,
      subject: 'Reset Your OneShot Password',
      text: textContent,
      html: htmlContent
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Password reset email sent:', {
      messageId: info.messageId,
      email: email,
      resetToken: resetToken.substring(0, 8) + '...', // Log partial token for debugging
    });

    // In test environment, log preview URL
    if (process.env.NODE_ENV === 'test') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Email delivery failed');
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
    const transporter = createTransporter();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
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
        .success-icon {
            font-size: 48px;
            color: #10b981;
            margin-bottom: 20px;
        }
        .title {
            font-size: 24px;
            margin-bottom: 20px;
            color: #1f2937;
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
            <div class="success-icon">✓</div>
            <h1 class="title">Password Reset Successful</h1>
        </div>
        
        <p>Hi ${firstName},</p>
        
        <p>Your OneShot account password has been successfully reset. You can now log in with your new password.</p>
        
        <p>If you didn't make this change or if you have any concerns about your account security, please contact our support team immediately.</p>
        
        <div class="footer">
            <p>This email was sent to ${email}</p>
            <p>OneShot - Student Athlete Recruiting Platform</p>
        </div>
    </div>
</body>
</html>
    `;

    const textContent = `
OneShot - Password Reset Successful

Hi ${firstName},

Your OneShot account password has been successfully reset. You can now log in with your new password.

If you didn't make this change or if you have any concerns about your account security, please contact our support team immediately.

This email was sent to ${email}

OneShot - Student Athlete Recruiting Platform
    `;

    const mailOptions = {
      from: `"OneShot Support" <${process.env.SMTP_FROM || 'noreply@oneshot.com'}>`,
      to: email,
      subject: 'Password Reset Successful - OneShot',
      text: textContent,
      html: htmlContent
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Password reset confirmation email sent:', {
      messageId: info.messageId,
      email: email
    });

  } catch (error) {
    console.error('Failed to send password reset confirmation email:', error);
    // Don't throw error for confirmation email failure
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
} 