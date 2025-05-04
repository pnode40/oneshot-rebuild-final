import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { users, userRoleEnum } from './schema/users';

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  highSchool: varchar('high_school', { length: 256 }).notNull(),
  position: varchar('position', { length: 128 }).notNull(),
  gradYear: varchar('grad_year', { length: 8 }),
  cityState: varchar('city_state', { length: 128 }),
  heightFt: varchar('height_ft', { length: 4 }),
  heightIn: varchar('height_in', { length: 4 }),
  weight: varchar('weight', { length: 8 }),
  fortyYardDash: varchar('forty_yard_dash', { length: 8 }),
  benchPress: varchar('bench_press', { length: 8 }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export { users, userRoleEnum };
