import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { testDb, setupTestDatabase, cleanupTestDatabase } from '../setup';
import { users } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import passwordResetRoutes from '../../src/routes/passwordResetRoutes';

// Mock email service to avoid sending actual emails during tests
jest.mock('../../src/services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  testEmailConfiguration: jest.fn().mockResolvedValue(true)
}));

// Import the mocked email service functions
import { sendPasswordResetEmail } from '../../src/services/emailService';
const mockSendPasswordResetEmail = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;

// Test app setup
const app = express();
app.use(express.json());
app.use('/api/auth', passwordResetRoutes);

// Test data
const testUser = {
  email: 'test@oneshot.com',
  hashedPassword: '', // Will be set in beforeAll
  firstName: 'John',
  lastName: 'Doe',
  role: 'athlete' as const
};

const testUser2 = {
  email: 'test2@oneshot.com',
  hashedPassword: '', // Will be set in beforeAll
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'athlete' as const
};

let testUserId: number;
let testUser2Id: number;

describe('Password Reset Routes', () => {
  beforeAll(async () => {
    // Hash passwords for test users
    testUser.hashedPassword = await bcrypt.hash('password123', 12);
    testUser2.hashedPassword = await bcrypt.hash('password456', 12);
  });

  beforeEach(async () => {
    await cleanupTestDatabase();

    // Insert test users
    const result1 = await testDb.insert(users)
      .values(testUser)
      .returning({ id: users.id });
    testUserId = result1[0].id;

    const result2 = await testDb.insert(users)
      .values(testUser2)
      .returning({ id: users.id });
    testUser2Id = result2[0].id;

    // Clear mock calls
    mockSendPasswordResetEmail.mockClear();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/auth/forgot-password', () => {
    describe('Success Cases', () => {
      it('should request password reset for valid email', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: testUser.email });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('If an account with that email exists');
        expect(response.body.data.emailSent).toBe(true);
        expect(response.body.data.expiresIn).toBe('1 hour(s)');

        // Verify email service was called
        expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
          testUser.email,
          expect.any(String),
          testUser.firstName
        );

        // Verify reset token was saved to database
        const userRecord = await testDb.select()
          .from(users)
          .where(eq(users.id, testUserId))
          .limit(1);

        expect(userRecord[0].resetToken).toBeTruthy();
        expect(userRecord[0].resetTokenExpiry).toBeTruthy();
        expect(userRecord[0].resetTokenExpiry).toBeInstanceOf(Date);
      });

      it('should return generic message for non-existent email (security)', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'nonexistent@example.com' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('If an account with that email exists');
        expect(response.body.data.emailSent).toBe(false);

        // Verify email service was NOT called
        expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
      });
    });

    describe('Validation Errors', () => {
      it('should reject invalid email format', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'invalid-email' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid email format');
      });

      it('should reject missing email', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let validResetToken: string;

    beforeEach(async () => {
      // Generate a valid reset token for testing
      validResetToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      await testDb.update(users)
        .set({
          resetToken: validResetToken,
          resetTokenExpiry: expiry
        })
        .where(eq(users.id, testUserId));
    });

    describe('Success Cases', () => {
      it('should reset password with valid token', async () => {
        const newPassword = 'NewSecurePass123!';

        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: validResetToken,
            newPassword: newPassword
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Password reset successfully');
        expect(response.body.data.userId).toBe(testUserId);
        expect(response.body.data.email).toBe(testUser.email);

        // Verify password was updated in database
        const userRecord = await testDb.select()
          .from(users)
          .where(eq(users.id, testUserId))
          .limit(1);

        const passwordMatch = await bcrypt.compare(newPassword, userRecord[0].hashedPassword);
        expect(passwordMatch).toBe(true);

        // Verify reset token was cleared
        expect(userRecord[0].resetToken).toBeNull();
        expect(userRecord[0].resetTokenExpiry).toBeNull();
      });
    });

    describe('Invalid Token Cases', () => {
      it('should reject invalid reset token', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: 'invalid-token',
            newPassword: 'NewPassword123!'
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid or expired reset token');
      });

      it('should reject expired reset token', async () => {
        // Create an expired token
        const expiredToken = crypto.randomBytes(32).toString('hex');
        const pastExpiry = new Date();
        pastExpiry.setHours(pastExpiry.getHours() - 2); // 2 hours ago

        await testDb.update(users)
          .set({
            resetToken: expiredToken,
            resetTokenExpiry: pastExpiry
          })
          .where(eq(users.id, testUserId));

        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: expiredToken,
            newPassword: 'NewPassword123!'
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid or expired reset token');
      });
    });

    describe('Password Validation', () => {
      it('should reject password shorter than 8 characters', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: validResetToken,
            newPassword: 'Short1!'
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Password must be at least 8 characters');
      });
    });
  });

  describe('POST /api/auth/verify-reset-token', () => {
    let validResetToken: string;

    beforeEach(async () => {
      validResetToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      await testDb.update(users)
        .set({
          resetToken: validResetToken,
          resetTokenExpiry: expiry
        })
        .where(eq(users.id, testUserId));
    });

    describe('Success Cases', () => {
      it('should verify valid reset token', async () => {
        const response = await request(app)
          .post('/api/auth/verify-reset-token')
          .send({ token: validResetToken });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Reset token is valid');
        expect(response.body.data.valid).toBe(true);
        expect(response.body.data.email).toBe(testUser.email);
      });
    });

    describe('Invalid Token Cases', () => {
      it('should reject invalid reset token', async () => {
        const response = await request(app)
          .post('/api/auth/verify-reset-token')
          .send({ token: 'invalid-token' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid or expired reset token');
      });
    });
  });

  describe('Security Integration Tests', () => {
    it('should handle complete password reset workflow', async () => {
      // Step 1: Request password reset
      const forgotResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(forgotResponse.status).toBe(200);

      // Get the reset token from database
      const userRecord = await testDb.select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1);

      const resetToken = userRecord[0].resetToken!;

      // Step 2: Verify token is valid
      const verifyResponse = await request(app)
        .post('/api/auth/verify-reset-token')
        .send({ token: resetToken });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.data.valid).toBe(true);

      // Step 3: Reset password
      const newPassword = 'NewWorkflowPass123!';
      const resetResponse = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword
        });

      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body.success).toBe(true);

      // Step 4: Verify token is no longer valid
      const verifyAfterResponse = await request(app)
        .post('/api/auth/verify-reset-token')
        .send({ token: resetToken });

      expect(verifyAfterResponse.status).toBe(400);
      expect(verifyAfterResponse.body.message).toContain('Invalid or expired reset token');
    });
  });
}); 