import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  pgEnum
} from 'drizzle-orm/pg-core';
import { athleteProfiles } from './athleteProfiles';
import { relations } from 'drizzle-orm';

// Export the media type enum as requested
export const mediaTypeEnum = pgEnum('media_type_enum', [
  'highlight_video',
  'game_film',
  'training_clip',
  'document',
  'image',
  'other',
]);

// Define the media items table
export const mediaItems = pgTable('media_items', {
  // Primary key
  id: serial('id').primaryKey(),
  
  // Foreign key to athlete_profiles table
  athleteProfileUserId: integer('athlete_profile_user_id')
    .notNull() // As per final schema, not nullable
    .references(() => athleteProfiles.userId, { onDelete: 'cascade' }), // As per final schema

  // Media metadata
  title: varchar('title', { length: 255 }), // Nullable by default
  description: text('description'),         // Nullable by default

  // Separate URL fields
  videoUrl: text('video_url'),              // Nullable by default
  thumbnailUrl: text('thumbnail_url'),      // Nullable by default
  documentUrl: text('document_url'),        // Nullable by default
  imageUrl: text('image_url'),              // Nullable by default

  mediaType: mediaTypeEnum('media_type').notNull(), // Using the defined pgEnum
  
  // Status flags (kept from original, can be used by service)
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    athleteProfileUserIdIdx: index('media_athlete_profile_user_id_idx').on(table.athleteProfileUserId),
    // featuredIdx: index('media_featured_idx').on(table.isFeatured), // Kept existing indexes
    // mediaTypeIdx: index('media_type_idx').on(table.mediaType) // if needed
  };
});

export const mediaItemsRelations = relations(mediaItems, ({ one }) => ({
  athleteProfile: one(athleteProfiles, {
    fields: [mediaItems.athleteProfileUserId],
    references: [athleteProfiles.userId],
  })
}));

export type MediaItem = typeof mediaItems.$inferSelect;
export type NewMediaItem = typeof mediaItems.$inferInsert; 