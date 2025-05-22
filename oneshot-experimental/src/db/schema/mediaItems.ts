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

// Export the media type enum
export const mediaTypeEnum = pgEnum('media_type_enum', [
  'highlight_video',
  'game_film',
  'training_clip',
  'document',
  'PDF',  // Added PDF type for transcripts
  'image',
  'other',
]);

// Define the media items table
export const mediaItems = pgTable('media_items', {
  // Primary key
  id: serial('id').primaryKey(),
  
  // Foreign key to athlete_profiles table
  athleteProfileUserId: integer('athlete_profile_user_id')
    .notNull()
    .references(() => athleteProfiles.userId, { onDelete: 'cascade' }),

  // Media metadata
  title: varchar('title', { length: 255 }),
  description: text('description'),

  // Separate URL fields
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  documentUrl: text('document_url'),
  imageUrl: text('image_url'),

  mediaType: mediaTypeEnum('media_type').notNull(),
  
  // Status flags
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPublic: boolean('is_public').default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    athleteProfileUserIdIdx: index('media_athlete_profile_user_id_idx').on(table.athleteProfileUserId),
  };
});

// Define relations
export const mediaItemsRelations = relations(mediaItems, ({ one }) => ({
  athleteProfile: one(athleteProfiles, {
    fields: [mediaItems.athleteProfileUserId],
    references: [athleteProfiles.userId],
  })
}));

export type MediaItem = typeof mediaItems.$inferSelect;
export type NewMediaItem = typeof mediaItems.$inferInsert; 