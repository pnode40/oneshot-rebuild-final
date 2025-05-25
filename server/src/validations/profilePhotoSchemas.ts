import { z } from 'zod';

/**
 * Schema for profile photo upload request body
 */
export const profilePhotoUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').default('Profile Photo'),
  description: z.string().max(1000, 'Description too long').optional(),
});

export type ProfilePhotoUploadData = z.infer<typeof profilePhotoUploadSchema>;

/**
 * Schema for profile photo update
 */
export const profilePhotoUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
});

export type ProfilePhotoUpdateData = z.infer<typeof profilePhotoUpdateSchema>;

/**
 * Schema for userId parameter validation
 */
export const userIdParamSchema = z.object({
  userId: z.string().regex(/^\d+$/, 'User ID must be a number').transform(Number)
});

export type UserIdParams = z.infer<typeof userIdParamSchema>;

/**
 * Schema for media item ID parameter validation
 */
export const profilePhotoIdParamSchema = z.object({
  mediaItemId: z.string().regex(/^\d+$/, 'Media item ID must be a number').transform(Number)
});

export type ProfilePhotoIdParams = z.infer<typeof profilePhotoIdParamSchema>;

/**
 * File validation rules for multer
 */
export const profilePhotoFileRules = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: 1
}; 