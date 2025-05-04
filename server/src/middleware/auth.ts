import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT Secret - in production, this should be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'oneshot_dev_secret_key';

// Custom request interface with user data
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: 'athlete' | 'recruiter' | 'admin' | 'parent';
  };
}

// JWT payload interface
interface JwtPayload {
  userId: number;
  email: string;
  role: 'athlete' | 'recruiter' | 'admin' | 'parent';
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and adds user data to request
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Attach user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if authenticated user has one of the allowed roles
 */
export const authorize = (allowedRoles: ('athlete' | 'recruiter' | 'admin' | 'parent')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }
    
    next();
  };
}; 