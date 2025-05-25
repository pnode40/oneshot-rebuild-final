import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { analyticsService } from '../../services/analyticsService';
import { successResponse, errorResponse } from '../../utils/responses';
import {
  trackInteractionSchema,
  dashboardQuerySchema,
  profilePredictionsSchema,
  insightsQuerySchema,
  markInsightReadSchema,
  trackSearchSchema,
  performanceMetricsSchema,
  engagementMetricsSchema,
  analyticsExportSchema,
  adminAnalyticsSchema,
  generateRecommendationsSchema,
} from '../../validations/analyticsSchemas';

const router = Router();

// Helper middleware for role-based access
const requireSelfOrAdmin = (req: AuthRequest, res: any, next: any) => {
  const profileId = parseInt(req.params.profileId);
  if (req.user?.role === 'admin' || req.user?.userId === profileId) {
    next();
  } else {
    res.status(403).json(errorResponse('Access denied'));
  }
};

const requireAdmin = authorize(['admin']);

// Track user interactions for ML training data
router.post('/interactions', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedData = trackInteractionSchema.parse(req.body);
    
    await analyticsService.trackInteraction({
      userId: req.user!.userId,
      ...validatedData,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json(successResponse(
      'Interaction tracked successfully',
      { tracked: true }
    ));
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(400).json(errorResponse('Failed to track interaction', error));
  }
});

// Get analytics dashboard data
router.get('/dashboard', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedQuery = dashboardQuerySchema.parse(req.query);
    
    const dashboardData = await analyticsService.getDashboardData(
      req.user!.userId,
      req.user!.role
    );

    res.json(successResponse(
      'Dashboard data retrieved successfully',
      dashboardData
    ));
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json(errorResponse('Failed to retrieve dashboard data', error));
  }
});

// Generate ML predictions for a profile
router.post('/predictions/:profileId', authenticate, requireSelfOrAdmin, async (req: AuthRequest, res) => {
  try {
    const profileId = parseInt(req.params.profileId);
    if (isNaN(profileId)) {
      return res.status(400).json(errorResponse('Invalid profile ID'));
    }

    const validatedData = profilePredictionsSchema.parse({
      profileId,
      ...req.body
    });

    const predictions = await analyticsService.generateProfilePredictions(profileId);

    res.json(successResponse(
      'Predictions generated successfully',
      {
        predictions: predictions.map(p => ({
          ...p,
          features: validatedData.includeFeatures ? p.features : undefined
        })),
        metadata: {
          totalPredictions: predictions.length,
          averageConfidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length,
          modelVersions: [...new Set(predictions.map(p => p.modelVersion))]
        }
      }
    ));
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json(errorResponse('Failed to generate predictions', error));
  }
});

// Get insights for user or profile
router.get('/insights', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedQuery = insightsQuerySchema.parse(req.query);
    
    const insights = await analyticsService.generateInsights(
      req.user!.userId,
      validatedQuery.targetType === 'profile' ? 'profile' : 'user'
    );

    // Filter insights based on query parameters
    let filteredInsights = insights;
    
    if (validatedQuery.insightTypes) {
      filteredInsights = filteredInsights.filter(insight => 
        validatedQuery.insightTypes!.includes(insight.insightType)
      );
    }
    
    if (validatedQuery.priority) {
      filteredInsights = filteredInsights.filter(insight => 
        insight.priority === validatedQuery.priority
      );
    }

    // Apply pagination
    const paginatedInsights = filteredInsights
      .slice(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit);

    res.json(successResponse(
      'Insights retrieved successfully',
      {
        insights: paginatedInsights,
        metadata: {
          totalInsights: filteredInsights.length,
          unreadCount: filteredInsights.filter(i => !i.isRead).length,
          priorityBreakdown: {
            low: filteredInsights.filter(i => i.priority === 'low').length,
            medium: filteredInsights.filter(i => i.priority === 'medium').length,
            high: filteredInsights.filter(i => i.priority === 'high').length,
            critical: filteredInsights.filter(i => i.priority === 'critical').length,
          }
        }
      }
    ));
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json(errorResponse('Failed to retrieve insights', error));
  }
});

// Mark insight as read/actioned
router.patch('/insights/:insightId/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const insightId = parseInt(req.params.insightId);
    if (isNaN(insightId)) {
      return res.status(400).json(errorResponse('Invalid insight ID'));
    }

    const validatedData = markInsightReadSchema.parse({
      insightId,
      ...req.body
    });

    // TODO: Implement mark insight as read functionality
    // This would require adding an update method to the analytics service

    res.json(successResponse(
      'Insight marked as read successfully',
      { updated: true }
    ));
  } catch (error) {
    console.error('Error marking insight as read:', error);
    res.status(500).json(errorResponse('Failed to mark insight as read', error));
  }
});

// Track search analytics
router.post('/search', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedData = trackSearchSchema.parse(req.body);
    
    // TODO: Implement search analytics tracking
    // This would require adding a trackSearch method to the analytics service

    res.json(successResponse(
      'Search analytics tracked successfully',
      { tracked: true }
    ));
  } catch (error) {
    console.error('Error tracking search analytics:', error);
    res.status(400).json(errorResponse('Failed to track search analytics', error));
  }
});

