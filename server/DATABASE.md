# OneShot Database Documentation

## Database Schema

The OneShot platform uses a PostgreSQL database with Drizzle ORM for schema definition and migrations. The main database tables are:

### Users Table

Stores user account information:
- `id`: Serial integer primary key
- `email`: Unique email address for login
- `hashedPassword`: Bcrypt hashed password
- `isVerified`: Boolean flag for email verification
- `emailVerificationToken`: Token for email verification
- `role`: User role (athlete, recruiter, admin, parent)
- `createdAt`, `updatedAt`: Timestamps
- Profile fields: `firstName`, `lastName`, `profilePicture`, `bio`

### Profiles Table

Stores athlete profile information:
- `id`: UUID primary key
- `userId`: Integer foreign key to users.id
- Required profile fields: `fullName`, `position`, `gradYear`, `highSchool`, `location`, `height`, `weight`
- Optional fields: `gpa`, `transcriptPdfUrl`, `videoUrls` (array), `bio`
- Profile settings: `customUrlSlug` (unique), `public` flag, `completenessScore`
- `createdAt`: Timestamp for creation date

## Database Migration Process

The project uses Drizzle ORM's migration system to manage database schema changes. The migration system follows a standardized approach:

### Migration Commands

- `npm run migrate:generate` - Generate new migrations from schema changes
- `npm run migrate` - Apply pending migrations to the database
- `npm run migrate:reset` - Reset migration state (use with caution)
- `npm run migrate:drizzle` - Direct access to drizzle-kit generate

### Migration Workflow

1. **Make Schema Changes**: Update the schema definitions in `src/db/schema.ts`
2. **Generate Migrations**: Run `npm run migrate:generate` to create migration files
3. **Review Migrations**: Check the generated SQL in the migrations directory
4. **Apply Migrations**: Run `npm run migrate` to apply migrations to the database

### Troubleshooting

If you encounter migration issues:

1. **Reset Migration State**: If migrations are in an inconsistent state, use `npm run migrate:reset` to start fresh
2. **Manual Changes**: For complex migrations, you can edit the generated SQL files before applying them

## Database Schema Development Guidelines

When making changes to the database schema:

1. **Add Foreign Keys**: Always define proper relationships between tables
2. **Use Appropriate Types**: Choose field types that match the data requirements
3. **Add Indexes**: Add indexes for fields used in frequent queries
4. **Documentation**: Update this document when making significant schema changes 