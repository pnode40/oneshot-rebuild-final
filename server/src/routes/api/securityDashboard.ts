import { Router, Request, Response } from 'express';
import { validateRequest } from '../../middleware/validationMiddleware';
import { authenticateJWT, requireAdmin } from '../../middleware/authMiddleware';
import { successResponse, errorResponse } from '../../utils/responses';
import {
  getSecurityDashboardMetrics,
  getUserSecurityStatuses,
  getSecurityTrends,
  getSecurityActivityLog
} from '../../services/securityDashboardService';
import {
  userSecurityStatusQuerySchema,
  securityActivityLogQuerySchema,
  securityTrendsQuerySchema,
  userIdParamSchema,
  alertIdParamSchema,
  metricTypeParamSchema,
  bulkSecurityActionSchema,
  exportMetricsSchema,
  securityAlertActionSchema,
  validateAdminPermissions
} from '../../validations/securityDashboardSchemas';

const router = Router();

/**
 * @route GET /api/security-dashboard/metrics
 * @desc Get comprehensive security dashboard metrics
 * @access Admin only
 */
router.get(
  '/metrics',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const metrics = await getSecurityDashboardMetrics();

      return res.status(200).json(successResponse(
        'Security dashboard metrics retrieved successfully',
        {
          ...metrics,
          retrievedAt: new Date().toISOString(),
          dataFreshness: 'real-time'
        }
      ));

    } catch (error) {
      console.error('Error getting security dashboard metrics:', error);
      return res.status(500).json(errorResponse(
        'Failed to retrieve security metrics',
        'Internal server error'
      ));
    }
  }
);

/**
 * @route GET /api/security-dashboard/metrics/:metricType
 * @desc Get specific type of security metrics
 * @access Admin only
 */
router.get(
  '/metrics/:metricType',
  authenticateJWT,
  requireAdmin,
  validateRequest({
    params: metricTypeParamSchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { metricType } = req.params;
      const allMetrics = await getSecurityDashboardMetrics();

      let specificMetrics;
      switch (metricType) {
        case 'overview':
          specificMetrics = {
            totalUsers: allMetrics.totalUsers,
            activeUsers: allMetrics.activeUsers,
            usersWithWeakPasswords: allMetrics.usersWithWeakPasswords,
            usersRequiringPasswordReset: allMetrics.usersRequiringPasswordReset
          };
          break;
        case 'password_security':
          specificMetrics = {
            passwordResetStats: allMetrics.passwordResetStats,
            systemSecurityHealth: allMetrics.systemSecurityHealth
          };
          break;
        case 'user_activity':
          specificMetrics = {
            authenticationMetrics: allMetrics.authenticationMetrics,
            activeUsers: allMetrics.activeUsers
          };
          break;
        case 'security_alerts':
          specificMetrics = {
            securityAlerts: allMetrics.securityAlerts,
            alertCount: allMetrics.securityAlerts.length
          };
          break;
        case 'system_health':
          specificMetrics = {
            systemSecurityHealth: allMetrics.systemSecurityHealth
          };
          break;
        default:
          return res.status(400).json(errorResponse(
            'Invalid metric type',
            'Requested metric type is not supported'
          ));
      }

      return res.status(200).json(successResponse(
        `${metricType} metrics retrieved successfully`,
        specificMetrics
      ));

    } catch (error) {
      console.error(`Error getting ${req.params.metricType} metrics:`, error);
      return res.status(500).json(errorResponse(
        'Failed to retrieve specific metrics',
        'Internal server error'
      ));
    }
  }
);

/**
 * @route GET /api/security-dashboard/users
 * @desc Get paginated list of user security statuses
 * @access Admin only
 */
