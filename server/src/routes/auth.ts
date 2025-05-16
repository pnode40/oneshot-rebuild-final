import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db/client';
import { users } from '../db/schema';
import rateLimit from 'express-rate-limit';
import { authenticateJWT } from '../middleware/authMiddleware';
import { eq } from 'drizzle-orm';
// For email sending (commented out until we install @sendgrid/mail)
// import sgMail from '@sendgrid/mail';

// Configure SendGrid (commented out until we install @sendgrid/mail)
// if (process.env.SENDGRID_API_KEY) {
//   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// } else {
//   console.warn('SENDGRID_API_KEY not set. Email functionality will be disabled.');
// }

const router = Router();

// JWT Secret - in production, this should be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'oneshot_dev_secret_key';
const SALT_ROUNDS = 10;

// Rate limiter for login attempts - 5 attempts per IP in 15 minutes
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 5, // 5 attempts per window
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again after 15 minutes."
  },
  statusCode: 429, // Too Many Requests
});

// Validation schema for user registration
const registerSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(['athlete', 'recruiter', 'admin', 'parent']).default('athlete')
});

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

// Validation schema for password reset request
const resetRequestSchema = z.object({
  email: z.string().email("Valid email is required")
});

// Validation schema for password reset
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Rate limiter for reset password requests - 10 attempts per IP in 15 minutes (increased for testing)
const resetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Increased from 3 to 10 for testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many reset attempts from this IP, please try again after 15 minutes."
  },
  statusCode: 429
});

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;

// Registration handler
async function registerUser(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.errors 
      });
    }

    const validatedData = validationResult.data;
    
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, validatedData.email)
      });

      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
      
      // Generate a verification token (for email verification)
      const verificationToken = Math.random().toString(36).substring(2, 15) + 
                               Math.random().toString(36).substring(2, 15);
      
      // Insert the new user
      const result = await db.insert(users)
        .values({
          email: validatedData.email,
          hashedPassword: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          role: validatedData.role,
          isVerified: false,
          emailVerificationToken: verificationToken
        })
        .returning();
      
      if (!result || !result[0]) {
        throw new Error('Failed to create user');
      }
      
      const newUser = result[0];
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          role: newUser.role
        }, 
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return success with token (excluding sensitive data)
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isVerified: newUser.isVerified
        }
      });
      
      // TODO: Send verification email
      // This would be implemented with an email service
      
    } catch (error) {
      console.error('Database operation failed:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to register user' 
      });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred' 
    });
  }
}

// Login handler
async function loginUser(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.errors 
      });
    }

    const { email, password } = validationResult.data;
    
    try {
      // Find user by email
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
      
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role
        }, 
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return success with token (excluding sensitive data)
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified
        }
      });
      
    } catch (error) {
      console.error('Login failed:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process login request' 
      });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred' 
    });
  }
}

/**
 * POST /api/auth/request-reset
 * Request a password reset link
 */
router.post('/request-reset', resetRateLimiter, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = resetRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.errors 
      });
    }

    const { email } = validationResult.data;
    
    // Find user by email
    console.log('Searching for user with email:', email);
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });
    console.log('User found:', user ? 'Yes' : 'No');

    // For security reasons, always return success even if user doesn't exist
    if (!user) {
      console.log(`Reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        message: "If this email is registered, you will receive reset instructions shortly."
      });
    }
    
    try {
      // Generate a unique reset token
      console.log('Generating reset token...');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Store the reset token and expiry in the database
      console.log('Updating user with reset token...');
      await db.update(users)
        .set({
          resetToken: resetToken,
          resetTokenExpiry: resetTokenExpiry
        })
        .where(eq(users.id, user.id));
      console.log('User updated with reset token');
      
      // Create reset URL
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      
      // In a real environment, we would send an email here using SendGrid
      console.log(`Reset URL for ${email}: ${resetUrl}`);
      
      // Commented out until @sendgrid/mail is installed
      /*
      if (process.env.SENDGRID_API_KEY) {
        const msg = {
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@oneshot.com',
          subject: 'OneShot Password Reset',
          text: `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`,
          html: `
            <div>
              <h1>Password Reset</h1>
              <p>You requested a password reset for your OneShot account.</p>
              <p>Please click the button below to reset your password:</p>
              <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; cursor: pointer; text-decoration: none;">
                Reset Password
              </a>
              <p>If you did not request this reset, please ignore this email.</p>
              <p>This link will expire in 1 hour.</p>
            </div>
          `
        };
        
        await sgMail.send(msg);
      }
      */
      
      return res.status(200).json({
        message: "If this email is registered, you will receive reset instructions shortly.",
        // Include resetUrl in development mode only
        ...(process.env.NODE_ENV !== 'production' && { resetUrl })
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Reset request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process reset request' 
    });
  }
});

/**
 * GET /api/auth/reset/:token
 * Verify a reset token is valid
 */
router.get('/reset/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Find user with this reset token
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.resetToken, token)
    });
    
    // Check if token exists and is not expired
    if (!user || !user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }
    
    // Token is valid
    return res.status(200).json({
      success: true,
      message: 'Valid reset token',
      email: user.email
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate reset token' 
    });
  }
});

/**
 * POST /api/auth/reset/:token
 * Reset password using a valid token
 */
router.post('/reset/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.errors 
      });
    }
    
    // Find user with this reset token
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.resetToken, token)
    });
    
    // Check if token exists and is not expired
    if (!user || !user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(validationResult.data.password, SALT_ROUNDS);
    
    // Update user with new password and clear reset token
    await db.update(users)
      .set({
        hashedPassword: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      })
      .where(eq(users.id, user.id));
    
    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password' 
    });
  }
});

// POST /api/auth/register - Register a new user
router.post('/register', registerUser);

// POST /api/auth/login - Login an existing user
// Apply rate limiter to login route only
router.post('/login', loginRateLimiter, loginUser);

// GET /api/auth/profile - Get current user profile (protected route)
router.get('/profile', authenticateJWT, (req: Request, res: Response) => {
  // Access user from the request (added by authenticateJWT middleware)
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'User not authenticated' 
    });
  }
  
  // Return user data (excluding sensitive information)
  res.status(200).json({
    success: true,
    user: {
      id: user.userId,
      email: user.email,
      role: user.role
    }
  });
});

export default router; 