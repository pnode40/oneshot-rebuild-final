import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

// 1. Define an Enum for user roles (optional but recommended for future flexibility)
export const userRoleEnum = pgEnum('user_role', ['athlete', 'recruiter', 'admin', 'parent']);

// 2. Define the users table
export const users = pgTable('users', {
  // --- Core Identity ---
  id: serial('id').primaryKey(), // Auto-incrementing integer primary key
  email: text('email').notNull().unique(), // User's email, must be unique for login
  hashedPassword: text('hashed_password').notNull(), // Store the bcrypt hashed password

  // --- Status & Verification ---
  isVerified: boolean('is_verified').default(false).notNull(), // Tracks if email is verified
  emailVerificationToken: text('email_verification_token'), // Token sent for email verification (nullable)

  // --- Role & Permissions ---
  role: userRoleEnum('role').default('athlete').notNull(), // User role using the defined enum

  // --- Timestamps & Metadata ---
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), // Timestamp of creation
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(), // Timestamp of last update

  // --- Profile Information ---
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  profilePicture: text('profile_picture'), // URL to profile picture
  bio: text('bio'), // User bio/description

// Add an index for faster email lookups (common for login/search)
}, (table) => {
  return {
    emailIdx: index('email_idx').on(table.email),
  };
}); 