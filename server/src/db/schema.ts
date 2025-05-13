import { pgTable, serial, varchar, timestamp, integer, pgEnum, text, boolean, decimal, index, uuid } from 'drizzle-orm/pg-core';
import { users, userRoleEnum } from './schema/users';

// Define the athlete role enum
export const athleteRoleEnum = pgEnum('athlete_role', ['high_school', 'transfer_portal']);

// Define the position enum for football positions
export const positionEnum = pgEnum('position_enum', [
  'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS', 'ATH'
]);

// Define the sports enum
export const sportEnum = pgEnum('sport_enum', ['football', 'basketball', 'baseball', 'soccer', 'track', 'swimming', 'volleyball', 'other']);

export const profiles = pgTable('profiles', {
  // Primary key
  id: uuid('id').defaultRandom().primaryKey(),
  
  // User reference with proper foreign key constraint
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Role information
  role: athleteRoleEnum('role').notNull().default('high_school'),
  
  // Split name fields
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  
  // Sport and position information
  sport: sportEnum('sport').notNull().default('football'),
  position: varchar('position', { length: 100 }).notNull(),
  
  // Academic and school information
  gradYear: integer('grad_year').notNull(),
  highSchool: varchar('high_school', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  
  // Physical attributes
  height: varchar('height', { length: 50 }).notNull(), // e.g., "6'1"
  weight: integer('weight').notNull(),
  
  // Optional academic information
  gpa: decimal('gpa', { precision: 3, scale: 2 }),
  transcriptPdfUrl: text('transcript_pdf_url'),
  
  // Coach information
  coachName: text('coach_name'),
  coachEmail: text('coach_email'),
  coachPhone: text('coach_phone'),
  
  // Media URLs
  profilePhotoUrl: text('profile_photo_url'),
  featuredVideoUrl: text('featured_video_url'),
  ogImageSelectionUrl: text('og_image_selection_url'),
  videoUrls: text('video_urls').array(), // Array of strings
  
  // Bio and additional info
  bio: text('bio'),
  
  // Profile customization and visibility settings
  customUrlSlug: varchar('custom_url_slug', { length: 100 }).notNull().unique(),
  public: boolean('public').default(true).notNull(),
  showContactInfo: boolean('show_contact_info').default(true).notNull(),
  showCoachInfo: boolean('show_coach_info').default(true).notNull(),
  showTranscript: boolean('show_transcript').default(true).notNull(),
  
  // Profile metrics
  completenessScore: integer('completeness_score').default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    customUrlSlugIdx: index('profiles_custom_url_slug_idx').on(table.customUrlSlug),
  };
});

export { users, userRoleEnum };
