import {
  pgTable,
  integer,
  varchar,
  timestamp,
  decimal,
  text,
  jsonb,
  pgEnum,
  boolean,
  primaryKey,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { users } from './users';

// Define sports enum
export const sportsEnum = pgEnum('sports_enum', ['Football']);

// Define football positions enum
export const footballPositionsEnum = pgEnum('football_positions_enum', [
  'QB', 'WR', 'RB', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS', 'ATH'
]);

// Define visibility enum
export const visibilityEnum = pgEnum('visibility_enum', [
  'public', 'private', 'recruiters_only'
]);

// Define commitment status enum
export const commitmentStatusEnum = pgEnum('commitment_status_enum', [
  'uncommitted', 'committed', 'signed', 'transfer_portal'
]);

// Define athlete role enum
export const athleteRoleEnum = pgEnum('athlete_role_enum', [
  'high_school', 'transfer_portal'
]);

// Define the athlete profiles table
export const athleteProfiles = pgTable('athlete_profiles', {
  // Primary key - using userId as the primary key for one-to-one relationship
  userId: integer('user_id')
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // URL Slug for public profile
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  
  // Athlete Role 
  athleteRole: athleteRoleEnum('athlete_role').default('high_school').notNull(),
  
  // Personal Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  profileImageUrl: text('profile_image_url'),
  jerseyNumber: varchar('jersey_number', { length: 10 }),
  
  // Location Information
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  
  // Academic Information
  highSchoolName: varchar('high_school_name', { length: 256 }),
  graduationYear: integer('graduation_year'),
  gpa: decimal('gpa', { precision: 3, scale: 2 }),
  transcriptUrl: text('transcript_url'),
  
  // NCAA Information (for Transfer Portal)
  ncaaId: varchar('ncaa_id', { length: 50 }),
  eligibilityStatus: varchar('eligibility_status', { length: 100 }),
  
  // Physical Measurements
  heightInches: integer('height_inches'),
  weightLbs: integer('weight_lbs'),
  
  // Athletic Performance
  sport: sportsEnum('sport').default('Football').notNull(),
  positions: text('positions').array(), // Array of football positions
  primaryPosition: footballPositionsEnum('primary_position'),
  secondaryPosition: footballPositionsEnum('secondary_position'),
  
  // Performance Metrics
  fortyYardDash: decimal('forty_yard_dash', { precision: 4, scale: 2 }),
  benchPressMax: integer('bench_press_max'),
  verticalLeap: decimal('vertical_leap', { precision: 4, scale: 1 }),
  shuttleRun: decimal('shuttle_run', { precision: 4, scale: 2 }),
  broadJump: decimal('broad_jump', { precision: 4, scale: 1 }),
  proAgility: decimal('pro_agility', { precision: 4, scale: 2 }),
  squat: integer('squat'),
  deadlift: integer('deadlift'),
  otherAthleticStats: jsonb('other_athletic_stats'),
  
  // Coach Contact Information
  coachFirstName: varchar('coach_first_name', { length: 100 }),
  coachLastName: varchar('coach_last_name', { length: 100 }),
  coachEmail: varchar('coach_email', { length: 255 }),
  coachPhone: varchar('coach_phone', { length: 20 }),
  isCoachVerified: boolean('is_coach_verified').default(false),
  
  // Featured Video
  featuredVideoUrl: text('featured_video_url'),
  featuredVideoType: varchar('featured_video_type', { length: 20 }), // 'youtube' or 'hudl'
  featuredVideoThumbnail: text('featured_video_thumbnail'),
  
  // Visibility Controls (field-level)
  showHeight: boolean('show_height').default(true).notNull(),
  showWeight: boolean('show_weight').default(true).notNull(),
  showGPA: boolean('show_gpa').default(true).notNull(),
  showTranscript: boolean('show_transcript').default(false).notNull(),
  showNcaaInfo: boolean('show_ncaa_info').default(true).notNull(),
  showPerformanceMetrics: boolean('show_performance_metrics').default(true).notNull(),
  showCoachInfo: boolean('show_coach_info').default(true).notNull(),
  
  // Overall Profile Status
  isPublic: boolean('is_public').default(false).notNull(),
  
  // Recruitment Status
  visibility: visibilityEnum('visibility').default('public').notNull(),
  commitmentStatus: commitmentStatusEnum('commitment_status').default('uncommitted'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: index('athlete_name_idx').on(table.lastName, table.firstName),
    sportPositionIdx: index('sport_position_idx').on(table.sport, table.primaryPosition),
    graduationYearIdx: index('graduation_year_idx').on(table.graduationYear),
    slugIdx: uniqueIndex('athlete_slug_idx').on(table.slug)
  };
}); 