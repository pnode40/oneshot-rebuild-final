import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '../../shared/schemas/authSchemas.js';
import { signJwt } from '../../shared/utils/jwt.js';
import { sendVerificationEmail } from '../services/emailService.js';
const router = Router();
// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password } = registerSchema.parse(req.body);
        // Check if user already exists
        const existingUser = await req.db.users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create user
        const user = await req.db.users.insertOne({
            email,
            password: hashedPassword,
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        // Generate verification token
        const verificationToken = signJwt({ userId: user.insertedId, email });
        // Send verification email
        await sendVerificationEmail(email, verificationToken);
        return res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.'
        });
    }
    catch (error) {
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
        const user = await req.db.users.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // (Commenting out email verification check for now)
        /*
        if (!user.verified) {
          return res.status(403).json({
            success: false,
            message: 'Please verify your email first'
          });
        }
        */
        // Generate JWT token
        const token = signJwt({ userId: user._id, email });
        // Return login success response
        const response = {
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                verified: user.verified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        };
        return res.json(response);
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Login failed'
        });
    }
});
import { requireAuth } from '../middleware/authMiddleware.js'; // already imported probably
// Protected route
router.get('/protected/test', requireAuth, (req, res) => {
    res.json({
        success: true,
        message: `Protected route accessed successfully for user ${req.user?.email}`
    });
});
export default router;
