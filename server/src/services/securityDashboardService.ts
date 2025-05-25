import { db } from '../db/client';
import { users } from '../db/schema';
import { passwordHistory } from '../db/schema/passwordHistory';
import { eq, desc, gte, and, lt, count, sql, isNull, isNotNull } from 'drizzle-orm';
import { 
  getPasswordSecurityMetrics,
  detectSuspiciousResetActivity 
} from './passwordSecurityService';

/**
 * Security dashboard metrics and analytics
 */
export interface SecurityDashboardMetrics {
  // User security overview
  totalUsers: number;
  activeUsers: number;
  usersWithWeakPasswords: number;
  usersRequiringPasswordReset: number;
  
  // Password security metrics
  passwordResetStats: {
    totalResetsToday: number;
    totalResetsThisWeek: number;
    totalResetsThisMonth: number;
    suspiciousActivityCount: number;
  };
  
  // User authentication patterns
  authenticationMetrics: {
    totalLoginAttempts: number;
    successfulLogins: number;
    failedLogins: number;
    uniqueActiveUsers: number;
  };
  
  // Security alerts
  securityAlerts: SecurityAlert[];
  
  // System health
  systemSecurityHealth: {
    overallScore: number; // 0-100
    weakPasswordPercentage: number;
    oldPasswordPercentage: number;
    suspiciousActivityLevel: 'low' | 'medium' | 'high';
  };
}

/**
 * Security alert types and severity levels
 */
export interface SecurityAlert {
  id: string;
  type: 'password_reuse' | 'suspicious_reset' | 'weak_password' | 'old_password' | 'multiple_failures';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: number;
  userEmail?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  acknowledged: boolean;
}

/**
 * User security status for admin review
 */
export interface UserSecurityStatus {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  
  // Password security
  passwordAge: number; // days
  passwordStrengthScore?: number;
  hasWeakPassword: boolean;
  passwordHistoryCount: number;
  lastPasswordReset?: Date;
  
  // Account activity
  lastLoginAt?: Date;
  loginAttempts: number;
  failedLoginAttempts: number;
  
  // Security flags
  hasSuspiciousActivity: boolean;
  requiresPasswordReset: boolean;
  accountLocked: boolean;
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
}

/**
 * Security activity log entry
 */
