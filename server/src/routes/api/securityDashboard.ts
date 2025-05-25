import { Router, Request, Response } from 'express';
import { successResponse } from '../../utils/responses';

const router = Router();

// Basic health check route for security dashboard
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json(successResponse('Security dashboard is healthy', { status: 'ok' }));
});

// Placeholder metrics endpoint
router.get('/metrics', (req: Request, res: Response) => {
  res.status(200).json(successResponse('Security metrics', { 
    totalUsers: 0,
    activeUsers: 0,
    securityAlerts: []
  }));
});

export default router; 