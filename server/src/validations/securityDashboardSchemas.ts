import { z } from 'zod';

/**
 * Security dashboard request validation schemas
 */

// Pagination schema for dashboard endpoints
export const paginationSchema = z.object({
  limit: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 50)
    .refine(val => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
  offset: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 0)
    .refine(val => val >= 0, 'Offset must be non-negative')
});

// Risk level filter schema
export const riskLevelFilterSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional()
});

// Security activity log filter schema
export const securityActivityFilterSchema = z.object({
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  eventType: z.string().optional(),
  userId: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : undefined)
    .refine(val => val === undefined || val > 0, 'User ID must be positive')
});

// User security status query schema
export const userSecurityStatusQuerySchema = paginationSchema.merge(riskLevelFilterSchema);

// Security activity log query schema
export const securityActivityLogQuerySchema = paginationSchema.merge(securityActivityFilterSchema);

// Date range schema for trends
export const dateRangeSchema = z.object({
  startDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid start date format'),
  endDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid end date format')
}).refine(
  data => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  'Start date must be before or equal to end date'
);

// Security trends query schema
export const securityTrendsQuerySchema = z.object({
  startDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid start date format'),
  endDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Invalid end date format'),
  metric: z.enum(['password_resets', 'login_activity', 'security_alerts', 'user_growth']).optional()
}).refine(
  data => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  'Start date must be before or equal to end date'
);

// Security alert action schema
export const securityAlertActionSchema = z.object({
  acknowledged: z.boolean(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional()
});

// Bulk security action schema
export const bulkSecurityActionSchema = z.object({
  userIds: z.array(z.number().positive('User ID must be positive'))
    .min(1, 'At least one user ID is required')
    .max(50, 'Cannot perform bulk actions on more than 50 users at once'),
  action: z.enum(['force_password_reset', 'unlock_account', 'send_security_alert']),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(200, 'Reason must not exceed 200 characters')
});

// Security metrics export schema
export const exportMetricsSchema = z.object({
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includeUserData: z.boolean().default(false),
  dateRange: dateRangeSchema.optional()
});

// Admin password policy update schema
export const passwordPolicyUpdateSchema = z.object({
  minLength: z.number().int().min(6).max(50),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  maxLength: z.number().int().min(20).max(200),
  passwordHistoryLimit: z.number().int().min(1).max(20),
  resetTokenExpiryHours: z.number().int().min(1).max(72)
});

// Security system configuration schema
export const securityConfigSchema = z.object({
  maxResetAttemptsPerHour: z.number().int().min(1).max(20),
  suspiciousActivityThreshold: z.number().int().min(1).max(10),
  passwordHistoryRetentionDays: z.number().int().min(30).max(1095), // 30 days to 3 years
  securityAlertEmailEnabled: z.boolean(),
  autoLockoutEnabled: z.boolean(),
  securityMetricsRetentionDays: z.number().int().min(30).max(365)
});

// Real-time security monitoring schema
export const securityMonitoringQuerySchema = z.object({
  realTime: z.boolean().default(false),
  interval: z.number().int().min(5).max(300).default(30), // 5 seconds to 5 minutes
  metrics: z.array(z.enum([
    'active_sessions',
    'failed_logins',
    'password_resets',
    'security_alerts',
    'suspicious_activity'
  ])).optional()
});

// User security risk assessment schema
export const userRiskAssessmentSchema = z.object({
  userId: z.number().positive('User ID must be positive'),
  includeRecommendations: z.boolean().default(true),
  detailedAnalysis: z.boolean().default(false)
});

// Security dashboard permissions validation
export const dashboardPermissionsSchema = z.object({
  canViewUserData: z.boolean(),
  canExportData: z.boolean(),
  canModifySecuritySettings: z.boolean(),
  canPerformBulkActions: z.boolean(),
  accessLevel: z.enum(['read_only', 'operator', 'admin', 'super_admin'])
});

/**
 * Parameter schemas for route validation
 */

// User ID parameter schema
export const userIdParamSchema = z.object({
  userId: z.string()
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val) && val > 0, 'Invalid user ID')
});

// Alert ID parameter schema
export const alertIdParamSchema = z.object({
  alertId: z.string()
    .min(1, 'Alert ID is required')
    .max(100, 'Alert ID too long')
});

// Metric type parameter schema
export const metricTypeParamSchema = z.object({
  metricType: z.enum([
    'overview',
    'password_security', 
    'user_activity',
    'security_alerts',
    'system_health',
    'trends'
  ])
});

/**
 * Response validation schemas (for documentation/testing)
 */

// Security dashboard metrics response schema
export const securityDashboardMetricsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    totalUsers: z.number(),
    activeUsers: z.number(),
    usersWithWeakPasswords: z.number(),
    usersRequiringPasswordReset: z.number(),
    passwordResetStats: z.object({
      totalResetsToday: z.number(),
      totalResetsThisWeek: z.number(),
      totalResetsThisMonth: z.number(),
      suspiciousActivityCount: z.number()
    }),
    authenticationMetrics: z.object({
      totalLoginAttempts: z.number(),
      successfulLogins: z.number(),
      failedLogins: z.number(),
      uniqueActiveUsers: z.number()
    }),
    securityAlerts: z.array(z.object({
      id: z.string(),
      type: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      title: z.string(),
      description: z.string(),
      timestamp: z.string(),
      acknowledged: z.boolean()
    })),
    systemSecurityHealth: z.object({
      overallScore: z.number().min(0).max(100),
      weakPasswordPercentage: z.number(),
      oldPasswordPercentage: z.number(),
      suspiciousActivityLevel: z.enum(['low', 'medium', 'high'])
    })
  }),
  message: z.string()
});

/**
 * Common validation utilities
 */

// Validate admin permissions for sensitive operations
export const validateAdminPermissions = (userRole: string, requiredLevel: string = 'admin'): boolean => {
  const roleHierarchy = {
    'athlete': 0,
    'parent': 1,
    'recruiter': 2,
    'admin': 3,
    'super_admin': 4
  };
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel = roleHierarchy[requiredLevel as keyof typeof roleHierarchy] || 3;
  
  return userLevel >= requiredRoleLevel;
};

// Validate security-sensitive time windows
export const validateTimeWindow = (startDate?: string, endDate?: string, maxDays: number = 90): boolean => {
  if (!startDate || !endDate) return true;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= maxDays;
}; 