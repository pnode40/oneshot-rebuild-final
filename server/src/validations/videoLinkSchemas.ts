import { z } from 'zod';

/**
 * Schema for validating video link upload requests
 * 
 * Requirements:
 * - title: string, required
 * - url: string.url(), required
 * - description: string, optional
 * - mediaType: enum('highlight_video', 'game_film', 'training_clip'), required
 */
export const videoLinkUploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL format. Please provide a valid URL for the video.'),
  description: z.string().optional(),
  mediaType: z.enum(['highlight_video', 'game_film', 'training_clip'], {
    errorMap: () => ({ message: 'Invalid media type. Must be one of: highlight_video, game_film, training_clip' })
  })
});

// Export the typescript type for the schema
export type VideoLinkUploadInput = z.infer<typeof videoLinkUploadSchema>; 