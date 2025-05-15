import { pgTable, serial, varchar, timestamp, integer, pgEnum, text, boolean, decimal, index } from 'drizzle-orm/pg-core';
import { users, userRoleEnum } from './schema/users';

// Define the athlete role enum
export const athleteRoleEnum = pgEnum('athlete_role', ['high_school', 'transfer_portal']);

// Define the position enum for football positions
export const positionEnum = pgEnum('position_enum', [
  'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS', 'ATH'
]);

export const profiles = pgTable('profiles', {
  // Primary key and core fields
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // Basic profile information
  customUrlSlug: varchar('custom_url_slug', { length: 100 }).unique(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  
  // School information
  highSchoolName: varchar('high_school_name', { length: 256 }),
  graduationYear: integer('graduation_year'),
  gpa: decimal('gpa', { precision: 3, scale: 2 }),
  
  // Athletic information
  positionPrimary: positionEnum('position_primary').notNull(),
  positionSecondary: positionEnum('position_secondary'),
  jerseyNumber: integer('jersey_number'),
  athleteRole: athleteRoleEnum('athlete_role').default('high_school').notNull(),
  
  // Physical measurements
  heightInInches: integer('height_in_inches'),
  weightLbs: integer('weight_lbs'),
  
  // Media URLs
  profilePhotoUrl: text('profile_photo_url'),
  transcriptPdfUrl: text('transcript_pdf_url'),
  highlightVideoUrlPrimary: text('highlight_video_url_primary'),
  
  // NCAA/Transfer Portal information
  ncaaId: varchar('ncaa_id', { length: 50 }),
  yearsOfEligibility: integer('years_of_eligibility'),
  transferPortalEntryDate: timestamp('transfer_portal_entry_date'),
  
  // Privacy/Visibility control flags
  isHeightVisible: boolean('is_height_visible').default(true).notNull(),
  isWeightVisible: boolean('is_weight_visible').default(true).notNull(),
  isGpaVisible: boolean('is_gpa_visible').default(true).notNull(),
  isTranscriptVisible: boolean('is_transcript_visible').default(true).notNull(),
  isNcaaInfoVisible: boolean('is_ncaa_info_visible').default(true).notNull()
}, (table) => {
  return {
    customUrlSlugIdx: index('profiles_custom_url_slug_idx').on(table.customUrlSlug),
    slugIdx: index('profiles_slug_idx').on(table.slug),
  };
});

export { users, userRoleEnum };
