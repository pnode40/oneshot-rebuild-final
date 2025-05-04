import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { users } from '../db/schema';

const router = Router();

// JWT Secret - in production, this should be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'oneshot_dev_secret_key';
const SALT_ROUNDS = 10;

// Validation schema for user registration
const registerSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(['athlete', 'recruiter', 'admin', 'parent']).default('athlete')
});

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;

// Registration handler
async function registerUser(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.errors 
      });
    }

    const validatedData = validationResult.data;
    
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, validatedData.email)
      });

      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
      
      // Generate a verification token (for email verification)
      const verificationToken = Math.random().toString(36).substring(2, 15) + 
                               Math.random().toString(36).substring(2, 15);
      
      // Insert the new user
      const result = await db.insert(users)
        .values({
          email: validatedData.email,
          hashedPassword: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          role: validatedData.role,
          isVerified: false,
          emailVerificationToken: verificationToken
        })
        .returning();
      
      if (!result || !result[0]) {
        throw new Error('Failed to create user');
      }
      
      const newUser = result[0];
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          role: newUser.role
        }, 
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return success with token (excluding sensitive data)
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isVerified: newUser.isVerified
        }
      });
      
      // TODO: Send verification email
      // This would be implemented with an email service
      
    } catch (error) {
      console.error('Database operation failed:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to register user' 
      });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred' 
    });
  }
}

// Login handler
async function loginUser(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        errors: validationResult.error.errors 
      });
    }

    const { email, password } = validationResult.data;
    
    try {
      // Find user by email
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
      
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role
        }, 
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Return success with token (excluding sensitive data)
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified
        }
      });
      
    } catch (error) {
      console.error('Login failed:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process login request' 
      });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred' 
    });
  }
}

// POST /api/auth/register - Register a new user
router.post('/register', registerUser);

// POST /api/auth/login - Login an existing user
router.post('/login', loginUser);

export default router; 