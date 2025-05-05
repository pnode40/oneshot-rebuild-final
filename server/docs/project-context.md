# OneShot Recruiting Platform - Project Context

## Overview
OneShot is a sports recruiting platform connecting athletes, recruiters, parents, and administrators.

## Database Schema
- **Users**: Authentication system with role-based access (athlete, recruiter, admin, parent)
- **Profiles**: Athletic profiles with stats and demographic information

## Implementation Progress
- [x] Created users table schema with authentication fields
- [x] Implemented user roles enum
- [x] Set up database connection to Neon PostgreSQL
- [x] Created profiles table for athletic information

## Architecture Decisions
- Using Drizzle ORM for database interactions
- PostgreSQL database hosted on Neon
- Express.js for API endpoints
- Role-based authentication system

## Next Steps
- Implement authentication endpoints (register, login)
- Create middleware for role-based access control
- Build API for profile management

## Known Issues
- None currently

*Last Updated: May 25, 2024* 