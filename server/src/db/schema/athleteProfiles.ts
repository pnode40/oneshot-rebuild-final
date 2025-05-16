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

// Define the athlete profiles table
export const athleteProfiles = pgTable('athlete_profiles', {
  // Primary key - using userId as the primary key for one-to-one relationship
  userId: integer('user_id')
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Personal Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  profileImageUrl: text('profile_image_url'),
  
  // Location Information
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  
  // Academic Information
  highSchoolName: varchar('high_school_name', { length: 256 }),
  graduationYear: integer('graduation_year'),
  gpa: decimal('gpa', { precision: 3, scale: 2 }),
  
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
  otherAthleticStats: jsonb('other_athletic_stats'),
  
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
    graduationYearIdx: index('graduation_year_idx').on(table.graduationYear)
  };
}); 