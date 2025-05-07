# OneShot - Core Knowledge & System Overview

## 📁 Codebase Index
- `/server/src/routes/auth.ts` — Register/Login endpoints 
- `/server/src/middleware/auth.ts` — JWT + RBAC middleware
- `/client/src/context/AuthContext.tsx` — Frontend authentication state
- `/client/src/components/CreateProfileForm.tsx` — Athlete profile creation form
- `/server/claude/` — AI developer workspace

## Project Definition
OneShot is a sports recruiting platform that connects high school athletes with college recruiters, while providing tools for parents and administrators to manage the recruiting process.

## May 21st MVP Scope
The May 21st, 2025 deliverable focuses on implementing a functional athlete profile system with:

1. Enhanced profile data:
   - Basic info (jersey number, high school, graduation year)
   - Athletic info (positions, height, weight, GPA)
   - Media (profile photo, transcript, highlight video)
   - Transfer Portal specific fields (NCAA ID, eligibility)
   - Custom URL slug for public profiles

2. Field-level visibility controls:
   - Athletes can control what information is visible publicly
   - Server-side enforcement of visibility settings

3. Public profile view:
   - Mobile-first, recruiter-scannable layout
   - Slug-based URL access
   - Above-the-fold key information
   - Media embedding (YouTube/Hudl integration)

4. Internal profile editing:
   - Comprehensive form with all fields
   - File uploads (profile photo, transcript)
   - Visibility toggle controls

## System Architecture

### Frontend
- **Technology**: React.js with TypeScript
- **UI Framework**: Tailwind CSS (mobile-first)
- **State Management**: React Context API (AuthContext)
- **Routing**: react-router-dom with protected routes
- **Form Validation**: Zod schema validation

### Backend
- **API**: Express.js REST API
- **Authentication**: JWT-based auth with role-based access control
- **Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM
- **Media Storage**: [Pending implementation]
- **Cloud Infrastructure**: [Pending decision]

## Database Schema

### Users
- Authentication system with role-based access
- Roles: athlete, recruiter, admin, parent
- Core fields: email, hashed_password, role, verification status
- Profile fields: first/last name, profile picture, bio

### Profiles (Athletes)
- Athletic information and statistics
- High school, position, graduation year
- Physical stats: height, weight, 40-yard dash, bench press
- Location data: city/state
- Foreign key relationship to users table
- **New Extensions**:
  - Jersey number
  - Athlete role (High School, Transfer Portal)
  - Custom URL slug
  - Media URLs (profile photo, transcript, highlight video)
  - NCAA ID and eligibility (for Transfer Portal)
  - Visibility flags for various fields

## Authentication System

### Registration Flow
- POST `/api/auth/register` accepts user details including email, password, name, role
- Passwords are hashed using bcrypt before storage
- Email verification token is generated (for future verification flow)
- JWT token is returned upon successful registration

### Login Flow
- POST `/api/auth/login` accepts email and password
- Verifies credentials against database
- Returns JWT token containing userId, email, and role

### Authorization
- JWT tokens are verified using middleware
- Role-based access control restricts routes based on user role
- Custom middleware implements route protection
- Frontend uses AuthContext provider for global auth state
- Protected routes implemented with react-router-dom

## Profile API (Planned)

### Profile Management
- POST `/api/profile` - Create new profile with all fields
- PUT `/api/profile` - Update existing profile
- GET `/api/profile` - Fetch private profile data for editing
- GET `/api/profile/public/:slug` - Fetch public profile with visibility rules applied

### Media Handling
- File upload endpoints for profile photos and transcripts
- Media storage and URL generation
- Basic file validation and processing

## Business Logic

### User Flows
- Athlete registration and profile creation
- Recruiter search and contact functionality
- Administrative oversight and moderation
- Parent connection and monitoring

### Key Features (Implemented)
- Athlete profile creation with validation
- Secure authentication and protected routes
- User-specific data scoping

### Key Features (May 21st MVP)
- Enhanced profile with additional fields
- Field-level visibility controls
- Public profile view via custom URL
- Media uploads and embedding
- Mobile-first, recruiter-friendly layout

### Key Features (Post-MVP)
- Recruiter search and filtering
- Messaging system
- Video highlights
- Scheduling tools
- Analytics dashboard

## Development Infrastructure
- Migration utility scripts for database management
- Environment configuration standardization
- Code quality standards and linting

## Integration Points
- [Future] Video hosting services
- [Future] Email delivery service
- [Future] Payment processing

## Security Considerations
- PII protection for minors
- FERPA/educational data compliance
- Secure communication channels
- Role-based access control
- Password hashing with bcrypt
- JWT token-based authentication
- Field-level visibility enforcement

*Last Updated: May 6, 2025* 