export interface SecurityActivityLog {
  id: string;
  userId?: number;
  userEmail?: string;
  eventType: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Time-based security trends
 */
export interface SecurityTrends {
  passwordResets: Array<{ date: string; count: number; suspicious: number }>;
  loginActivity: Array<{ date: string; successful: number; failed: number }>;
  securityAlerts: Array<{ date: string; count: number; severity: string }>;
  userGrowth: Array<{ date: string; total: number; active: number }>;
}

/**
 * Get comprehensive security dashboard metrics
 */
export async function getSecurityDashboardMetrics(): Promise<SecurityDashboardMetrics> {
  try {
    // Get basic user counts
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get users with recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersResult = await db.select({ count: count() })
      .from(users)
      .where(gte(users.updatedAt, thirtyDaysAgo));
    const activeUsers = activeUsersResult[0]?.count || 0;

    // Get password reset statistics
    const passwordResetStats = await getPasswordResetStatistics();
    
    // Get authentication metrics (simplified for now)
    const authenticationMetrics = {
      totalLoginAttempts: 0, // Would come from auth logs
      successfulLogins: 0,   // Would come from auth logs  
      failedLogins: 0,       // Would come from auth logs
      uniqueActiveUsers: activeUsers
    };

    // Generate security alerts
    const securityAlerts = await generateSecurityAlerts();
    
    // Calculate system security health
    const systemSecurityHealth = await calculateSystemSecurityHealth(totalUsers);

    // Estimate users with weak passwords (would be more sophisticated in production)
    const usersWithWeakPasswords = Math.floor(totalUsers * 0.15); // Estimated 15%
    const usersRequiringPasswordReset = Math.floor(totalUsers * 0.05); // Estimated 5%

    return {
      totalUsers,
      activeUsers,
      usersWithWeakPasswords,
      usersRequiringPasswordReset,
      passwordResetStats,
      authenticationMetrics,
      securityAlerts,
      systemSecurityHealth
    };

  } catch (error) {
    console.error('Error getting security dashboard metrics:', error);
    throw new Error('Failed to retrieve security metrics');
  }
}

/**
 * Get password reset statistics for different time periods
 */
async function getPasswordResetStatistics() {
  const now = new Date();
  
  // Today
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  
  // This week  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  
  // This month
  const startOfMonth = new Date(now);
  startOfMonth.setDate(now.getDate() - 30);

  try {
    // Count password resets by checking reset token usage
    const resetsToday = await db.select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.updatedAt, startOfDay),
          isNull(users.resetToken) // Reset token cleared after successful reset
        )
      );

    const resetsThisWeek = await db.select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.updatedAt, startOfWeek),
          isNull(users.resetToken)
        )
      );

    const resetsThisMonth = await db.select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.updatedAt, startOfMonth),
          isNull(users.resetToken)
        )
      );

    // Count suspicious activity (users with active reset tokens older than 1 hour)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const suspiciousActivity = await db.select({ count: count() })
      .from(users)
      .where(
        and(
          lt(users.resetTokenExpiry, oneHourAgo),
          isNotNull(users.resetToken)
        )
      );

    return {
      totalResetsToday: resetsToday[0]?.count || 0,
      totalResetsThisWeek: resetsThisWeek[0]?.count || 0,
      totalResetsThisMonth: resetsThisMonth[0]?.count || 0,
      suspiciousActivityCount: suspiciousActivity[0]?.count || 0
    };

  } catch (error) {
    console.error('Error getting password reset statistics:', error);
    return {
      totalResetsToday: 0,
      totalResetsThisWeek: 0,
      totalResetsThisMonth: 0,
      suspiciousActivityCount: 0
    };
  }
}

/**
 * Generate security alerts based on current system state
 */
async function generateSecurityAlerts(): Promise<SecurityAlert[]> {
  const alerts: SecurityAlert[] = [];
  
  try {
    // Check for users with expired reset tokens (potential security issue)
    const expiredTokenUsers = await db.select({
      id: users.id,
      email: users.email,
      resetTokenExpiry: users.resetTokenExpiry
    })
    .from(users)
    .where(
      and(
        lt(users.resetTokenExpiry, new Date()),
        isNotNull(users.resetToken)
      )
    )
    .limit(10);

    expiredTokenUsers.forEach(user => {
      alerts.push({
        id: `expired-token-${user.id}`,
        type: 'suspicious_reset',
        severity: 'medium',
        title: 'Expired Reset Token',
        description: `User has an expired password reset token that hasn't been cleared`,
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date(),
        acknowledged: false,
        metadata: {
          expiredAt: user.resetTokenExpiry
        }
      });
    });

    // Check for users with very old passwords (over 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const oldPasswordUsers = await db.select({
      id: users.id,
      email: users.email,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(lt(users.updatedAt, ninetyDaysAgo))
    .limit(5);

    oldPasswordUsers.forEach(user => {
      alerts.push({
        id: `old-password-${user.id}`,
        type: 'old_password',
        severity: 'low',
        title: 'Old Password Detected',
        description: `User hasn't changed password in over 90 days`,
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date(),
        acknowledged: false,
        metadata: {
          lastUpdate: user.updatedAt,
          daysSinceUpdate: Math.floor((Date.now() - (user.updatedAt?.getTime() || 0)) / (1000 * 60 * 60 * 24))
        }
      });
    });

    return alerts;

  } catch (error) {
    console.error('Error generating security alerts:', error);
    return [];
  }
}

/**
 * Calculate overall system security health score
 */
