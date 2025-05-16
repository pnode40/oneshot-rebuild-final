import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db/client';
import { users } from '../db/schema';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { authenticateJWT } from '../middleware/authMiddleware';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * POST /api/test-auth/seed
 * Creates test users for development purposes
 */
router.post('/seed', async (req: Request, res: Response) => {
  try {
    const SALT_ROUNDS = 10;
    
    const testUsers = [
      {
        email: 'athlete@oneshot.com',
        password: 'password123',
        firstName: 'Alex',
        lastName: 'Athlete',
        role: 'athlete' as const
      },
      {
        email: 'recruiter@oneshot.com',
        password: 'password123',
        firstName: 'Rachel',
        lastName: 'Recruiter',
        role: 'recruiter' as const
      },
      {
        email: 'admin@oneshot.com',
        password: 'password123',
        firstName: 'Adam',
        lastName: 'Admin',
        role: 'admin' as const
      },
      {
        email: 'parent@oneshot.com',
        password: 'password123',
        firstName: 'Paula',
        lastName: 'Parent',
        role: 'parent' as const
      }
    ];
    
    const results = [];
    
    for (const user of testUsers) {
      // Check if user already exists
      const existing = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, user.email)
      });
      
      if (existing) {
        results.push({ email: user.email, status: 'already exists' });
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
      
      // Insert user
      const result = await db.insert(users)
        .values({
          email: user.email,
          hashedPassword: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: true, // Test users are auto-verified
          emailVerificationToken: null
        })
        .returning({ id: users.id });
      
      results.push({ 
        email: user.email, 
        status: 'created',
        id: result[0]?.id
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Test users processed',
      results
    });
    
  } catch (error) {
    console.error('Error seeding test users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed test users',
      error: String(error)
    });
  }
});

// JWT Secret - in production, this should be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'oneshot_dev_secret_key';

// Public route - no authentication required
router.get('/public', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'This is a public endpoint that anyone can access',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/test-auth/protected
 * Test route for checking authentication with Passport JWT
 */
router.get('/protected', authenticateJWT, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'You have successfully accessed a protected endpoint',
    userData: req.user,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/test-auth/admin-only
 * Test route for checking role-based authorization
 */
router.get(
  '/admin-only', 
  authenticate, 
  authorize(['admin']), 
  (req: AuthRequest, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'This is an admin-only route',
      user: req.user
    });
  }
);

/**
 * GET /api/test-auth/athlete-parent
 * Test route for checking multiple role authorization
 */
router.get(
  '/athlete-parent', 
  authenticate, 
  authorize(['athlete', 'parent']), 
  (req: AuthRequest, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'This is a route for athletes and parents only',
      user: req.user
    });
  }
);

// Generate a test token (for testing purposes only)
router.get('/generate-test-token', (req: Request, res: Response) => {
  // Create a test payload
  const testUser = {
    userId: 999,
    email: 'test@example.com',
    role: 'athlete' as const
  };
  
  // Generate token with 1 hour expiry
  const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });
  
  res.status(200).json({
    success: true,
    message: 'Test token generated successfully',
    token,
    expiresIn: '1 hour',
    testUser
  });
});

export default router; 