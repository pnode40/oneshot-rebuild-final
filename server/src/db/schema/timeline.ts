import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// Timeline and task status enums
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'complete', 'skipped', 'blocked']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'critical']);
export const timelinePhaseEnum = pgEnum('timeline_phase', ['onboarding', 'building', 'active', 'maintaining', 'archived']);
export const notificationTypeEnum = pgEnum('notification_type', ['nudge', 'reminder', 'critical', 'achievement', 'seasonal']);
export const sportEnum = pgEnum('sport', ['football', 'basketball', 'baseball', 'soccer', 'track', 'swimming']); // Extensible for future sports

// Task Definitions - The "DNA" of what tasks exist and how they work
export const taskDefinitions = pgTable('task_definitions', {
  id: serial('id').primaryKey(),
  taskKey: varchar('task_key', { length: 100 }).notNull().unique(), // e.g., 'add_gpa', 'upload_transcript'
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  whyItMatters: text('why_it_matters').notNull(), // Recruiter-facing reasoning
  howToComplete: text('how_to_complete').notNull(),
  estimatedTimeMinutes: integer('estimated_time_minutes').default(10),
  priority: taskPriorityEnum('priority').default('medium').notNull(),
  
  // Dependency and trigger logic (JSON for flexibility)
  dependencies: jsonb('dependencies').default('[]'), // Array of task_keys this depends on
  triggers: jsonb('triggers').default('{}'), // Complex trigger conditions
  blocksSharing: boolean('blocks_sharing').default(false), // Prevents profile sharing if incomplete
  
  // Sport and role specificity
  applicableSports: jsonb('applicable_sports').default('["football"]'), // Array of sports
  applicableRoles: jsonb('applicable_roles').default('["high_school", "transfer_portal"]'), // Array of roles
  
  // Seasonal and temporal logic
  seasonalRelevance: jsonb('seasonal_relevance'), // When this task is most relevant
  urgencyWindows: jsonb('urgency_windows'), // Critical timing windows
  
  // Versioning and updates
  version: integer('version').default(1).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  
  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    taskKeyIdx: index('task_key_idx').on(table.taskKey),
    activeTasksIdx: index('active_tasks_idx').on(table.isActive),
  };
});

// User Timeline Instances - Personalized timeline for each user
export const userTimelines = pgTable('user_timelines', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Current state
  currentPhase: timelinePhaseEnum('current_phase').default('onboarding').notNull(),
  sport: sportEnum('sport').default('football').notNull(),
  completionPercentage: integer('completion_percentage').default(0).notNull(),
  
  // Timeline metadata from profile
  graduationYear: integer('graduation_year'),
  role: varchar('role', { length: 50 }), // high_school, transfer_portal
  position: varchar('position', { length: 100 }),
  
  // Engagement tracking
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }),
  lastNotificationSentAt: timestamp('last_notification_sent_at', { withTimezone: true }),
  engagementScore: integer('engagement_score').default(100), // 0-100, affects notification frequency
  
  // Timeline generation metadata
  generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow().notNull(),
  generationVersion: integer('generation_version').default(1).notNull(),
  
  // Flags
  isActive: boolean('is_active').default(true).notNull(),
  hasBlockingTasks: boolean('has_blocking_tasks').default(false).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('user_timeline_user_id_idx').on(table.userId),
    activeTimelinesIdx: index('active_timelines_idx').on(table.isActive),
    phaseIdx: index('timeline_phase_idx').on(table.currentPhase),
  };
});

// Task Instances - Specific tasks assigned to users
export const taskInstances = pgTable('task_instances', {
  id: serial('id').primaryKey(),
  timelineId: integer('timeline_id').references(() => userTimelines.id, { onDelete: 'cascade' }).notNull(),
  taskDefinitionId: integer('task_definition_id').references(() => taskDefinitions.id).notNull(),
  
  // Instance-specific data
  status: taskStatusEnum('status').default('pending').notNull(),
  priority: taskPriorityEnum('priority').default('medium').notNull(), // Can override definition priority
  
  // Progress tracking
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),
  
  // Dynamic content (can override task definition)
  customTitle: varchar('custom_title', { length: 200 }),
  customDescription: text('custom_description'),
  customCta: varchar('custom_cta', { length: 100 }),
  
  // Context and metadata
  triggerContext: jsonb('trigger_context').default('{}'), // Why this task was generated
  completionContext: jsonb('completion_context').default('{}'), // How it was completed
  
  // Ordering and dependencies
  orderIndex: integer('order_index').default(0).notNull(),
  dependsOnTasks: jsonb('depends_on_tasks').default('[]'), // Array of task_instance IDs
  
  // Flags
  isVisible: boolean('is_visible').default(true).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    timelineIdIdx: index('task_timeline_id_idx').on(table.timelineId),
    statusIdx: index('task_status_idx').on(table.status),
    priorityIdx: index('task_priority_idx').on(table.priority),
    orderIdx: index('task_order_idx').on(table.orderIndex),
  };
});

