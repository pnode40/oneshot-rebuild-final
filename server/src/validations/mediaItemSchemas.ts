import { z } from 'zod';

export const finalMediaTypeEnumValues = [
  'highlight_video',
  'game_film',
  'training_clip',
  'document',
  'image',
  'other',
] as const;
export const FinalMediaTypeEnum = z.enum(finalMediaTypeEnumValues);

// Schema for creating a media item linked to an athlete profile
export const athleteProfileCreateMediaItemSchema = z.object({
  athleteProfileUserId: z.number().int().positive('Athlete Profile User ID is required'),
  title: z.string().max(255).nullable().optional(), // Max length from DB, nullable
  description: z.string().nullable().optional(),
  
  videoUrl: z.string().url('Invalid video URL format').nullable().optional(),
  thumbnailUrl: z.string().url('Invalid thumbnail URL format').nullable().optional(),
  documentUrl: z.string().url('Invalid document URL format').nullable().optional(),
  imageUrl: z.string().url('Invalid image URL format').nullable().optional(),
  
  mediaType: FinalMediaTypeEnum,
  isFeatured: z.boolean().optional(), // Defaults are in DB
  isPublic: z.boolean().optional(),   // Defaults are in DB
});
export type AthleteProfileCreateMediaItemInput = z.infer<typeof athleteProfileCreateMediaItemSchema>;

// Schema for updating a media item linked to an athlete profile
export const athleteProfileUpdateMediaItemSchema = z.object({
  // athleteProfileUserId is not updatable through this schema
  title: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  
  videoUrl: z.string().url('Invalid video URL format').nullable().optional(),
  thumbnailUrl: z.string().url('Invalid thumbnail URL format').nullable().optional(),
  documentUrl: z.string().url('Invalid document URL format').nullable().optional(),
  imageUrl: z.string().url('Invalid image URL format').nullable().optional(),
  
  mediaType: FinalMediaTypeEnum.optional(),
  isFeatured: z.boolean().optional(),
  isPublic: z.boolean().optional(),
}).partial(); // .partial() makes all fields optional, suitable for PATCH-like updates
export type AthleteProfileUpdateMediaItemInput = z.infer<typeof athleteProfileUpdateMediaItemSchema>;

// --- Potentially obsolete or differently used schemas below this line ---
// For clarity, I am commenting out the old schemas that might cause confusion.
// If they are needed for other routes (e.g. /api/media-items), they should be reviewed separately.

/*
export const mediaTypes = z.enum([
  'highlight_video', 'game_film', 'skills_video', 'interview', 'image', 'document', 'other'
]);

export const mediaItemTypes = ['video', 'image', 'document'] as const;
export const MediaItemTypeEnum = z.enum(mediaItemTypes);

export const createMediaItemBodySchema = z.object({
  athleteProfileUserId: z.number().int().positive('A valid athlete profile ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  mediaType: MediaItemTypeEnum, 
  url: z.string().url('Invalid URL format'), 
  thumbnailUrl: z.string().url('Invalid URL format for thumbnail').optional(),
  isFeatured: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(true)
});
export type CreateMediaItemBodyInput = z.infer<typeof createMediaItemBodySchema>;

export const updateMediaItemBodySchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional().nullable(),
  mediaType: MediaItemTypeEnum.optional(), 
  url: z.string().url('Invalid URL format').optional(), 
  thumbnailUrl: z.string().url('Invalid URL format for thumbnail').optional().nullable(),
  isFeatured: z.boolean().optional(),
  isPublic: z.boolean().optional()
}).partial();
export type UpdateMediaItemBodyInput = z.infer<typeof updateMediaItemBodySchema>;

export const mediaItemQuerySchema = z.object({
  athleteProfileUserId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  featured: z.enum(['true', 'false']).optional(),
  type: mediaTypes.optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
});
export type MediaItemQueryInput = z.infer<typeof mediaItemQuerySchema>;

export const mediaItemParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10))
});
export type MediaItemParamsInput = z.infer<typeof mediaItemParamsSchema>;

export const userMediaItemTypes = ['video', 'image', 'document'] as const;
export const UserMediaItemTypeEnum = z.enum(userMediaItemTypes);

export const userCreateMediaItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL format'),
  mediaType: UserMediaItemTypeEnum,
  description: z.string().optional(),
  thumbnailUrl: z.string().url('Invalid URL format for thumbnail').optional(),
});
// export type UserCreateMediaItemInput = z.infer<typeof userCreateMediaItemSchema>; 

export const userUpdateMediaItemSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  url: z.string().url('Invalid URL format').optional(),
  mediaType: UserMediaItemTypeEnum.optional(),
  description: z.string().optional().nullable(),
  thumbnailUrl: z.string().url('Invalid URL format for thumbnail').optional().nullable(),
});
// export type UserUpdateMediaItemInput = z.infer<typeof userUpdateMediaItemSchema>; 

export const mediaItemSchemas = {
  mediaTypes,
  createMediaItemBodySchema,
  updateMediaItemBodySchema,
  mediaItemQuerySchema,
  mediaItemParamsSchema
}; 
*/
