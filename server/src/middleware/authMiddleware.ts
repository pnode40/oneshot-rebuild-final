import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT Secret - in production, this should be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'oneshot_dev_secret_key';

// JWT payload interface
interface JwtPayload {
  userId: number;
  email: string;
  role: 'athlete' | 'recruiter' | 'admin' | 'parent';
}

/**
 * JWT Authentication middleware that uses direct verification
 * Verifies JWT token and attaches user to request object
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  // Get authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
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
      message: 'Invalid or expired token' 
    });
  }
} 