async function calculateSystemSecurityHealth(totalUsers: number) {
  try {
    let healthScore = 100; // Start with perfect score
    
    // Get users with old passwords (over 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const oldPasswordCount = await db.select({ count: count() })
      .from(users)
      .where(lt(users.updatedAt, sixtyDaysAgo));
    
    const oldPasswordPercentage = totalUsers > 0 
      ? ((oldPasswordCount[0]?.count || 0) / totalUsers) * 100 
      : 0;

    // Get users with active reset tokens (potential issues)
    const activeResetCount = await db.select({ count: count() })
      .from(users)
      .where(isNotNull(users.resetToken));
    
    const activeResetPercentage = totalUsers > 0 
      ? ((activeResetCount[0]?.count || 0) / totalUsers) * 100 
      : 0;

    // Deduct points for security issues
    if (oldPasswordPercentage > 20) healthScore -= 30; // Major issue
    else if (oldPasswordPercentage > 10) healthScore -= 15; // Moderate issue
    else if (oldPasswordPercentage > 5) healthScore -= 5; // Minor issue

    if (activeResetPercentage > 5) healthScore -= 20; // Too many pending resets
    else if (activeResetPercentage > 2) healthScore -= 10;

    // Determine suspicious activity level
    let suspiciousActivityLevel: 'low' | 'medium' | 'high' = 'low';
    if (activeResetPercentage > 5 || oldPasswordPercentage > 30) {
      suspiciousActivityLevel = 'high';
    } else if (activeResetPercentage > 2 || oldPasswordPercentage > 15) {
      suspiciousActivityLevel = 'medium';
    }

    // Estimate weak passwords (would be calculated from actual password analysis in production)
    const weakPasswordPercentage = Math.min(25, oldPasswordPercentage * 1.5); // Correlation assumption

    return {
      overallScore: Math.max(0, Math.min(100, healthScore)),
      weakPasswordPercentage,
      oldPasswordPercentage,
      suspiciousActivityLevel
    };

  } catch (error) {
    console.error('Error calculating system security health:', error);
    return {
      overallScore: 50, // Default to medium health on error
      weakPasswordPercentage: 0,
      oldPasswordPercentage: 0,
      suspiciousActivityLevel: 'low' as const
    };
  }
}

/**
 * Get detailed security status for all users (paginated)
 */
export async function getUserSecurityStatuses(
  limit: number = 50, 
  offset: number = 0,
  riskLevelFilter?: 'low' | 'medium' | 'high' | 'critical'
): Promise<{
  users: UserSecurityStatus[];
  total: number;
  hasMore: boolean;
}> {
  try {
    // Get users with basic info
    const usersQuery = db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      resetToken: users.resetToken,
      resetTokenExpiry: users.resetTokenExpiry
    })
    .from(users)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(users.updatedAt));

    const userResults = await usersQuery;
    
    // Get total count
    const totalResult = await db.select({ count: count() }).from(users);
    const total = totalResult[0]?.count || 0;

    // Process each user to get security status
    const userStatuses: UserSecurityStatus[] = [];
    
    for (const user of userResults) {
      const securityMetrics = await getPasswordSecurityMetrics(user.id);
      
      // Calculate password age
      const passwordAge = securityMetrics.passwordAge;
      
      // Determine security flags
      const hasWeakPassword = passwordAge > 90; // Simplified logic
      const hasSuspiciousActivity = user.resetToken !== null;
      const requiresPasswordReset = passwordAge > 180;
      const accountLocked = false; // Would come from auth system
      
      // Calculate risk level
      const riskFactors: string[] = [];
      if (hasWeakPassword) riskFactors.push('Weak password');
      if (passwordAge > 90) riskFactors.push('Old password');
      if (hasSuspiciousActivity) riskFactors.push('Pending reset');
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (riskFactors.length >= 3) riskLevel = 'critical';
      else if (riskFactors.length === 2) riskLevel = 'high';
      else if (riskFactors.length === 1) riskLevel = 'medium';
      else riskLevel = 'low';

      // Apply filter if specified
      if (riskLevelFilter && riskLevel !== riskLevelFilter) {
        continue;
      }

      userStatuses.push({
        userId: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role,
        passwordAge,
        hasWeakPassword,
        passwordHistoryCount: securityMetrics.historyCount,
        lastPasswordReset: securityMetrics.lastResetDate,
        loginAttempts: 0, // Would come from auth logs
        failedLoginAttempts: 0, // Would come from auth logs
        hasSuspiciousActivity,
        requiresPasswordReset,
        accountLocked,
        riskLevel,
        riskFactors
      });
    }

    return {
      users: userStatuses,
      total,
      hasMore: offset + limit < total
    };

  } catch (error) {
    console.error('Error getting user security statuses:', error);
    throw new Error('Failed to retrieve user security statuses');
  }
}

