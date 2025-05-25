import request from 'supertest';
import { app } from '../index';
import { db } from '../db/client';
import { users } from '../db/schema';
import { passwordHistory } from '../db/schema/passwordHistory';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { 
  validatePasswordStrength, 
  isPasswordRecentlyUsed,
  updatePasswordSecurely,
  detectSuspiciousResetActivity 
} from '../services/passwordSecurityService';

// Mock email service to avoid sending actual emails during tests
jest.mock('../services/emailService', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetConfirmationEmail: jest.fn().mockResolvedValue(undefined),
  testEmailConfiguration: jest.fn().mockResolvedValue(true)
}));

const { sendPasswordResetEmail, sendPasswordResetConfirmationEmail } = require('../services/emailService');

describe('Enhanced Password Reset System', () => {
  let testUser: any;
  let testUserId: number;

  beforeEach(async () => {
    // Clear test data
    await db.delete(passwordHistory);
    await db.delete(users);

    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    const [user] = await db.insert(users).values({
      email: 'test@example.com',
      hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'athlete'
    }).returning();

    testUser = user;
    testUserId = user.id;

    // Reset mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(passwordHistory);
    await db.delete(users);
  });

  describe('Password Strength Validation', () => {
    describe('✅ Success Cases', () => {
      it('should validate strong password correctly', () => {
        const result = validatePasswordStrength('StrongPass123!');
        
        expect(result.isValid).toBe(true);
        expect(result.strength).toBe('strong');
        expect(result.score).toBeGreaterThan(70);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate good password correctly', () => {
        const result = validatePasswordStrength('GoodPass123');
        
        expect(result.isValid).toBe(true);
        expect(result.strength).toBe('good');
        expect(result.score).toBeGreaterThan(50);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('❌ Error Cases', () => {
      it('should reject password that is too short', () => {
        const result = validatePasswordStrength('Short1');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be at least 8 characters long');
      });

      it('should reject password without uppercase', () => {
        const result = validatePasswordStrength('lowercase123');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
      });

      it('should reject password without numbers', () => {
        const result = validatePasswordStrength('NoNumbers');
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one number');
      });

      it('should penalize common patterns', () => {
        const result = validatePasswordStrength('Password123');
        
        expect(result.score).toBeLessThan(50);
      });
    });
  });

  describe('Password History Validation', () => {
    describe('✅ Success Cases', () => {
      it('should allow new password not in history', async () => {
        const isReused = await isPasswordRecentlyUsed(testUserId, 'NewPassword123!');
        
        expect(isReused).toBe(false);
      });

      it('should detect password reuse correctly', async () => {
        // Add password to history
        const hashedPassword = await bcrypt.hash('UsedPassword123!', 12);
        await db.insert(passwordHistory).values({
          userId: testUserId,
          hashedPassword
        });

        const isReused = await isPasswordRecentlyUsed(testUserId, 'UsedPassword123!');
        
        expect(isReused).toBe(true);
      });
    });

    describe('🔒 History Management', () => {
      it('should limit password history to 5 entries', async () => {
        // Add 6 passwords to history
        for (let i = 1; i <= 6; i++) {
          const hashedPassword = await bcrypt.hash(`Password${i}23!`, 12);
          await db.insert(passwordHistory).values({
            userId: testUserId,
            hashedPassword
          });
        }

        // Check history count
        const history = await db.select()
          .from(passwordHistory)
          .where(eq(passwordHistory.userId, testUserId));

        expect(history.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Suspicious Activity Detection', () => {
    describe('✅ Normal Activity', () => {
      it('should not flag normal reset request', async () => {
        const result = await detectSuspiciousResetActivity('test@example.com');
        
        expect(result.isSuspicious).toBe(false);
        expect(result.riskLevel).toBe('low');
      });
    });

    describe('⚠️ Suspicious Patterns', () => {
      it('should detect multiple rapid reset attempts', async () => {
        // Simulate multiple reset attempts by setting recent reset tokens
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 1);

        for (let i = 0; i < 4; i++) {
          await db.update(users)
            .set({
              resetToken: `token-${i}`,
              resetTokenExpiry: futureDate
            })
            .where(eq(users.id, testUserId));
        }

        const result = await detectSuspiciousResetActivity('test@example.com');
        
        expect(result.isSuspicious).toBe(true);
        expect(result.riskLevel).toBe('high');
        expect(result.reason).toContain('Multiple password reset attempts');
      });
    });
  });

  describe('Enhanced Password Reset Routes', () => {
    describe('POST /api/auth/forgot-password', () => {
      describe('✅ Success Cases', () => {
        it('should handle enhanced forgot password request', async () => {
          const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({
              email: 'test@example.com',
              ipAddress: '192.168.1.1',
              userAgent: 'Test Browser'
            });

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body.data.emailSent).toBe(true);
          expect(response.body.data.securityLevel).toBeDefined();
          
          // Verify enhanced email service was called
          expect(sendPasswordResetEmail).toHaveBeenCalledWith(
            'test@example.com',
            expect.any(String),
            'Test'
          );
        });

        it('should return generic message for non-existent email', async () => {
          const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({
              email: 'nonexistent@example.com',
              ipAddress: '192.168.1.1'
            });

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body.data.emailSent).toBe(false);
          expect(response.body.data.securityLevel).toBe('standard');
          
          // Verify email service was NOT called
          expect(sendPasswordResetEmail).not.toHaveBeenCalled();
        });
      });

      describe('⚠️ Security Cases', () => {
        it('should detect and handle suspicious activity', async () => {
          // Create multiple recent reset attempts
          const futureDate = new Date();
          futureDate.setHours(futureDate.getHours() + 1);

          for (let i = 0; i < 4; i++) {
            await db.update(users)
              .set({
                resetToken: `suspicious-token-${i}`,
                resetTokenExpiry: futureDate
              })
              .where(eq(users.id, testUserId));
          }

          const response = await request(app)
            .post('/api/auth/forgot-password')
            .send({
              email: 'test@example.com',
              ipAddress: '192.168.1.1'
            });

          expect(response.status).toBe(429);
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('Too many reset attempts');
        });
      });
    });

    describe('POST /api/auth/reset-password', () => {
      let resetToken: string;

      beforeEach(async () => {
        // Set up valid reset token
        resetToken = 'test-reset-token-123';
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 1);

        await db.update(users)
          .set({
            resetToken,
            resetTokenExpiry: futureDate
          })
          .where(eq(users.id, testUserId));
      });

      describe('✅ Success Cases', () => {
        it('should reset password with enhanced security validation', async () => {
          const newPassword = 'NewSecurePass123!';
          
          const response = await request(app)
            .post('/api/auth/reset-password')
            .send({
              token: resetToken,
              newPassword,
              ipAddress: '192.168.1.1',
              userAgent: 'Test Browser'
            });

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body.data.passwordStrength).toBeDefined();
          expect(response.body.data.strengthScore).toBeGreaterThan(0);
          expect(response.body.data.securityMetrics).toBeDefined();
          
          // Verify confirmation email was sent
          expect(sendPasswordResetConfirmationEmail).toHaveBeenCalledWith(
            'test@example.com',
            'Test'
          );
        });
      });

      describe('❌ Security Rejections', () => {
        it('should reject weak password', async () => {
          const weakPassword = 'weak';
          
          const response = await request(app)
            .post('/api/auth/reset-password')
            .send({
              token: resetToken,
              newPassword: weakPassword
            });

          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('security requirements');
          expect(response.body.data).toBeInstanceOf(Array);
        });

        it('should reject recently used password', async () => {
          // Add current password to history
          const reusedPassword = 'TestPassword123!';
          const hashedPassword = await bcrypt.hash(reusedPassword, 12);
          await db.insert(passwordHistory).values({
            userId: testUserId,
            hashedPassword
          });

          const response = await request(app)
            .post('/api/auth/reset-password')
            .send({
              token: resetToken,
              newPassword: reusedPassword
            });

          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);
          expect(response.body.data).toContain('recently used');
        });
      });
    });

    describe('POST /api/auth/check-password-strength', () => {
      describe('✅ Strength Checking', () => {
        it('should evaluate password strength without user context', async () => {
          const response = await request(app)
            .post('/api/auth/check-password-strength')
            .send({
              password: 'TestStrength123!'
            });

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body.data.isValid).toBe(true);
          expect(response.body.data.strength).toBeDefined();
          expect(response.body.data.score).toBeGreaterThan(0);
          expect(response.body.data.wasRecentlyUsed).toBe(false);
          expect(response.body.data.requirements).toBeDefined();
        });

        it('should evaluate password strength with user context', async () => {
          // Add password to user's history
          const historicalPassword = 'HistoricalPass123!';
          const hashedPassword = await bcrypt.hash(historicalPassword, 12);
          await db.insert(passwordHistory).values({
            userId: testUserId,
            hashedPassword
          });

          const response = await request(app)
            .post('/api/auth/check-password-strength')
            .send({
              password: historicalPassword,
              userId: testUserId
            });

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body.data.wasRecentlyUsed).toBe(true);
          expect(response.body.data.isValid).toBe(false);
        });
      });
    });

    describe('GET /api/auth/password-security-metrics/:userId', () => {
      describe('✅ Metrics Retrieval', () => {
        it('should return password security metrics', async () => {
          const response = await request(app)
            .get(`/api/auth/password-security-metrics/${testUserId}`);

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body.data.passwordAge).toBeDefined();
          expect(response.body.data.historyCount).toBeDefined();
          expect(typeof response.body.data.passwordAge).toBe('number');
          expect(typeof response.body.data.historyCount).toBe('number');
        });

        it('should reject invalid user ID', async () => {
          const response = await request(app)
            .get('/api/auth/password-security-metrics/invalid');

          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('Invalid user ID');
        });
      });
    });
  });

  describe('Integration Tests', () => {
    describe('🔄 Complete Security Workflow', () => {
      it('should handle complete enhanced password reset workflow', async () => {
        // Step 1: Request password reset with security tracking
        const forgotResponse = await request(app)
          .post('/api/auth/forgot-password')
          .send({
            email: 'test@example.com',
            ipAddress: '192.168.1.100',
            userAgent: 'Integration Test Browser'
          });

        expect(forgotResponse.status).toBe(200);
        expect(forgotResponse.body.data.securityLevel).toBe('low');

        // Get the reset token from database
        const userRecord = await db.select()
          .from(users)
          .where(eq(users.id, testUserId))
          .limit(1);

        const resetToken = userRecord[0].resetToken!;

        // Step 2: Check password strength before reset
        const strengthResponse = await request(app)
          .post('/api/auth/check-password-strength')
          .send({
            password: 'NewWorkflowPass123!',
            userId: testUserId
          });

        expect(strengthResponse.status).toBe(200);
        expect(strengthResponse.body.data.isValid).toBe(true);
        expect(strengthResponse.body.data.wasRecentlyUsed).toBe(false);

        // Step 3: Reset password with enhanced validation
        const resetResponse = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: resetToken,
            newPassword: 'NewWorkflowPass123!',
            ipAddress: '192.168.1.100',
            userAgent: 'Integration Test Browser'
          });

        expect(resetResponse.status).toBe(200);
        expect(resetResponse.body.data.passwordStrength).toBe('strong');
        expect(resetResponse.body.data.securityMetrics.passwordAge).toBe(0);

        // Step 4: Verify password history was updated
        const historyCount = await db.select({ count: db.$count(passwordHistory) })
          .from(passwordHistory)
          .where(eq(passwordHistory.userId, testUserId));

        expect(historyCount[0].count).toBeGreaterThan(0);

        // Step 5: Verify password reuse is now blocked
        const reuseCheckResponse = await request(app)
          .post('/api/auth/check-password-strength')
          .send({
            password: 'NewWorkflowPass123!',
            userId: testUserId
          });

        expect(reuseCheckResponse.body.data.wasRecentlyUsed).toBe(true);
      });
    });

    describe('🧨 Edge Cases', () => {
      it('should handle database errors gracefully', async () => {
        // Mock database failure
        const mockSelect = jest.spyOn(db, 'select').mockImplementationOnce(() => {
          throw new Error('Database connection failed');
        });

        const response = await request(app)
          .post('/api/auth/check-password-strength')
          .send({
            password: 'TestPassword123!'
          });

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        
        // Restore mock
        mockSelect.mockRestore();
      });

      it('should handle email service failures gracefully', async () => {
        // Mock email service failure
        sendPasswordResetEmail.mockRejectedValueOnce(new Error('Email service down'));

        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({
            email: 'test@example.com'
          });

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Failed to send reset email');
      });
    });
  });
}); 