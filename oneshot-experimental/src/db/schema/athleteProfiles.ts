import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  decimal,
  jsonb,
  pgEnum
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { relations } from 'drizzle-orm';

// Sport enum
export const sportsEnum = pgEnum('sports_enum', [
  'Football',
  'Basketball',
  'Baseball',
  'Soccer',
  'Track',
  'Swimming',
  'Other'
]);

// Football positions enum
export const footballPositionsEnum = pgEnum('football_positions_enum', [
  'Quarterback',
  'Running_Back',
  'Wide_Receiver',
  'Tight_End',
  'Offensive_Line',
  'Defensive_Line',
  'Linebacker',
  'Cornerback',
  'Safety',
  'Special_Teams'
]);

// Visibility enum
export const visibilityEnum = pgEnum('visibility_enum', [
  'public',
  'private',
  'verified_only'
]);

// Commitment status enum
export const commitmentStatusEnum = pgEnum('commitment_status_enum', [
  'uncommitted',
  'committed',
  'signed'
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
});

// Define relations
export const athleteProfilesRelations = relations(athleteProfiles, ({ one }) => ({
  user: one(users, {
    fields: [athleteProfiles.userId],
    references: [users.id],
  }),
}));

export type AthleteProfile = typeof athleteProfiles.$inferSelect;
export type NewAthleteProfile = typeof athleteProfiles.$inferInsert; 