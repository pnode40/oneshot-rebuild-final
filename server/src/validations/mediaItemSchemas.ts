import { z } from 'zod';

/**
 * Media type enum aligned with database schema
 */
export const mediaTypes = z.enum([
  'highlight_video', 'game_film', 'skills_video', 'interview', 'image', 'document', 'other'
]);

// Used in POST /api/media-items
export const createMediaItemBodySchema = z.object({
  // Required for DB relationship, but immutable after creation
  athleteProfileUserId: z.number().int().positive('A valid athlete profile ID is required'),
  
  // Media details
  title: z.string().max(255, 'Title must be 255 characters or less').optional().nullable(),
  description: z.string().optional().nullable(),
  mediaType: mediaTypes.default('highlight_video'),
  
  // Media URLs
  videoUrl: z.string().url({ message: "A valid video URL is required" }),
  thumbnailUrl: z.string().url({ message: "Invalid thumbnail URL format" }).optional().nullable(),
  documentUrl: z.string().url({ message: "Invalid document URL format" }).optional().nullable(),
  imageUrl: z.string().url({ message: "Invalid image URL format" }).optional().nullable(),
  
  // Status flags
  isFeatured: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(true)
});

export type CreateMediaItemBodyInput = z.infer<typeof createMediaItemBodySchema>;

// Used in PATCH /api/media-items/:id
export const updateMediaItemBodySchema = z.object({
  // Exclude athleteProfileUserId as it's immutable
  title: z.string().max(255, 'Title must be 255 characters or less').optional().nullable(),
  description: z.string().optional().nullable(),
  mediaType: mediaTypes.optional(),
  
  // Media URLs
  videoUrl: z.string().url({ message: "A valid video URL is required" }).optional(),
  thumbnailUrl: z.string().url({ message: "Invalid thumbnail URL format" }).optional().nullable(),
  documentUrl: z.string().url({ message: "Invalid document URL format" }).optional().nullable(),
  imageUrl: z.string().url({ message: "Invalid image URL format" }).optional().nullable(),
  
  // Status flags
  isFeatured: z.boolean().optional(),
  isPublic: z.boolean().optional()
}).partial();

export type UpdateMediaItemBodyInput = z.infer<typeof updateMediaItemBodySchema>;

// Used in GET /api/media-items
export const mediaItemQuerySchema = z.object({
  athleteProfileUserId: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  featured: z.enum(['true', 'false']).optional(),
  type: mediaTypes.optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
});

export type MediaItemQueryInput = z.infer<typeof mediaItemQuerySchema>;

// Used in GET /api/media-items/:id/params
export const mediaItemParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10))
});

export type MediaItemParamsInput = z.infer<typeof mediaItemParamsSchema>;

/**
 * Export all schemas as a single object
 */
export const mediaItemSchemas = {
  mediaTypes,
  createMediaItemBodySchema,
  updateMediaItemBodySchema,
  mediaItemQuerySchema,
  mediaItemParamsSchema
}; 