// Progress Events - Granular tracking of user actions
export const progressEvents = pgTable('progress_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  taskInstanceId: integer('task_instance_id').references(() => taskInstances.id, { onDelete: 'cascade' }),
  
  // Event details
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'field_updated', 'task_started', 'task_completed', 'profile_viewed'
  eventData: jsonb('event_data').default('{}').notNull(), // Flexible data for different event types
  
  // Context
  triggerSource: varchar('trigger_source', { length: 50 }), // 'user_action', 'system_trigger', 'notification_click'
  sessionId: varchar('session_id', { length: 100 }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('progress_user_id_idx').on(table.userId),
    eventTypeIdx: index('progress_event_type_idx').on(table.eventType),
    createdAtIdx: index('progress_created_at_idx').on(table.createdAt),
  };
});

// Notifications - Smart notification management
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  taskInstanceId: integer('task_instance_id').references(() => taskInstances.id, { onDelete: 'set null' }),
  
  // Notification content
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  ctaText: varchar('cta_text', { length: 100 }),
  ctaUrl: varchar('cta_url', { length: 500 }),
  
  // Delivery
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  viewedAt: timestamp('viewed_at', { withTimezone: true }),
  clickedAt: timestamp('clicked_at', { withTimezone: true }),
  
  // Metadata
  priority: integer('priority').default(5).notNull(), // 1-10 scale
  isRead: boolean('is_read').default(false).notNull(),
  isCancelled: boolean('is_cancelled').default(false).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('notification_user_id_idx').on(table.userId),
    scheduledIdx: index('notification_scheduled_idx').on(table.scheduledFor),
    sentIdx: index('notification_sent_idx').on(table.sentAt),
  };
});

// Achievement Tracking - Celebrate wins and build momentum
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Achievement details
  achievementKey: varchar('achievement_key', { length: 100 }).notNull(), // 'first_task_complete', 'profile_shared', 'transcript_uploaded'
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 50 }), // Emoji or icon reference
  
  // Context
  triggerTaskId: integer('trigger_task_id').references(() => taskInstances.id, { onDelete: 'set null' }),
  triggerData: jsonb('trigger_data').default('{}'),
  
  // Display
  isVisible: boolean('is_visible').default(true).notNull(),
  isNew: boolean('is_new').default(true).notNull(),
  viewedAt: timestamp('viewed_at', { withTimezone: true }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('achievement_user_id_idx').on(table.userId),
    keyIdx: index('achievement_key_idx').on(table.achievementKey),
  };
});

// Seasonal Calendar - Recruiting season awareness
export const seasonalEvents = pgTable('seasonal_events', {
  id: serial('id').primaryKey(),
  
  // Event details
  eventKey: varchar('event_key', { length: 100 }).notNull().unique(), // 'signing_day_early', 'camp_season', 'transcript_deadline'
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  
  // Timing (recurring yearly)
  startMonth: integer('start_month').notNull(), // 1-12
  startDay: integer('start_day').notNull(), // 1-31
  endMonth: integer('end_month'),
  endDay: integer('end_day'),
  
  // Applicability
  sport: sportEnum('sport').notNull(),
  applicableRoles: jsonb('applicable_roles').default('["high_school", "transfer_portal"]'),
  graduationYears: jsonb('graduation_years'), // Which grad years this affects
  
  // Impact on timeline
  priorityBoost: integer('priority_boost').default(0), // How much to boost task priorities during this period
  triggersNotifications: boolean('triggers_notifications').default(false),
  
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    eventKeyIdx: index('seasonal_event_key_idx').on(table.eventKey),
    sportIdx: index('seasonal_sport_idx').on(table.sport),
    timingIdx: index('seasonal_timing_idx').on(table.startMonth, table.startDay),
  };
}); 