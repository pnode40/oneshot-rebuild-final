import { Express } from 'express';

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