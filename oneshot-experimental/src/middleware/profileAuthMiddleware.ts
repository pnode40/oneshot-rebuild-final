import { Request, Response, NextFunction } from 'express';

// Auth request interface with user data
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Middleware to ensure only the owner of a profile or an admin can access a route
 * Expects req.params.athleteProfileId to contain the ID of the athlete profile
 */
export function requireProfileOwnerOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  // Get authenticated user from request
  const user = req.user;
  
  // If no user is attached to the request, they're not authenticated
  if (!user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }
  
  // Get athlete profile ID from params
  const athleteProfileId = req.params.athleteProfileId;
  
  if (!athleteProfileId) {
    return res.status(400).json({ 
      success: false,
      message: 'Athlete profile ID is required' 
    });
  }
  
  // Convert to number if it's a string (from URL params)
  const profileUserId = parseInt(athleteProfileId, 10);
  
  // Check if user is admin (can access any profile) or if they are the owner of the profile
  if (user.role === 'admin') {
    // Admins can access any profile
    return next();
  } else if (user.userId === profileUserId) {
    // Profile owner can access their own profile
    return next();
  }
  
  // If neither admin nor profile owner, deny access
  return res.status(403).json({ 
    success: false,
    message: 'Access denied: You can only access your own profile' 
  });
} 