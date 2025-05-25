import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  index
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { relations } from 'drizzle-orm';

/**
 * Password history table for tracking user's previous passwords
 * Prevents users from reusing recent passwords for enhanced security
 */
export const passwordHistory = pgTable('password_history', {
  // Primary key
  id: serial('id').primaryKey(),
  
  // Foreign key to users table
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Hashed password (bcrypt)
  hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
  
  // Timestamp when password was used
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    // Index for efficient querying by user
    userIdIdx: index('password_history_user_id_idx').on(table.userId),
    // Index for timestamp-based queries (cleanup, recent passwords)
    createdAtIdx: index('password_history_created_at_idx').on(table.createdAt),
    // Composite index for user password lookups
    userIdCreatedAtIdx: index('password_history_user_created_idx').on(table.userId, table.createdAt),
  };
});

export const passwordHistoryRelations = relations(passwordHistory, ({ one }) => ({
  user: one(users, {
    fields: [passwordHistory.userId],
    references: [users.id],
  })
}));

export type PasswordHistory = typeof passwordHistory.$inferSelect;
export type NewPasswordHistory = typeof passwordHistory.$inferInsert; 