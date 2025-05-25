import { eq } from 'drizzle-orm';
import { testDb } from '../setup';
import { users } from '../../src/db/schema';
import bcrypt from 'bcrypt';

export interface TestUserOptions {
  email?: string;
  password?: string;
  role?: 'athlete' | 'recruiter' | 'admin' | 'parent';
  isVerified?: boolean;
  firstName?: string;
  lastName?: string;
}

export const createTestUser = async (options: TestUserOptions = {}) => {
  const {
    email = `test-${Date.now()}@example.com`,
    password = 'TestPassword123!',
    role = 'athlete',
    isVerified = true,
    firstName = 'Test',
    lastName = 'User'
  } = options;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user in database
  const result = await testDb.insert(users).values({
    email,
    hashedPassword,
    role,
    isVerified,
    firstName,
    lastName,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  const user = result[0];

  // Return user with plain password for testing
  return {
    ...user,
    plainPassword: password
  };
};

export const createTestAdmin = async () => {
  return createTestUser({
    role: 'admin',
    email: `admin-${Date.now()}@example.com`,
    firstName: 'Admin',
    lastName: 'User'
  });
};

export const createUnverifiedUser = async () => {
  return createTestUser({
    isVerified: false,
    email: `unverified-${Date.now()}@example.com`
  });
};

export const findTestUserByEmail = async (email: string) => {
  const result = await testDb.select().from(users).where(eq(users.email, email));
  return result[0] || null;
};

export const deleteTestUser = async (userId: number) => {
  await testDb.delete(users).where(eq(users.id, userId));
}; 