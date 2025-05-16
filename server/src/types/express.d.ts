// Declaration for extending Express Request type
// Import from middleware/auth instead of defining here
// to ensure consistency with the existing AuthRequest interface

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: 'athlete' | 'recruiter' | 'admin' | 'parent';
      };
    }
  }
} 