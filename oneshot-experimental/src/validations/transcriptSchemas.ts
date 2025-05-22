import { z } from 'zod';

/**
 * Schema for validating transcript upload requests
 * 
 * Requirements:
 * - title: string, required
 * - url: string.url(), required
 */
export const transcriptUploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL format. Please provide a valid URL for the transcript.'),
});

// Export the typescript type for the schema
export type TranscriptUploadInput = z.infer<typeof transcriptUploadSchema>; 