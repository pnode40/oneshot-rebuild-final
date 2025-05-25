import { z } from 'zod';

// User interaction tracking schema
export const trackInteractionSchema = z.object({
  targetUserId: z.number().optional(),
  targetProfileId: z.number().optional(),
  interactionType: z.enum(['view', 'contact', 'favorite', 'search', 'click']),
  interactionContext: z.string().max(100).optional(),
  metadata: z.record(z.any()).optional(),
  sessionId: z.string().max(100).optional(),
});

// Analytics dashboard query schema
export const dashboardQuerySchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  includeInsights: z.boolean().default(true),
  includePredictions: z.boolean().default(true),
  includeEngagement: z.boolean().default(true),
});

// Profile predictions query schema
export const profilePredictionsSchema = z.object({
  profileId: z.number(),
  predictionTypes: z.array(z.enum(['engagement_score', 'profile_optimization', 'match_probability', 'risk_score'])).optional(),
  includeFeatures: z.boolean().default(false),
});

// Insights query schema
export const insightsQuerySchema = z.object({
  targetType: z.enum(['user', 'profile', 'system']).default('user'),
  insightTypes: z.array(z.enum(['profile_optimization', 'recruiter_targeting', 'market_trend', 'performance_improvement'])).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  unreadOnly: z.boolean().default(false),
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0),
});

// Mark insight as read schema
export const markInsightReadSchema = z.object({
  insightId: z.number(),
  isActioned: z.boolean().default(false),
});

// Search analytics tracking schema
export const trackSearchSchema = z.object({
  searchQuery: z.string().max(500).optional(),
  filters: z.record(z.any()).optional(),
  resultsCount: z.number().min(0),
  clickedResults: z.array(z.object({
    profileId: z.number(),
    position: z.number(),
    timestamp: z.string().datetime(),
  })).optional(),
  sessionId: z.string().max(100).optional(),
  searchDuration: z.number().min(0).optional(),
  refinements: z.number().min(0).default(0),
});

// Performance metrics query schema
export const performanceMetricsSchema = z.object({
  metricTypes: z.array(z.string()).optional(),
  entityType: z.enum(['user', 'profile', 'system']).optional(),
  entityId: z.number().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  aggregation: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
});

// Engagement metrics query schema
export const engagementMetricsSchema = z.object({
  profileId: z.number(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeHistory: z.boolean().default(true),
});

// ML model training data schema
export const trainingDataSchema = z.object({
  modelName: z.string().max(100),
  features: z.array(z.string()),
  targetVariable: z.string(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sampleSize: z.number().min(1).max(10000).default(1000),
});

// Analytics export schema
export const analyticsExportSchema = z.object({
  dataTypes: z.array(z.enum(['interactions', 'engagement', 'predictions', 'insights', 'search_analytics'])),
  format: z.enum(['json', 'csv', 'excel']).default('json'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includePersonalData: z.boolean().default(false),
});

// Admin analytics query schema
export const adminAnalyticsSchema = z.object({
  metricType: z.enum(['overview', 'users', 'engagement', 'predictions', 'insights']).default('overview'),
  timeRange: z.enum(['24h', '7d', '30d', '90d', '1y']).default('30d'),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
  includeComparisons: z.boolean().default(true),
});

// Recommendation generation schema
export const generateRecommendationsSchema = z.object({
  targetType: z.enum(['profile', 'user', 'system']),
  targetId: z.number().optional(),
  recommendationTypes: z.array(z.enum(['profile_optimization', 'content_suggestions', 'engagement_strategies', 'performance_improvements'])).optional(),
  maxRecommendations: z.number().min(1).max(20).default(5),
});

// Batch analytics processing schema
export const batchProcessingSchema = z.object({
  operations: z.array(z.object({
    type: z.enum(['generate_predictions', 'calculate_engagement', 'update_insights', 'cleanup_expired']),
    targetIds: z.array(z.number()).optional(),
    parameters: z.record(z.any()).optional(),
  })),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  scheduledFor: z.string().datetime().optional(),
});

// Response schemas for type safety
export const analyticsResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  metadata: z.object({
    totalCount: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
    processingTime: z.number().optional(),
  }).optional(),
  insights: z.array(z.object({
    type: z.string(),
    message: z.string(),
    confidence: z.number(),
  })).optional(),
});

export const predictionResponseSchema = z.object({
  predictions: z.array(z.object({
    modelName: z.string(),
    modelVersion: z.string(),
    predictionType: z.string(),
    prediction: z.any(),
    confidence: z.number(),
    features: z.any().optional(),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime().optional(),
  })),
  metadata: z.object({
    totalPredictions: z.number(),
    averageConfidence: z.number(),
    modelVersions: z.array(z.string()),
  }),
});

export const insightResponseSchema = z.object({
  insights: z.array(z.object({
    id: z.number(),
    insightType: z.string(),
    targetType: z.string(),
    targetId: z.number().optional(),
    title: z.string(),
    description: z.string(),
    recommendations: z.array(z.any()),
    priority: z.string(),
    confidence: z.number(),
    dataPoints: z.any().optional(),
    isRead: z.boolean(),
    isActioned: z.boolean(),
    createdAt: z.string().datetime(),
    expiresAt: z.string().datetime().optional(),
  })),
  metadata: z.object({
    totalInsights: z.number(),
    unreadCount: z.number(),
    priorityBreakdown: z.record(z.number()),
  }),
});

export const engagementResponseSchema = z.object({
  overview: z.object({
    totalViews: z.number(),
    totalContacts: z.number(),
    totalFavorites: z.number(),
    engagementScore: z.number(),
    trend: z.enum(['increasing', 'stable', 'decreasing']),
  }),
  history: z.array(z.object({
    date: z.string().datetime(),
    views: z.number(),
    contacts: z.number(),
    favorites: z.number(),
    engagementScore: z.number(),
  })),
  insights: z.array(z.object({
    metric: z.string(),
    value: z.number(),
    change: z.number(),
    interpretation: z.string(),
  })),
}); 