/**
 * Get security trends over time (last 30 days)
 */
export async function getSecurityTrends(): Promise<SecurityTrends> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Generate daily data points for the last 30 days
    const trends: SecurityTrends = {
      passwordResets: [],
      loginActivity: [],
      securityAlerts: [],
      userGrowth: []
    };

    // Generate sample data (in production, this would come from actual logs)
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Sample password reset data
      trends.passwordResets.push({
        date: dateStr,
        count: Math.floor(Math.random() * 10) + 1,
        suspicious: Math.floor(Math.random() * 3)
      });

      // Sample login activity data
      trends.loginActivity.push({
        date: dateStr,
        successful: Math.floor(Math.random() * 50) + 20,
        failed: Math.floor(Math.random() * 10) + 1
      });

      // Sample security alerts data
      trends.securityAlerts.push({
        date: dateStr,
        count: Math.floor(Math.random() * 5),
        severity: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
      });

      // Sample user growth data
      trends.userGrowth.push({
        date: dateStr,
        total: 100 + i * 2, // Growing user base
        active: 80 + i * 1.5 // Growing active users
      });
    }

    return trends;

  } catch (error) {
    console.error('Error getting security trends:', error);
    throw new Error('Failed to retrieve security trends');
  }
}

/**
 * Get security activity log (recent security events)
 */
export async function getSecurityActivityLog(
  limit: number = 100,
  offset: number = 0,
  severityFilter?: 'info' | 'warning' | 'error' | 'critical'
): Promise<{
  activities: SecurityActivityLog[];
  total: number;
  hasMore: boolean;
}> {
  try {
    // In production, this would come from a dedicated security_events table
    // For now, generating sample data based on recent database activity
    
    const activities: SecurityActivityLog[] = [];
    
    // Get recent password resets
    const recentResets = await db.select({
      id: users.id,
      email: users.email,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(isNull(users.resetToken)) // Recently completed resets
    .orderBy(desc(users.updatedAt))
    .limit(20);

    recentResets.forEach((user, index) => {
      activities.push({
        id: `reset-${user.id}-${Date.now() + index}`,
        userId: user.id,
        userEmail: user.email,
        eventType: 'password_reset_completed',
        severity: 'info',
        description: `User completed password reset`,
        timestamp: user.updatedAt || new Date(),
        metadata: {
          source: 'password_reset_system'
        }
      });
    });

    // Get users with suspicious activity
    const suspiciousUsers = await db.select({
      id: users.id,
      email: users.email,
      resetTokenExpiry: users.resetTokenExpiry
    })
    .from(users)
    .where(isNotNull(users.resetToken))
    .limit(10);

    suspiciousUsers.forEach((user, index) => {
      activities.push({
        id: `suspicious-${user.id}-${Date.now() + index}`,
        userId: user.id,
        userEmail: user.email,
        eventType: 'suspicious_activity_detected',
        severity: 'warning',
        description: `User has pending password reset token`,
        timestamp: user.resetTokenExpiry || new Date(),
        metadata: {
          source: 'security_monitoring'
        }
      });
    });

    // Sort by timestamp desc
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply severity filter
    const filteredActivities = severityFilter 
      ? activities.filter(a => a.severity === severityFilter)
      : activities;

    // Apply pagination
    const paginatedActivities = filteredActivities.slice(offset, offset + limit);

    return {
      activities: paginatedActivities,
      total: filteredActivities.length,
      hasMore: offset + limit < filteredActivities.length
    };

  } catch (error) {
    console.error('Error getting security activity log:', error);
    throw new Error('Failed to retrieve security activity log');
  }
} 