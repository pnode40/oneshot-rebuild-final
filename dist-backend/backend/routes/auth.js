import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '../../shared/schemas/authSchemas.js';
import { signJwt } from '../../shared/utils/jwt.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db.js';
import { requireAuth } from '../middleware/authMiddleware.js';
const router = Router();
// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password } = registerSchema.parse(req.body);
        // Check if user already exists
        const existingUsers = await db.select().from(schema.users).where(eq(schema.users.email, email));
        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create user
        const [newUser] = await db.insert(schema.users).values({
            email,
            passwordHash: hashedPassword,
        }).returning();
        // Generate verification token
        const verificationToken = signJwt({ userId: String(newUser.id), email });
        // Send verification email
        await sendVerificationEmail(email, verificationToken);
        return res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Registration failed'
        });
    }
});
// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        // Find user by email
        const foundUsers = await db.select().from(schema.users).where(eq(schema.users.email, email));
        if (foundUsers.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const user = foundUsers[0];
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Generate JWT token
        const token = signJwt({ userId: String(user.id), email });
        // Return login success response
        const response = {
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt || new Date()
            }
        };
        return res.json(response);
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Login failed'
        });
    }
});
// Protected route
router.get('/protected/test', requireAuth, (req, res) => {
    res.json({
        success: true,
        message: `Protected route accessed successfully for user ${req.user?.email}`
    });
});
export default router;
