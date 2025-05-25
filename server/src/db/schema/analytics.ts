import { pgTable, serial, integer, varchar, text, timestamp, jsonb, boolean, decimal, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { athleteProfiles } from './athleteProfiles';

// User interaction tracking for ML training data
export const userInteractions = pgTable('user_interactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  targetUserId: integer('target_user_id').references(() => users.id, { onDelete: 'cascade' }),
  targetProfileId: integer('target_profile_id').references(() => athleteProfiles.userId, { onDelete: 'cascade' }),
  interactionType: varchar('interaction_type', { length: 50 }).notNull(), // 'view', 'contact', 'favorite', 'search', 'click'
  interactionContext: varchar('interaction_context', { length: 100 }), // 'profile_view', 'search_result', 'recommendation'
  metadata: jsonb('metadata'), // Additional context data
  sessionId: varchar('session_id', { length: 100 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_interactions_user_id_idx').on(table.userId),
  targetUserIdIdx: index('user_interactions_target_user_id_idx').on(table.targetUserId),
  interactionTypeIdx: index('user_interactions_type_idx').on(table.interactionType),
  createdAtIdx: index('user_interactions_created_at_idx').on(table.createdAt),
}));

// Profile engagement metrics for performance analytics
export const profileEngagement = pgTable('profile_engagement', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').references(() => athleteProfiles.userId, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').notNull(),
  views: integer('views').default(0).notNull(),
  uniqueViews: integer('unique_views').default(0).notNull(),
  contacts: integer('contacts').default(0).notNull(),
  favorites: integer('favorites').default(0).notNull(),
  searchAppearances: integer('search_appearances').default(0).notNull(),
  searchClicks: integer('search_clicks').default(0).notNull(),
  engagementScore: decimal('engagement_score', { precision: 5, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  profileIdIdx: index('profile_engagement_profile_id_idx').on(table.profileId),
  dateIdx: index('profile_engagement_date_idx').on(table.date),
  engagementScoreIdx: index('profile_engagement_score_idx').on(table.engagementScore),
}));

// ML model predictions and recommendations
export const mlPredictions = pgTable('ml_predictions', {
  id: serial('id').primaryKey(),
  modelName: varchar('model_name', { length: 100 }).notNull(),
  modelVersion: varchar('model_version', { length: 20 }).notNull(),
  targetType: varchar('target_type', { length: 50 }).notNull(), // 'user', 'profile', 'interaction'
  targetId: integer('target_id').notNull(),
  predictionType: varchar('prediction_type', { length: 50 }).notNull(), // 'engagement_score', 'match_probability', 'risk_score'
  prediction: jsonb('prediction').notNull(), // Prediction results and confidence scores
  confidence: decimal('confidence', { precision: 5, scale: 4 }).notNull(),
  features: jsonb('features'), // Input features used for prediction
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  modelNameIdx: index('ml_predictions_model_name_idx').on(table.modelName),
  targetTypeIdx: index('ml_predictions_target_type_idx').on(table.targetType),
  targetIdIdx: index('ml_predictions_target_id_idx').on(table.targetId),
  predictionTypeIdx: index('ml_predictions_prediction_type_idx').on(table.predictionType),
  confidenceIdx: index('ml_predictions_confidence_idx').on(table.confidence),
  createdAtIdx: index('ml_predictions_created_at_idx').on(table.createdAt),
}));

// Analytics insights and recommendations
export const analyticsInsights = pgTable('analytics_insights', {
  id: serial('id').primaryKey(),
  insightType: varchar('insight_type', { length: 50 }).notNull(), // 'profile_optimization', 'recruiter_targeting', 'market_trend'
  targetType: varchar('target_type', { length: 50 }).notNull(), // 'user', 'profile', 'system'
  targetId: integer('target_id'),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  recommendations: jsonb('recommendations').notNull(), // Actionable recommendations
  priority: varchar('priority', { length: 20 }).default('medium').notNull(), // 'low', 'medium', 'high', 'critical'
  confidence: decimal('confidence', { precision: 5, scale: 4 }).notNull(),
  dataPoints: jsonb('data_points'), // Supporting data and metrics
  isRead: boolean('is_read').default(false).notNull(),
  isActioned: boolean('is_actioned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  insightTypeIdx: index('analytics_insights_insight_type_idx').on(table.insightType),
  targetTypeIdx: index('analytics_insights_target_type_idx').on(table.targetType),
  targetIdIdx: index('analytics_insights_target_id_idx').on(table.targetId),
  priorityIdx: index('analytics_insights_priority_idx').on(table.priority),
  createdAtIdx: index('analytics_insights_created_at_idx').on(table.createdAt),
}));

// Search analytics for recruiter behavior analysis
export const searchAnalytics = pgTable('search_analytics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  searchQuery: text('search_query'),
  filters: jsonb('filters'), // Applied search filters
  resultsCount: integer('results_count').notNull(),
  clickedResults: jsonb('clicked_results'), // Array of clicked profile IDs and positions
  sessionId: varchar('session_id', { length: 100 }),
  searchDuration: integer('search_duration'), // Time spent on search in seconds
  refinements: integer('refinements').default(0), // Number of filter changes
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('search_analytics_user_id_idx').on(table.userId),
  createdAtIdx: index('search_analytics_created_at_idx').on(table.createdAt),
  resultsCountIdx: index('search_analytics_results_count_idx').on(table.resultsCount),
}));

// Performance metrics aggregation for dashboards
export const performanceMetrics = pgTable('performance_metrics', {
  id: serial('id').primaryKey(),
  metricType: varchar('metric_type', { length: 50 }).notNull(), // 'daily_active_users', 'profile_completion_rate', 'match_success_rate'
  entityType: varchar('entity_type', { length: 50 }), // 'user', 'profile', 'system'
  entityId: integer('entity_id'),
  date: timestamp('date').notNull(),
  value: decimal('value', { precision: 15, scale: 4 }).notNull(),
  metadata: jsonb('metadata'), // Additional metric context
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  metricTypeIdx: index('performance_metrics_metric_type_idx').on(table.metricType),
  entityTypeIdx: index('performance_metrics_entity_type_idx').on(table.entityType),
  dateIdx: index('performance_metrics_date_idx').on(table.date),
  valueIdx: index('performance_metrics_value_idx').on(table.value),
})); 