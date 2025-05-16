import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure users can only access their own data or admins can access any data
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export function requireSelfOrAdmin(req: Request, res: Response, next: NextFunction) {
  // Get authenticated user from request
  const user = req.user;
  
  // If no user is attached to the request, they're not authenticated
  if (!user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }
  
  // Get target user ID from params or body
  // Convert to number if it's a string (from URL params)
  const targetUserIdParam = req.params.userId ? parseInt(req.params.userId, 10) : undefined;
  const targetUserIdBody = req.body.userId;
  
  // Use the first defined value
  const targetUserId = targetUserIdParam ?? targetUserIdBody;
  
  // If no target user ID is found, we can't perform the check
  if (targetUserId === undefined) {
    return res.status(400).json({ 
      success: false,
      message: 'User ID parameter required' 
    });
  }
  
  // Check if user is admin or requesting their own data
  if (user.role === 'admin' || user.userId === targetUserId) {
    // Allow access
    return next();
  }
  
  // Otherwise, deny access
  return res.status(403).json({ 
    success: false,
    message: 'Access denied: You can only access your own data' 
  });
}

/**
 * Middleware to ensure only admin users can access a route
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Get authenticated user from request
  const user = req.user;
  
  // If no user is attached to the request, they're not authenticated
  if (!user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }
  
  // Check if user is an admin
  if (user.role === 'admin') {
    // Allow access
    return next();
  }
  
  // Otherwise, deny access
  return res.status(403).json({ 
    success: false,
    message: 'Access denied: Admins only' 
  });
}

/**
 * Middleware to restrict access to specific user roles
 * @param roles Array of roles that are allowed to access the route
 * @returns Middleware function
 */
export function requireRole(roles: Array<'athlete' | 'recruiter' | 'admin' | 'parent'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get authenticated user from request
    const user = req.user;
    
    // If no user is attached to the request, they're not authenticated
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    // Check if user's role is in the allowed roles
    if (roles.includes(user.role)) {
      // Allow access
      return next();
    }
    
    // Otherwise, deny access
    return res.status(403).json({ 
      success: false,
      message: `Access denied: Restricted to ${roles.join(', ')} roles` 
    });
  };
} 