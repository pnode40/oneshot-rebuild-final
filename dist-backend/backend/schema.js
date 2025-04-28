import { pgTable, serial, varchar, timestamp, jsonb, integer, text, numeric } from 'drizzle-orm/pg-core';
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
    contactEmail: varchar('contact_email', { length: 255 }),
    contactPhone: varchar('contact_phone', { length: 20 }),
    twitterHandle: varchar('twitter_handle', { length: 50 }),
    coachName: varchar('coach_name', { length: 100 }),
    coachEmail: varchar('coach_email', { length: 255 }),
    coachPhone: varchar('coach_phone', { length: 20 }),
    profilePictures: jsonb('profile_pictures').$type(),
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
export const metrics = pgTable('metrics', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    heightFeet: integer('height_feet'),
    heightInches: integer('height_inches'),
    weight: integer('weight'),
    fortyYardDash: numeric('forty_yard_dash'),
    shuttleRun: numeric('shuttle_run'),
    verticalJump: numeric('vertical_jump'),
    // Position-specific metrics (optional fields)
    passingYards: integer('passing_yards'),
    rushingYards: integer('rushing_yards'),
    receivingYards: integer('receiving_yards'),
    tackles: integer('tackles'),
    sacks: integer('sacks'),
});
