# OneShot Database Schema Documentation

**Version**: 1.0  
**Created**: May 23, 2025  
**Authority**: OneShot Development Standards  
**Purpose**: Document database structure, relationships, and Drizzle ORM patterns

---

## 🗄️ DATABASE OVERVIEW

### Technology Stack
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with node-postgres
- **Migration**: Drizzle migrations
- **Connection**: Connection pooling via pg Pool

### Schema Organization
```
server/src/db/
├── client.ts           # Database connection and Drizzle setup
├── schema.ts           # Main schema exports
└── schema/
    ├── users.ts        # User authentication and profiles
    ├── athleteProfiles.ts   # Athlete-specific data
    └── mediaItems.ts   # Media file management
```

---

## 👥 USERS SCHEMA

### Table: `users`
```typescript
import { pgTable, serial, text, varchar, timestamp, boolean, pgEnum, index } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['athlete', 'recruiter', 'admin', 'parent']);

export const users = pgTable('users', {
  // Core Identity
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  
  // Status & Verification
  isVerified: boolean('is_verified').default(false).notNull(),
  emailVerificationToken: text('email_verification_token'),
  
  // Role & Permissions
  role: userRoleEnum('role').default('athlete').notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  
  // Profile Information
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  profilePicture: text('profile_picture'),
  bio: text('bio'),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));
```

### Field Specifications

#### Core Identity
- **`id`**: Auto-incrementing primary key
- **`email`**: Unique email for login, indexed for performance
- **`hashedPassword`**: bcrypt hashed password, never plain text

#### Status & Verification
- **`isVerified`**: Email verification status (default: false)
- **`emailVerificationToken`**: Temporary token for email verification

#### Role & Permissions
- **`role`**: User role enum (athlete, recruiter, admin, parent)
- Default role is 'athlete' for new registrations

#### Timestamps
- **`createdAt`**: Account creation timestamp with timezone
- **`updatedAt`**: Last modification timestamp with timezone

#### Profile Information
- **`firstName`**: User's first name (max 100 chars)
- **`lastName`**: User's last name (max 100 chars)
- **`profilePicture`**: URL to profile image
- **`bio`**: User bio/description text

---

## 🏃 ATHLETE PROFILES SCHEMA

### Table: `athlete_profiles`
```typescript
export const sportsEnum = pgEnum('sports', ['football', 'basketball', 'baseball', 'soccer', 'tennis', 'track', 'other']);
export const footballPositionsEnum = pgEnum('football_positions', ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P']);
export const visibilityEnum = pgEnum('visibility', ['public', 'private', 'recruiter_only']);
export const commitmentStatusEnum = pgEnum('commitment_status', ['uncommitted', 'committed', 'signed']);

export const athleteProfiles = pgTable('athlete_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  
  // Athletic Information
  sport: sportsEnum('sport').notNull(),
  position: footballPositionsEnum('position'), // Sport-specific
  graduationYear: integer('graduation_year').notNull(),
  height: varchar('height', { length: 10 }), // e.g., "6'2\""
  weight: integer('weight'), // in pounds
  
  // Academic Information
  gpa: decimal('gpa', { precision: 3, scale: 2 }), // e.g., 3.85
  satScore: integer('sat_score'),
  actScore: integer('act_score'),
  
  // School Information
  highSchool: varchar('high_school', { length: 255 }),
  location: varchar('location', { length: 255 }), // City, State
  
  // Profile Settings
  visibility: visibilityEnum('visibility').default('public').notNull(),
  commitmentStatus: commitmentStatusEnum('commitment_status').default('uncommitted').notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('athlete_profiles_user_id_idx').on(table.userId),
  sportIdx: index('athlete_profiles_sport_idx').on(table.sport),
  graduationYearIdx: index('athlete_profiles_graduation_year_idx').on(table.graduationYear),
}));
```

### Field Specifications

#### Athletic Information
- **`sport`**: Primary sport from enum
- **`position`**: Football-specific positions (extensible for other sports)
- **`graduationYear`**: High school graduation year
- **`height`**: Height in format like "6'2\""
- **`weight`**: Weight in pounds

#### Academic Information
- **`gpa`**: Grade point average (precision: 3, scale: 2)
- **`satScore`**: SAT test score
- **`actScore`**: ACT test score

#### School Information
- **`highSchool`**: High school name
- **`location`**: City, State format

#### Profile Settings
- **`visibility`**: Who can see the profile (public/private/recruiter_only)
- **`commitmentStatus`**: Recruitment status

---

