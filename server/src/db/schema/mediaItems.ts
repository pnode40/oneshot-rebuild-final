import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';
import { athleteProfiles } from './athleteProfiles';

// Define media type enum
export const mediaTypeEnum = pgEnum('media_type_enum', [
  'highlight_video', 'game_film', 'skills_video', 'interview', 'image', 'document', 'other'
]);

// Define the media items table
export const mediaItems = pgTable('media_items', {
  // Primary key
  id: serial('id').primaryKey(),
  
  // Foreign key to athlete profile
  athleteProfileUserId: integer('athlete_profile_user_id')
    .notNull()
    .references(() => athleteProfiles.userId, { onDelete: 'cascade' }),
  
  // Media metadata
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  mediaType: mediaTypeEnum('media_type').default('highlight_video').notNull(),
  
  // URLs
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  documentUrl: text('document_url'),
  imageUrl: text('image_url'),
  
  // Featured status
  isFeatured: boolean('is_featured').default(false),
  isPublic: boolean('is_public').default(true),
  
  // Timestamps
  uploadDate: timestamp('upload_date', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    athleteProfileIdIdx: index('media_athlete_profile_id_idx').on(table.athleteProfileUserId),
    featuredIdx: index('media_featured_idx').on(table.isFeatured),
    mediaTypeIdx: index('media_type_idx').on(table.mediaType)
  };
}); 