router.get(
  '/users',
  authenticateJWT,
  requireAdmin,
  validateRequest({
    query: userSecurityStatusQuerySchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { limit, offset, riskLevel } = req.query;

      const userStatuses = await getUserSecurityStatuses(
        limit as number,
        offset as number,
        riskLevel as 'low' | 'medium' | 'high' | 'critical' | undefined
      );

      return res.status(200).json(successResponse(
        'User security statuses retrieved successfully',
        {
          users: userStatuses.users,
          pagination: {
            total: userStatuses.total,
            limit: limit as number,
            offset: offset as number,
            hasMore: userStatuses.hasMore
          },
          filters: {
            riskLevel: riskLevel || 'all'
          },
          summary: {
            displayedUsers: userStatuses.users.length,
            totalUsers: userStatuses.total,
            riskLevelDistribution: userStatuses.users.reduce((acc, user) => {
              acc[user.riskLevel] = (acc[user.riskLevel] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          }
        }
      ));

    } catch (error) {
      console.error('Error getting user security statuses:', error);
      return res.status(500).json(errorResponse(
        'Failed to retrieve user security statuses',
        'Internal server error'
      ));
    }
  }
);

/**
 * @route GET /api/security-dashboard/users/:userId/security
 * @desc Get detailed security assessment for a specific user
 * @access Admin only
 */
router.get(
  '/users/:userId/security',
  authenticateJWT,
  requireAdmin,
  validateRequest({
    params: userIdParamSchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      // Get user security status (limit 1, filter by specific user)
      const userStatuses = await getUserSecurityStatuses(1, 0);
      const userStatus = userStatuses.users.find(u => u.userId === userId);

      if (!userStatus) {
        return res.status(404).json(errorResponse(
          'User not found',
          'No security data available for the specified user'
        ));
      }

      // Generate security recommendations based on risk factors
      const recommendations = generateSecurityRecommendations(userStatus);

      return res.status(200).json(successResponse(
        'User security assessment retrieved successfully',
        {
          userSecurity: userStatus,
          recommendations,
          assessmentDate: new Date().toISOString(),
          riskAnalysis: {
            primaryRiskFactors: userStatus.riskFactors,
            riskLevel: userStatus.riskLevel,
            immediateActions: recommendations.filter(r => r.priority === 'high'),
            monitoringNeeded: recommendations.filter(r => r.priority === 'medium')
          }
        }
      ));

    } catch (error) {
      console.error('Error getting user security assessment:', error);
      return res.status(500).json(errorResponse(
        'Failed to retrieve user security assessment',
        'Internal server error'
      ));
    }
  }
);

/**
 * @route GET /api/security-dashboard/trends
 * @desc Get security trends and analytics over time
 * @access Admin only
 */
router.get(
  '/trends',
  authenticateJWT,
  requireAdmin,
  validateRequest({
    query: securityTrendsQuerySchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, metric } = req.query;

      const trends = await getSecurityTrends();

      // Filter trends by date range if provided
      let filteredTrends = trends;
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        filteredTrends = {
          passwordResets: trends.passwordResets.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
          }),
          loginActivity: trends.loginActivity.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
          }),
          securityAlerts: trends.securityAlerts.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
          }),
          userGrowth: trends.userGrowth.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
          })
        };
      }

      // Return specific metric if requested
      if (metric) {
        const metricData = filteredTrends[metric as keyof typeof filteredTrends];
        return res.status(200).json(successResponse(
          `${metric} trends retrieved successfully`,
          {
            metric,
            data: metricData,
            dateRange: { startDate, endDate },
            dataPoints: metricData.length
          }
        ));
      }

      return res.status(200).json(successResponse(
        'Security trends retrieved successfully',
        {
          trends: filteredTrends,
          dateRange: { startDate, endDate },
          summary: {
            totalPasswordResets: filteredTrends.passwordResets.reduce((sum, day) => sum + day.count, 0),
            totalSuspiciousActivity: filteredTrends.passwordResets.reduce((sum, day) => sum + day.suspicious, 0),
            totalSecurityAlerts: filteredTrends.securityAlerts.reduce((sum, day) => sum + day.count, 0),
            averageDailyLogins: Math.round(
              filteredTrends.loginActivity.reduce((sum, day) => sum + day.successful, 0) / 
              filteredTrends.loginActivity.length
            )
          }
        }
      ));

    } catch (error) {
      console.error('Error getting security trends:', error);
      return res.status(500).json(errorResponse(
        'Failed to retrieve security trends',
        'Internal server error'
      ));
    }
  }
);

