import { z } from 'zod';

/**
 * Validation schema for user registration
 */
export const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['athlete', 'recruiter', 'admin', 'parent']).default('athlete')
});

/**
 * Validation schema for user login
 */
export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Validation schema for password reset request
 */
export const requestPasswordResetSchema = z.object({
  email: z.string().email('Valid email is required'),
});

/**
 * Validation schema for password reset
 */
export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Export all schemas as a single object
 */
export const authSchemas = {
  registerSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema
}; 