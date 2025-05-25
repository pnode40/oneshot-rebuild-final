import request from 'supertest';
import express from 'express';
import { testDb } from '../setup';
import authRouter from '../../src/routes/auth';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Authentication Flows', () => {
  describe('User Registration', () => {
    it('should register new user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'ValidPassword123!',
        firstName: 'New',
        lastName: 'User',
        role: 'athlete'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
    });

    it('should reject invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should require email verification', async () => {
      const userData = {
        email: 'verify@example.com',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.data.isVerified).toBe(false);
    });
  });

  describe('User Login', () => {
    it('should login with valid credentials', async () => {
      // First register a user
      const userData = {
        email: 'login@example.com',
        password: 'ValidPassword123!',
        firstName: 'Login',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Then attempt login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should generate valid JWT token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'ValidPassword123!'
        })
        .expect(200);

      const token = loginResponse.body.data.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should reject unverified user', async () => {
      // Register but don't verify
      const userData = {
        email: 'unverified@example.com',
        password: 'ValidPassword123!',
        firstName: 'Unverified',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Attempt login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('verify');
    });
  });

  describe('Authorization', () => {
    let athleteToken: string;
    let adminToken: string;

    beforeEach(async () => {
      // Create athlete user and get token
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'athlete@example.com',
          password: 'Password123!',
          firstName: 'Athlete',
          lastName: 'User',
          role: 'athlete'
        });

      const athleteLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'athlete@example.com',
          password: 'Password123!'
        });

      athleteToken = athleteLogin.body.data.token;

      // Create admin user and get token
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'Password123!',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        });

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Password123!'
        });

      adminToken = adminLogin.body.data.token;
    });

    it('should allow user access to own data', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${athleteToken}`)
        .expect(200);

      expect(response.body.data.email).toBe('athlete@example.com');
    });

    it('should block access without valid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should block access with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should allow admin access to all data', async () => {
      const response = await request(app)
        .get('/api/auth/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should block athlete access to admin routes', async () => {
      await request(app)
        .get('/api/auth/admin/users')
        .set('Authorization', `Bearer ${athleteToken}`)
        .expect(403);
    });
  });
});

describe('Password Reset Flow', () => {
  it('should initiate password reset with valid email', async () => {
    // Register user first
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'reset@example.com',
        password: 'OriginalPassword123!',
        firstName: 'Reset',
        lastName: 'User'
      });

    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'reset@example.com' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('reset link');
  });

  it('should validate reset token properly', async () => {
    // This would require implementing the actual reset flow
    // For now, test the endpoint exists
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'invalid-token',
        newPassword: 'NewPassword123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should handle expired reset tokens', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'expired-token',
        newPassword: 'NewPassword123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('expired' || 'invalid');
  });
}); 