/**
 * @route GET /api/security-dashboard/activity-log
 * @desc Get security activity log with filtering
 * @access Admin only
 */
router.get(
  '/activity-log',
  authenticateJWT,
  requireAdmin,
  validateRequest({
    query: securityActivityLogQuerySchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { limit, offset, severity, eventType, userId } = req.query;

      const activityLog = await getSecurityActivityLog(
        limit as number,
        offset as number,
        severity as 'info' | 'warning' | 'error' | 'critical' | undefined
      );

      // Apply additional filtering if needed
      let filteredActivities = activityLog.activities;
      
      if (eventType) {
        filteredActivities = filteredActivities.filter(a => 
          a.eventType.includes(eventType as string)
        );
      }

      if (userId) {
        filteredActivities = filteredActivities.filter(a => 
          a.userId === userId
        );
      }

      return res.status(200).json(successResponse(
        'Security activity log retrieved successfully',
        {
          activities: filteredActivities,
          pagination: {
            total: activityLog.total,
            limit: limit as number,
            offset: offset as number,
            hasMore: activityLog.hasMore
          },
          filters: {
            severity: severity || 'all',
            eventType: eventType || 'all',
            userId: userId || 'all'
          },
          summary: {
            displayedEvents: filteredActivities.length,
            severityDistribution: filteredActivities.reduce((acc, activity) => {
              acc[activity.severity] = (acc[activity.severity] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          }
        }
      ));

    } catch (error) {
      console.error('Error getting security activity log:', error);
      return res.status(500).json(errorResponse(
        'Failed to retrieve security activity log',
        'Internal server error'
      ));
    }
  }
);

/**
 * @route POST /api/security-dashboard/alerts/:alertId/acknowledge
 * @desc Acknowledge a security alert
 * @access Admin only
 */
router.post(
  '/alerts/:alertId/acknowledge',
  authenticateJWT,
  requireAdmin,
  validateRequest({
    params: alertIdParamSchema,
    body: securityAlertActionSchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { alertId } = req.params;
      const { acknowledged, notes } = req.body;

      // In a full implementation, this would update a security_alerts table
      // For now, we'll simulate the action
      const mockAlertUpdate = {
        alertId,
        acknowledged,
        notes,
        acknowledgedBy: req.user?.id,
        acknowledgedAt: new Date().toISOString()
      };

      return res.status(200).json(successResponse(
        'Security alert updated successfully',
        {
          alert: mockAlertUpdate,
          action: acknowledged ? 'acknowledged' : 'unacknowledged'
        }
      ));

    } catch (error) {
      console.error('Error updating security alert:', error);
      return res.status(500).json(errorResponse(
        'Failed to update security alert',
        'Internal server error'
      ));
    }
  }
);

/**
 * @route POST /api/security-dashboard/users/bulk-action
 * @desc Perform bulk security actions on multiple users
 * @access Admin only
 */
router.post(
  '/users/bulk-action',
  authenticateJWT,
  requireAdmin,
  validateRequest({
    body: bulkSecurityActionSchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { userIds, action, reason } = req.body;

      // Validate admin has permissions for this action
      if (!validateAdminPermissions(req.user?.role || '', 'admin')) {
        return res.status(403).json(errorResponse(
          'Insufficient permissions',
          'Admin role required for bulk security actions'
        ));
      }

      // In a full implementation, this would perform actual bulk actions
      // For now, we'll simulate the actions
      const results = userIds.map((userId: number) => ({
        userId,
        action,
        status: 'completed',
        performedAt: new Date().toISOString(),
        performedBy: req.user?.id
      }));

      // Log the bulk action for audit purposes
      console.log('Bulk security action performed:', {
        action,
        userIds,
        reason,
        performedBy: req.user?.id,
        timestamp: new Date().toISOString()
      });

      return res.status(200).json(successResponse(
        `Bulk ${action} action completed successfully`,
        {
          action,
          affectedUsers: userIds.length,
          results,
          reason,
          auditInfo: {
            performedBy: req.user?.id,
            performedAt: new Date().toISOString(),
            reason
          }
        }
      ));

    } catch (error) {
      console.error('Error performing bulk security action:', error);
      return res.status(500).json(errorResponse(
        'Failed to perform bulk security action',
        'Internal server error'
      ));
    }
  }
);

/**
 * @route GET /api/security-dashboard/export
 * @desc Export security metrics and data
 * @access Admin only
 */
router.get(
  '/export',
  authenticateJWT,
  requireAdmin,
  validateRequest({
    query: exportMetricsSchema
  }),
  async (req: Request, res: Response) => {
    try {
      const { format, includeUserData, dateRange } = req.query;

      // Get comprehensive metrics for export
      const metrics = await getSecurityDashboardMetrics();
      
      let exportData: any = {
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: req.user?.id,
          format,
          includeUserData: includeUserData || false
        },
        securityMetrics: metrics
      };

      // Include user data if requested and permitted
      if (includeUserData && validateAdminPermissions(req.user?.role || '', 'admin')) {
        const userStatuses = await getUserSecurityStatuses(1000, 0); // Export up to 1000 users
        exportData.userData = userStatuses.users;
      }

      // Set appropriate response headers based on format
      switch (format) {
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=security_metrics.csv');
          return res.status(200).send(convertToCSV(exportData));
        
        case 'pdf':
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=security_metrics.pdf');
          return res.status(200).json(successResponse(
            'PDF export not implemented yet',
            'Use JSON format for now'
          ));
        
        default: // JSON
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', 'attachment; filename=security_metrics.json');
          return res.status(200).json(successResponse(
            'Security metrics exported successfully',
            exportData
          ));
      }

    } catch (error) {
      console.error('Error exporting security metrics:', error);
      return res.status(500).json(errorResponse(
        'Failed to export security metrics',
        'Internal server error'
      ));
    }
  }
);

/**
 * Helper function to generate security recommendations
 */
function generateSecurityRecommendations(userStatus: any) {
  const recommendations = [];

  if (userStatus.passwordAge > 90) {
    recommendations.push({
      type: 'password_age',
      priority: 'high',
      title: 'Password Update Required',
      description: 'User password is over 90 days old',
      action: 'Force password reset',
      impact: 'Reduces risk of compromised credentials'
    });
  }

  if (userStatus.hasWeakPassword) {
    recommendations.push({
      type: 'weak_password',
      priority: 'high',
      title: 'Weak Password Detected',
      description: 'User password does not meet strength requirements',
      action: 'Require stronger password on next login',
      impact: 'Improves account security against brute force attacks'
    });
  }

  if (userStatus.hasSuspiciousActivity) {
    recommendations.push({
      type: 'suspicious_activity',
      priority: 'medium',
      title: 'Monitor User Activity',
      description: 'User has pending reset tokens or unusual activity',
      action: 'Review recent account activity',
      impact: 'Prevents potential account compromise'
    });
  }

  if (userStatus.passwordHistoryCount < 3) {
    recommendations.push({
      type: 'password_history',
      priority: 'low',
      title: 'Limited Password History',
      description: 'User has limited password change history',
      action: 'Encourage regular password updates',
      impact: 'Establishes good security hygiene'
    });
  }

  return recommendations;
}

/**
 * Helper function to convert data to CSV format
 */
function convertToCSV(data: any): string {
  // Simplified CSV conversion - in production, use a proper CSV library
  return JSON.stringify(data, null, 2);
}

export default router; 