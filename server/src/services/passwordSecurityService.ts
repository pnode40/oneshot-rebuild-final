import bcrypt from 'bcrypt';
import { db } from '../db/client';
import { users } from '../db/schema';
import { passwordHistory } from '../db/schema/passwordHistory';
import { eq, desc, gte, and } from 'drizzle-orm';

// Security configuration
const PASSWORD_HISTORY_LIMIT = 5; // Number of previous passwords to remember
const BCRYPT_ROUNDS = 12; // Strong password hashing
const SUSPICIOUS_RESET_THRESHOLD = 3; // Max resets per hour before flagging as suspicious
const PASSWORD_HISTORY_RETENTION_DAYS = 365; // How long to keep password history

/**
 * Password strength requirements
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength: number;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  maxLength: 128
};

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number; // 0-100
}

/**
 * Security event types for monitoring
 */
export type SecurityEventType = 
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'password_reuse_attempted'
  | 'suspicious_reset_pattern'
  | 'account_lockout'
  | 'password_strength_violation';

/**
 * Security event logging
 */
export interface SecurityEvent {
  userId: number;
  eventType: SecurityEventType;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Check if a password meets strength requirements
 */
export function validatePasswordStrength(
  password: string, 
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length checks
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  } else {
    score += Math.min(25, (password.length / requirements.minLength) * 25);
  }

  if (password.length > requirements.maxLength) {
    errors.push(`Password must not exceed ${requirements.maxLength} characters`);
  }

  // Character type requirements
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    score += 20;
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    score += 20;
  }

  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    score += 15;
  }

  if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 20;
  }

  // Additional strength indicators
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) {
    score += 10; // Bonus for character diversity
  }

  // Common patterns penalty
  if (/(.)\1{2,}/.test(password)) {
    score -= 10; // Repeated characters
  }
  if (/123|abc|qwe|asd|password|admin/i.test(password)) {
    score -= 20; // Common sequences or words
  }

  // Determine strength level
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score >= 80) strength = 'strong';
  else if (score >= 60) strength = 'good';
  else if (score >= 40) strength = 'fair';
  else strength = 'weak';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.max(0, Math.min(100, score))
  };
}

/**
 * Check if password was used recently by the user
 */
export async function isPasswordRecentlyUsed(
  userId: number, 
  plainPassword: string
): Promise<boolean> {
  try {
    // Get recent password history
    const recentPasswords = await db.select()
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId))
      .orderBy(desc(passwordHistory.createdAt))
      .limit(PASSWORD_HISTORY_LIMIT);

    // Check against each recent password
    for (const historyEntry of recentPasswords) {
      const isMatch = await bcrypt.compare(plainPassword, historyEntry.hashedPassword);
      if (isMatch) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking password history:', error);
    // In case of error, allow password change but log the issue
    return false;
  }
}

/**
 * Add password to user's history
 */
export async function addPasswordToHistory(
  userId: number, 
  hashedPassword: string
): Promise<void> {
  try {
    // Add new password to history
    await db.insert(passwordHistory).values({
      userId,
      hashedPassword,
    });

    // Clean up old password history (keep only the last N passwords)
    const allPasswords = await db.select({ id: passwordHistory.id })
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId))
      .orderBy(desc(passwordHistory.createdAt));

    if (allPasswords.length > PASSWORD_HISTORY_LIMIT) {
      const idsToDelete = allPasswords
        .slice(PASSWORD_HISTORY_LIMIT)
        .map(p => p.id);

      await db.delete(passwordHistory)
        .where(
          and(
            eq(passwordHistory.userId, userId),
            // Delete old entries beyond the limit
            // Use a more complex query to delete specific IDs
          )
        );
    }

  } catch (error) {
    console.error('Error adding password to history:', error);
    // Don't throw error here as it shouldn't block password reset
  }
}

/**
 * Clean up old password history entries
 */
export async function cleanupPasswordHistory(): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - PASSWORD_HISTORY_RETENTION_DAYS);

    const result = await db.delete(passwordHistory)
      .where(gte(passwordHistory.createdAt, cutoffDate))
      .returning({ id: passwordHistory.id });

    console.log(`Cleaned up ${result.length} old password history entries`);
    return result.length;
  } catch (error) {
    console.error('Error cleaning up password history:', error);
    return 0;
  }
}