## 📱 MEDIA ITEMS SCHEMA

### Table: `media_items`
```typescript
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video_link', 'pdf', 'highlight_video', 'game_film', 'training_clip']);

export const mediaItems = pgTable('media_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  
  // Media Classification
  mediaType: mediaTypeEnum('media_type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  
  // File Information
  fileName: varchar('file_name', { length: 255 }),
  filePath: text('file_path'),
  fileSize: integer('file_size'), // in bytes
  mimeType: varchar('mime_type', { length: 100 }),
  
  // Video Specific
  url: text('url'), // For video links (YouTube, Vimeo, etc.)
  thumbnailUrl: text('thumbnail_url'),
  
  // Image Specific
  imageUrl: text('image_url'),
  altText: varchar('alt_text', { length: 255 }),
  
  // Metadata
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
  lastModified: timestamp('last_modified', { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => ({
  userIdIdx: index('media_items_user_id_idx').on(table.userId),
  mediaTypeIdx: index('media_items_media_type_idx').on(table.mediaType),
  uploadedAtIdx: index('media_items_uploaded_at_idx').on(table.uploadedAt),
}));
```

### Field Specifications

#### Media Classification
- **`mediaType`**: Type of media (image, video_link, pdf, etc.)
- **`title`**: User-provided title for the media
- **`description`**: Optional description

#### File Information
- **`fileName`**: Original uploaded file name
- **`filePath`**: Server path to stored file
- **`fileSize`**: File size in bytes
- **`mimeType`**: MIME type of the file

#### Video Specific
- **`url`**: External video URL (YouTube, Vimeo)
- **`thumbnailUrl`**: Video thumbnail image URL

#### Image Specific
- **`imageUrl`**: URL to stored image
- **`altText`**: Alternative text for accessibility

#### Metadata
- **`uploadedAt`**: When media was first uploaded
- **`lastModified`**: Last update timestamp
- **`isActive`**: Soft delete flag

---

## 🔗 RELATIONSHIPS

### User → Athlete Profile (One-to-One)
```typescript
// One user can have one athlete profile
const userRelations = relations(users, ({ one }) => ({
  athleteProfile: one(athleteProfiles, {
    fields: [users.id],
    references: [athleteProfiles.userId],
  }),
}));
```

### User → Media Items (One-to-Many)
```typescript
// One user can have many media items
const userRelations = relations(users, ({ many }) => ({
  mediaItems: many(mediaItems),
}));

const mediaItemRelations = relations(mediaItems, ({ one }) => ({
  user: one(users, {
    fields: [mediaItems.userId],
    references: [users.id],
  }),
}));
```

### Foreign Key Constraints
- All foreign keys use `references()` with cascade operations
- Referential integrity enforced at database level
- Deletion policies defined per relationship

---

## 🗂️ INDEXES

### Performance Indexes
```typescript
// Email lookup (login)
emailIdx: index('email_idx').on(table.email)

// User data queries
userIdIdx: index('athlete_profiles_user_id_idx').on(table.userId)
userIdIdx: index('media_items_user_id_idx').on(table.userId)

// Search and filtering
sportIdx: index('athlete_profiles_sport_idx').on(table.sport)
graduationYearIdx: index('athlete_profiles_graduation_year_idx').on(table.graduationYear)
mediaTypeIdx: index('media_items_media_type_idx').on(table.mediaType)

// Temporal queries
uploadedAtIdx: index('media_items_uploaded_at_idx').on(table.uploadedAt)
```

### Query Optimization
- **Email Index**: Fast login lookups
- **User ID Indexes**: Efficient user data retrieval
- **Sport/Year Indexes**: Recruiter search functionality
- **Upload Date Index**: Chronological media queries

---

## 🔄 MIGRATION PATTERNS

### Schema Evolution
```typescript
// Migration example: Adding new column
export async function up(db: Database) {
  await db.schema.alterTable('users')
    .addColumn('phoneNumber', 'varchar(20)')
    .execute();
}

export async function down(db: Database) {
  await db.schema.alterTable('users')
    .dropColumn('phoneNumber')
    .execute();
}
```

### Migration Best Practices
1. **Always provide rollback** - Every migration has `up` and `down`
2. **Test on staging** - Verify migrations before production
3. **Backup first** - Database backup before schema changes
4. **Non-breaking changes** - Additive changes when possible

---

## 📊 DATA TYPES & CONVENTIONS

