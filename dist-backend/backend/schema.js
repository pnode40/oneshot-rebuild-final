import { pgTable, serial, varchar, timestamp, jsonb, integer, text } from 'drizzle-orm/pg-core';
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
export const profiles = pgTable('profiles', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    fullName: varchar('full_name', { length: 100 }),
    graduationYear: integer('graduation_year'),
    position: varchar('position', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
});
export const timelines = pgTable('timelines', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    phase: varchar('phase', { length: 50 }),
    tasks: jsonb('tasks').default('[]').notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
export const posts = pgTable('posts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    likes: integer('likes').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});
