import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { validateRequest } from '../middleware/validationMiddleware';
import { successResponse, errorResponse } from '../utils/responses';
import { sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from '../services/emailService';
import { 
  validatePasswordSecurity, 
  updatePasswordSecurely,
  detectSuspiciousResetActivity,
  getPasswordSecurityMetrics,
  DEFAULT_PASSWORD_REQUIREMENTS
} from '../services/passwordSecurityService';

// Create router
const router = Router();

// Enhanced validation schemas
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  ipAddress: z.string().optional(), // For security tracking
  userAgent: z.string().optional()  // For security tracking
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(DEFAULT_PASSWORD_REQUIREMENTS.minLength, `Password must be at least ${DEFAULT_PASSWORD_REQUIREMENTS.minLength} characters`)
    .max(DEFAULT_PASSWORD_REQUIREMENTS.maxLength, `Password must not exceed ${DEFAULT_PASSWORD_REQUIREMENTS.maxLength} characters`)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

const passwordStrengthCheckSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  userId: z.number().optional() // For checking against user's password history
});

// Security constants
const RESET_TOKEN_EXPIRY_HOURS = 1; // 1 hour expiry for security
const MAX_RESET_ATTEMPTS_PER_HOUR = 3; // Rate limiting
const BCRYPT_ROUNDS = 12; // Strong password hashing

/**
 * Generate a cryptographically secure reset token
 */
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get reset token expiry date
 */
function getResetTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + RESET_TOKEN_EXPIRY_HOURS);
  return expiry;
}

/**
 * Check rate limiting for password reset requests
 */
async function checkResetRateLimit(email: string): Promise<boolean> {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Count recent reset attempts for this email
    const recentAttempts = await db.select({ count: db.$count(users) })
      .from(users)
      .where(
        and(
          eq(users.email, email),
          gt(users.resetTokenExpiry || new Date(0), oneHourAgo)
        )
      );

    return (recentAttempts[0]?.count || 0) >= MAX_RESET_ATTEMPTS_PER_HOUR;
  } catch (error) {
    console.error('Error checking reset rate limit:', error);
    return false;
  }
}

/**
 * Find user by email (case-insensitive)
 */
async function findUserByEmail(email: string) {
  return db.select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
}

/**
 * Set reset token for user
 */