### Naming Conventions
- **Tables**: snake_case (users, athlete_profiles, media_items)
- **Columns**: snake_case (user_id, created_at, graduation_year)
- **Enums**: snake_case with descriptive prefix (user_role, media_type)
- **Indexes**: descriptive with table prefix (email_idx, media_items_user_id_idx)

### Data Type Guidelines
```typescript
// Identity
serial('id').primaryKey()                    // Auto-increment primary keys
integer('user_id').references(() => users.id) // Foreign keys

// Text
text('description')                          // Long text (unlimited)
varchar('title', { length: 255 })           // Short text with limit

// Numbers
integer('weight')                            // Whole numbers
decimal('gpa', { precision: 3, scale: 2 })  // Precise decimals

// Dates
timestamp('created_at', { withTimezone: true }).defaultNow() // Timestamps

// Booleans
boolean('is_active').default(true).notNull() // Boolean flags

// Enums
pgEnum('role', ['athlete', 'admin'])         // Constrained values
```

---

## 🔧 DRIZZLE ORM PATTERNS

### Database Connection
```typescript
// server/src/db/client.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool, { schema });
```

### Query Patterns
```typescript
// Basic CRUD operations
import { eq, and, or } from 'drizzle-orm';

// Create
const newUser = await db.insert(users).values({
  email: 'athlete@example.com',
  hashedPassword: hashedPassword,
  firstName: 'John',
  lastName: 'Doe',
  role: 'athlete'
}).returning();

// Read
const user = await db.select()
  .from(users)
  .where(eq(users.email, 'athlete@example.com'))
  .limit(1);

// Update
await db.update(users)
  .set({ firstName: 'Jane' })
  .where(eq(users.id, userId));

// Delete
await db.delete(mediaItems)
  .where(eq(mediaItems.id, mediaItemId));
```

### Join Queries
```typescript
// User with athlete profile
const athleteData = await db.select()
  .from(users)
  .leftJoin(athleteProfiles, eq(users.id, athleteProfiles.userId))
  .where(eq(users.id, userId));

// User with media items
const userMedia = await db.select()
  .from(users)
  .leftJoin(mediaItems, eq(users.id, mediaItems.userId))
  .where(and(
    eq(users.id, userId),
    eq(mediaItems.isActive, true)
  ));
```

---

## 🛡️ SECURITY CONSIDERATIONS

### Data Protection
- **Password Hashing**: Never store plain text passwords
- **SQL Injection**: Drizzle ORM provides parameterized queries
- **Input Validation**: Zod schemas validate before database operations
- **Access Control**: Foreign key constraints enforce data ownership

### Sensitive Data
```typescript
// Never select passwords in general queries
const safeUserData = await db.select({
  id: users.id,
  email: users.email,
  firstName: users.firstName,
  lastName: users.lastName,
  role: users.role,
  // Exclude: hashedPassword, emailVerificationToken
}).from(users);
```

---

## 🧪 TESTING DATABASE OPERATIONS

### Test Database Setup
```typescript
// Test helper for database operations
export const setupTestDb = async () => {
  // Clear all tables
  await db.delete(mediaItems);
  await db.delete(athleteProfiles);
  await db.delete(users);
};

export const createTestUser = async (userData = {}) => {
  const defaultData = {
    email: 'test@example.com',
    hashedPassword: 'hashedPassword123',
    firstName: 'Test',
    lastName: 'User',
    role: 'athlete' as const,
  };
  
  const [user] = await db.insert(users)
    .values({ ...defaultData, ...userData })
    .returning();
    
  return user;
};
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Query Optimization
- **Use indexes** for frequently queried columns
- **Limit results** with `.limit()` for large datasets
- **Select specific columns** instead of `SELECT *`
- **Use joins** instead of separate queries

### Connection Management
- **Connection pooling** via pg Pool
- **Environment variables** for connection strings
- **Connection limits** to prevent resource exhaustion

---

## 📚 REFERENCE FILES

### Implementation Files
- `server/src/db/client.ts` - Database connection setup
- `server/src/db/schema.ts` - Main schema exports
- `server/src/db/schema/users.ts` - User table definition
- `server/src/db/schema/athleteProfiles.ts` - Athlete profile schema
- `server/src/db/schema/mediaItems.ts` - Media management schema

### Related Documentation
- `docs/shared/auth-policy.md` - Authentication using user table
- `docs/shared/validation-standards.md` - Input validation for database operations
- `.cursor/rules/2-domain/db/drizzle-patterns.mdc` - Development standards

---

**Last Updated**: May 23, 2025  
**Next Review**: After database schema changes  
**Status**: ✅ ACTIVE - Defines all OneShot database structure and patterns