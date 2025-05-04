# OneShot - Core Knowledge & System Overview

## 📁 Codebase Index
- `/server/src/routes/auth.ts` — Register/Login endpoints 
- `/server/src/middleware/auth.ts` — JWT + RBAC middleware
- `/server/claude/` — AI developer workspace

## Project Definition
OneShot is a sports recruiting platform that connects high school athletes with college recruiters, while providing tools for parents and administrators to manage the recruiting process.

## System Architecture

### Frontend
- **Technology**: React.js with TypeScript
- **UI Framework**: [Pending decision]
- **State Management**: [Pending decision]

### Backend
- **API**: Express.js REST API
- **Authentication**: JWT-based auth with role-based access control
- **Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM
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

## Business Logic

### User Flows
- Athlete registration and profile creation
- Recruiter search and contact functionality
- Administrative oversight and moderation
- Parent connection and monitoring

### Key Features (Planned)
- Athlete profile showcase
- Recruiter search and filtering
- Messaging system
- Video highlights
- Scheduling tools
- Analytics dashboard

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

*Last Updated: May 26, 2024* 