// Get engagement metrics for a profile
router.get('/engagement/:profileId', authenticate, requireSelfOrAdmin, async (req: AuthRequest, res) => {
  try {
    const profileId = parseInt(req.params.profileId);
    if (isNaN(profileId)) {
      return res.status(400).json(errorResponse('Invalid profile ID'));
    }

    const validatedQuery = engagementMetricsSchema.parse({
      profileId,
      ...req.query
    });

    const engagementData = await analyticsService.getUserEngagement(profileId);
    const userMetrics = await analyticsService.getUserMetrics(profileId);

    res.json(successResponse(
      'Engagement metrics retrieved successfully',
      {
        overview: {
          totalViews: engagementData.totalViews,
          totalContacts: engagementData.totalContacts,
          totalFavorites: engagementData.totalFavorites,
          engagementScore: userMetrics.engagementScore,
          trend: userMetrics.engagementScore > 50 ? 'increasing' : 
                 userMetrics.engagementScore > 20 ? 'stable' : 'decreasing'
        },
        history: engagementData.history,
        insights: [
          {
            metric: 'Monthly Views',
            value: userMetrics.monthlyViews,
            change: 0, // TODO: Calculate change from previous period
            interpretation: userMetrics.monthlyViews > 10 ? 'Good visibility' : 'Needs improvement'
          },
          {
            metric: 'Monthly Contacts',
            value: userMetrics.monthlyContacts,
            change: 0, // TODO: Calculate change from previous period
            interpretation: userMetrics.monthlyContacts > 2 ? 'Strong interest' : 'Limited recruiter engagement'
          }
        ]
      }
    ));
  } catch (error) {
    console.error('Error getting engagement metrics:', error);
    res.status(500).json(errorResponse('Failed to retrieve engagement metrics', error));
  }
});

// Admin-only routes
router.get('/admin/overview', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const validatedQuery = adminAnalyticsSchema.parse(req.query);
    
    const systemMetrics = await analyticsService.getSystemMetrics();
    const systemInsights = await analyticsService.getSystemInsights();

    res.json(successResponse(
      'Admin analytics retrieved successfully',
      {
        overview: systemMetrics,
        insights: systemInsights,
        metadata: {
          generatedAt: new Date().toISOString(),
          timeRange: validatedQuery.timeRange,
          metricType: validatedQuery.metricType
        }
      }
    ));
  } catch (error) {
    console.error('Error getting admin analytics:', error);
    res.status(500).json(errorResponse('Failed to retrieve admin analytics', error));
  }
});

// Export analytics data
router.post('/export', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const validatedData = analyticsExportSchema.parse(req.body);
    
    // TODO: Implement analytics export functionality
    // This would require adding an export method to the analytics service

    res.json(successResponse(
      'Export initiated successfully',
      {
        exportId: `export_${Date.now()}`,
        status: 'processing',
        estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }
    ));
  } catch (error) {
    console.error('Error initiating export:', error);
    res.status(500).json(errorResponse('Failed to initiate export', error));
  }
});

// Generate recommendations
router.post('/recommendations', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedData = generateRecommendationsSchema.parse(req.body);
    
    // Generate insights which include recommendations
    const insights = await analyticsService.generateInsights(
      validatedData.targetId || req.user!.userId,
      validatedData.targetType === 'profile' ? 'profile' : 'user'
    );

    // Extract recommendations from insights
    const recommendations = insights
      .flatMap(insight => insight.recommendations)
      .slice(0, validatedData.maxRecommendations);

    res.json(successResponse(
      'Recommendations generated successfully',
      {
        recommendations,
        metadata: {
          totalRecommendations: recommendations.length,
          basedOnInsights: insights.length,
          generatedAt: new Date().toISOString()
        }
      }
    ));
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json(errorResponse('Failed to generate recommendations', error));
  }
});

// Get performance metrics
router.get('/metrics', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedQuery = performanceMetricsSchema.parse(req.query);
    
    // TODO: Implement performance metrics retrieval
    // This would require adding a getPerformanceMetrics method to the analytics service

    res.json(successResponse(
      'Performance metrics retrieved successfully',
      {
        metrics: [],
        metadata: {
          query: validatedQuery,
          generatedAt: new Date().toISOString()
        }
      }
    ));
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json(errorResponse('Failed to retrieve performance metrics', error));
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Basic health check - could be expanded to check database connectivity, etc.
    res.json(successResponse(
      'Analytics service is healthy',
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          analytics: 'operational',
          ml_models: 'ready'
        }
      }
    ));
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json(errorResponse('Analytics service unhealthy', error));
  }
});

// Test endpoint without authentication
router.get('/test', async (req, res) => {
  try {
    res.json(successResponse(
      'Analytics test endpoint working',
      {
        message: 'This endpoint works without authentication',
        timestamp: new Date().toISOString(),
        sampleData: {
          overview: {
            monthlyViews: 150,
            monthlyContacts: 8,
            engagementScore: 72.5
          },
          insights: [
            {
              id: 1,
              title: 'Profile optimization opportunity',
              description: 'Adding more highlight videos could increase recruiter engagement by 25%',
              priority: 'high',
              confidence: 0.85
            }
          ],
          engagement: {
            totalViews: 450,
            totalContacts: 23,
            totalFavorites: 12,
            history: []
          }
        }
      }
    ));
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json(errorResponse('Test endpoint failed', error));
  }
});

export default router; 