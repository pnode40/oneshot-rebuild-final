import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireSelfOrAdmin, requireAdmin, requireRole } from '../middleware/rbacMiddleware';

const router = Router();

/**
 * GET /api/test-rbac/public
 * Public route - accessible to anyone
 */
router.get('/public', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'This is a public route',
    access: 'public'
  });
});

/**
 * GET /api/test-rbac/protected
 * Protected route - requires authentication
 */
router.get('/protected', authenticateJWT, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'You have accessed a protected route',
    user: req.user,
    access: 'authenticated'
  });
});

/**
 * GET /api/test-rbac/admin
 * Admin-only route - requires admin role
 */
router.get('/admin', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'You have accessed an admin-only route',
    user: req.user,
    access: 'admin'
  });
});

/**
 * GET /api/test-rbac/user/:userId
 * User data route - requires self or admin access
 */
router.get('/user/:userId', authenticateJWT, requireSelfOrAdmin, (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  
  res.json({
    success: true,
    message: 'You have accessed user data',
    requestedUserId: userId,
    requestingUser: req.user,
    access: req.user?.role === 'admin' ? 'admin' : 'self'
  });
});

/**
 * POST /api/test-rbac/user/:userId
 * Update user data - requires self or admin access
 */
router.post('/user/:userId', authenticateJWT, requireSelfOrAdmin, (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  
  res.json({
    success: true,
    message: 'You have updated user data',
    requestedUserId: userId,
    requestingUser: req.user,
    data: req.body,
    access: req.user?.role === 'admin' ? 'admin' : 'self'
  });
});

/**
 * GET /api/test-rbac/athlete
 * Athlete-only route - requires athlete role
 */
router.get('/athlete', authenticateJWT, requireRole(['athlete']), (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'You have accessed an athlete-only route',
    user: req.user,
    access: 'athlete'
  });
});

/**
 * GET /api/test-rbac/recruiter-admin
 * Recruiter or admin route - requires either role
 */
router.get('/recruiter-admin', authenticateJWT, requireRole(['recruiter', 'admin']), (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'You have accessed a recruiter or admin route',
    user: req.user,
    access: req.user?.role
  });
});

export default router; 