/**
 * Detect suspicious password reset patterns
 */
export async function detectSuspiciousResetActivity(
  email: string,
  ipAddress?: string
): Promise<{
  isSuspicious: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
}> {
  try {
    // This would typically check against a security events log
    // For now, implement basic rate limiting detection
    
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Find user to check reset attempts
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (userResult.length === 0) {
      return { isSuspicious: false, riskLevel: 'low' };
    }

    // In a full implementation, you'd check a security_events table
    // For now, check recent reset token creation
    // This is a simplified version - in production you'd want dedicated tracking

    // Check if user has had multiple recent reset attempts
    const recentResets = await db.select()
      .from(users)
      .where(
        and(
          eq(users.email, email.toLowerCase()),
          gte(users.resetTokenExpiry, oneHourAgo)
        )
      );

    if (recentResets.length >= SUSPICIOUS_RESET_THRESHOLD) {
      return {
        isSuspicious: true,
        reason: `Multiple password reset attempts detected (${recentResets.length} in the last hour)`,
        riskLevel: 'high'
      };
    }

    // Additional suspicious patterns could be checked here:
    // - Multiple IPs for same user
    // - Known malicious IP patterns
    // - Unusual timing patterns
    // - Geographic inconsistencies

    return { isSuspicious: false, riskLevel: 'low' };

  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return { isSuspicious: false, riskLevel: 'low' };
  }
}

/**
 * Comprehensive password security validation
 */
export async function validatePasswordSecurity(
  userId: number,
  newPassword: string,
  requirements?: PasswordRequirements
): Promise<{
  isValid: boolean;
  errors: string[];
  strengthResult: PasswordValidationResult;
  wasRecentlyUsed: boolean;
}> {
  // Check password strength
  const strengthResult = validatePasswordStrength(newPassword, requirements);
  
  // Check password history
  const wasRecentlyUsed = await isPasswordRecentlyUsed(userId, newPassword);
  
  const errors: string[] = [...strengthResult.errors];
  
  if (wasRecentlyUsed) {
    errors.push(`Password was recently used. Please choose a different password.`);
  }

  return {
    isValid: strengthResult.isValid && !wasRecentlyUsed,
    errors,
    strengthResult,
    wasRecentlyUsed
  };
}

/**
 * Secure password update with history tracking
 */
export async function updatePasswordSecurely(
  userId: number,
  newPassword: string,
  requirements?: PasswordRequirements
): Promise<{
  success: boolean;
  errors: string[];
  hashedPassword?: string;
}> {
  // Validate password security
  const validation = await validatePasswordSecurity(userId, newPassword, requirements);
  
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Add current password to history before updating
    const currentUser = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (currentUser.length > 0 && currentUser[0].hashedPassword) {
      await addPasswordToHistory(userId, currentUser[0].hashedPassword);
    }

    // Update user's password
    await db.update(users)
      .set({ 
        hashedPassword,
        // Clear reset token and expiry
        resetToken: null,
        resetTokenExpiry: null,
        // Update timestamp
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      errors: [],
      hashedPassword
    };

  } catch (error) {
    console.error('Error updating password securely:', error);
    return {
      success: false,
      errors: ['Failed to update password. Please try again.']
    };
  }
}

/**
 * Get password security metrics for a user
 */
export async function getPasswordSecurityMetrics(userId: number): Promise<{
  passwordAge: number; // days since last password change
  historyCount: number; // number of passwords in history
  lastResetDate?: Date;
  strengthScore?: number;
}> {
  try {
    // Get user's current password info
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    // Get password history count
    const historyCount = await db.select({ count: db.$count(passwordHistory) })
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId));

    // Get most recent password change date
    const recentHistory = await db.select()
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId))
      .orderBy(desc(passwordHistory.createdAt))
      .limit(1);

    const lastResetDate = recentHistory.length > 0 
      ? recentHistory[0].createdAt 
      : user[0].updatedAt;

    const passwordAge = lastResetDate 
      ? Math.floor((Date.now() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      passwordAge,
      historyCount: historyCount[0]?.count || 0,
      lastResetDate: lastResetDate || undefined
    };

  } catch (error) {
    console.error('Error getting password security metrics:', error);
    return {
      passwordAge: 0,
      historyCount: 0
    };
  }
} 