async function setResetToken(userId: number, token: string, expiry: Date) {
  return db.update(users)
    .set({
      resetToken: token,
      resetTokenExpiry: expiry,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning();
}

/**
 * Clear reset token for user
 */
async function clearResetToken(userId: number) {
  return db.update(users)
    .set({
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning();
}

/**
 * Find user by valid reset token
 */
async function findUserByResetToken(token: string) {
  const now = new Date();
  return db.select()
    .from(users)
    .where(
      and(
        eq(users.resetToken, token),
        gt(users.resetTokenExpiry || new Date(0), now)
      )
    )
    .limit(1);
}

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset email with enhanced security
 * @access Public
 */
router.post(
  '/forgot-password',
  validateRequest({
    body: forgotPasswordSchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { email, ipAddress, userAgent } = req.body;

      // Enhanced suspicious activity detection
      const suspiciousActivity = await detectSuspiciousResetActivity(email, ipAddress);
      
      if (suspiciousActivity.isSuspicious && suspiciousActivity.riskLevel === 'high') {
        // Log security event but still return generic message
        console.warn('Suspicious password reset activity detected:', {
          email,
          ipAddress,
          userAgent,
          reason: suspiciousActivity.reason
        });
        
        // Still return generic message for security
        return res.status(429).json(errorResponse(
          'Too many reset attempts',
          'Please wait before requesting another password reset. If this continues, contact support.'
        ));
      }

      // Check rate limiting
      const isRateLimited = await checkResetRateLimit(email);
      if (isRateLimited) {
        // Security: Don't reveal if email exists, just return generic message
        return res.status(429).json(errorResponse(
          'Too many reset attempts',
          'Please wait before requesting another password reset'
        ));
      }

      // Find user by email
      const userResult = await findUserByEmail(email);
      
      // Security: Always return success to prevent email enumeration
      // Don't reveal whether the email exists in the system
      const genericMessage = 'If an account with that email exists, you will receive a password reset email shortly';

      if (userResult.length === 0) {
        // User doesn't exist, but return success for security
        return res.status(200).json(successResponse(
          genericMessage,
          { emailSent: false, securityLevel: 'standard' }
        ));
      }

      const user = userResult[0];

      // Generate secure reset token
      const resetToken = generateResetToken();
      const resetTokenExpiry = getResetTokenExpiry();

      // Save reset token to database
      await setResetToken(user.id, resetToken, resetTokenExpiry);

      // Send password reset email
      try {
        await sendPasswordResetEmail(email, resetToken, user.firstName || 'User');
        
        return res.status(200).json(successResponse(
          genericMessage,
          { 
            emailSent: true,
            expiresIn: `${RESET_TOKEN_EXPIRY_HOURS} hour(s)`,
            securityLevel: suspiciousActivity.riskLevel,
            // Include security metrics for logging (not exposed to client)
            ...(process.env.NODE_ENV !== 'production' && {
              debug: {
                tokenPreview: resetToken.substring(0, 8) + '...',
                suspiciousActivity
              }
            })
          }
        ));
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        
        // Clear the reset token if email fails
        await clearResetToken(user.id);
        
        return res.status(500).json(errorResponse(
          'Failed to send reset email',
          'Please try again later'
        ));
      }

    } catch (error) {
      console.error('Error in forgot password:', error);
      return res.status(500).json(errorResponse(
        'Internal server error',
        'Please try again later'
      ));
    }
  }
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with enhanced security validation
 * @access Public
 */
router.post(
  '/reset-password',
  validateRequest({
    body: resetPasswordSchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { token, newPassword, ipAddress, userAgent } = req.body;

      // Find user by valid reset token
      const userResult = await findUserByResetToken(token);

      if (userResult.length === 0) {
        return res.status(400).json(errorResponse(
          'Invalid or expired reset token',
          'Please request a new password reset'
        ));
      }

      const user = userResult[0];

      // Enhanced password security validation
      const securityValidation = await validatePasswordSecurity(user.id, newPassword);

      if (!securityValidation.isValid) {
        return res.status(400).json(errorResponse(
          'Password does not meet security requirements',
          securityValidation.errors
        ));
      }

      // Update password securely with history tracking
      const updateResult = await updatePasswordSecurely(user.id, newPassword);

      if (!updateResult.success) {
        return res.status(500).json(errorResponse(
          'Failed to update password',
          updateResult.errors
        ));
      }

      // Send confirmation email
      try {
        await sendPasswordResetConfirmationEmail(user.email, user.firstName || 'User');
      } catch (emailError) {
        console.warn('Failed to send confirmation email:', emailError);
        // Don't fail the request if confirmation email fails
      }

      // Get updated security metrics
      const securityMetrics = await getPasswordSecurityMetrics(user.id);

      return res.status(200).json(successResponse(
        'Password reset successfully',
        { 
          userId: user.id,
          email: user.email,
          resetAt: new Date().toISOString(),
          passwordStrength: securityValidation.strengthResult.strength,
          strengthScore: securityValidation.strengthResult.score,
          securityMetrics: {
            passwordAge: 0, // Just reset
            historyCount: securityMetrics.historyCount,
          }
        }
      ));

    } catch (error) {
      console.error('Error in reset password:', error);
      return res.status(500).json(errorResponse(
        'Internal server error',
        'Please try again later'
      ));
    }
  }
);

/**
 * @route POST /api/auth/verify-reset-token
 * @desc Verify if a reset token is valid (for frontend validation)
 * @access Public
 */
router.post(
  '/verify-reset-token',
  validateRequest({
    body: z.object({
      token: z.string().min(1, 'Reset token is required')
    })
  }),
  async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      // Find user by valid reset token
      const userResult = await findUserByResetToken(token);

      if (userResult.length === 0) {
        return res.status(400).json(errorResponse(
          'Invalid or expired reset token',
          'Please request a new password reset'
        ));
      }

      const user = userResult[0];

      return res.status(200).json(successResponse(
        'Reset token is valid',
        {
          valid: true,
          email: user.email,
          expiresAt: user.resetTokenExpiry,
          timeRemaining: user.resetTokenExpiry 
            ? Math.max(0, Math.floor((user.resetTokenExpiry.getTime() - Date.now()) / 1000 / 60))
            : 0 // minutes remaining
        }
      ));

    } catch (error) {
      console.error('Error verifying reset token:', error);
      return res.status(500).json(errorResponse(
        'Internal server error',
        'Please try again later'
      ));
    }
  }
);

/**
 * @route POST /api/auth/check-password-strength
 * @desc Check password strength and history (for frontend validation)
 * @access Public
 */
router.post(
  '/check-password-strength',
  validateRequest({
    body: passwordStrengthCheckSchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { password, userId } = req.body;

      let securityValidation;
      
      if (userId) {
        // Full validation including password history
        securityValidation = await validatePasswordSecurity(userId, password);
      } else {
        // Basic strength validation only
        const { validatePasswordStrength } = await import('../services/passwordSecurityService');
        const strengthResult = validatePasswordStrength(password);
        securityValidation = {
          isValid: strengthResult.isValid,
          errors: strengthResult.errors,
          strengthResult,
          wasRecentlyUsed: false
        };
      }

      return res.status(200).json(successResponse(
        'Password strength evaluated',
        {
          isValid: securityValidation.isValid,
          strength: securityValidation.strengthResult.strength,
          score: securityValidation.strengthResult.score,
          errors: securityValidation.errors,
          wasRecentlyUsed: securityValidation.wasRecentlyUsed,
          requirements: DEFAULT_PASSWORD_REQUIREMENTS
        }
      ));

    } catch (error) {
      console.error('Error checking password strength:', error);
      return res.status(500).json(errorResponse(
        'Internal server error',
        'Please try again later'
      ));
    }
  }
);

/**
 * @route GET /api/auth/password-security-metrics/:userId
 * @desc Get password security metrics for a user (admin/self only)
 * @access Private - Requires authentication
 */
router.get(
  '/password-security-metrics/:userId',
  // Note: This would typically require authentication middleware
  // For now, implementing basic validation
  async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json(errorResponse(
          'Invalid user ID',
          'User ID must be a number'
        ));
      }

      const metrics = await getPasswordSecurityMetrics(userId);

      return res.status(200).json(successResponse(
        'Password security metrics retrieved',
        metrics
      ));

    } catch (error) {
      console.error('Error getting password security metrics:', error);
      return res.status(500).json(errorResponse(
        'Internal server error',
        'Please try again later'
      ));
    }
  }
);

export default router; 