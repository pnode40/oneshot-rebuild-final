/**
 * OneShot Development Scratchpad
 * 
 * This file is for Claude to experiment with code, test solutions,
 * and prototype functionality without affecting the main codebase.
 * 
 * This file should not be committed to version control.
 */

// Example authentication middleware prototype
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Types
interface JwtPayload {
  userId: number;
  role: 'athlete' | 'recruiter' | 'admin' | 'parent';
  email: string;
}

// Authentication middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token (in production, use a proper secret)
    const decoded = jwt.verify(token, 'DEVELOPMENT_SECRET_KEY') as JwtPayload;
    
    // Attach user info to request object
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
const authorize = (allowedRoles: ('athlete' | 'recruiter' | 'admin' | 'parent')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage example:
/*
app.get('/api/profile/:id', 
  authenticate, 
  authorize(['athlete', 'recruiter', 'admin']), 
  (req, res) => {
    // Handle fetching profile
  }
);
*/ 