# OneShot Development Milestones

## Database & Schema
- [x] Set up PostgreSQL database connection (April 30, 2025)
- [x] Create users table with authentication fields (April 30, 2025)
- [x] Implement role-based access control (April 30, 2025)
- [x] Set up athlete profiles table (Pre-existing)
- [x] Create relationships between users and profiles (May 5, 2025)
- [x] Extend profiles table with additional fields: (May 7, 2025)
  - [x] jersey_number, athlete_role, custom_url_slug, high_school_name, etc.
  - [x] NCAA ID and eligibility fields
  - [x] Visibility flags (height, weight, GPA, transcript, NCAA info)
  - [x] Media URL fields (profile photo, transcript, highlight video)
- [x] Add uniqueness constraint for custom_url_slug (May 7, 2025)
- [x] Create necessary indices for performance (May 7, 2025)
- [ ] Implement messaging/communication tables (Post-MVP)
- [ ] Set up content storage for video highlights (Post-MVP)

## Authentication & Authorization
- [x] Implement user registration endpoint (May 1, 2025)
- [x] Create login/authentication system (May 1, 2025)
- [x] Implement role-based middleware (May 1, 2025)
- [x] Create JWT token management (May 1, 2025)
- [x] Implement frontend authentication with AuthContext (May 5, 2025)
- [x] Create protected routes with react-router-dom (May 5, 2025)
- [ ] Build email verification flow (Post-MVP)
- [ ] Set up password reset functionality (Post-MVP)

## API Development
- [x] Build CRUD operations for user profiles (May 5, 2025)
- [ ] Create enhanced profile endpoints:
  - [ ] POST /api/profile (Create profile with all new fields)
  - [ ] PUT /api/profile (Update profile with all new fields)
  - [ ] GET /api/profile (Internal profile view)
  - [ ] GET /api/profile/public/:slug (Public profile with visibility rules)
- [ ] Implement slug validation on save
- [x] Create file upload endpoints (profile photo, transcript) (May 7, 2025)
- [ ] Implement athlete search and filtering (Post-MVP)
- [ ] Create recruiter dashboard endpoints (Post-MVP)
- [ ] Build admin management tools (Post-MVP)
- [ ] Implement analytics API (Post-MVP)

## Media Storage & Processing
- [x] Configure file storage for profile photos and transcripts (May 7, 2025)
- [x] Create upload utilities for both file types (May 7, 2025)
- [x] Implement basic file validation (type, size) (May 7, 2025)
- [ ] Basic server-side image processing (STRETCH)
- [ ] OG image generation (Post-MVP)
- [ ] Advanced media optimization (Post-MVP)

## Frontend Development
- [x] Set up React application structure (May 3, 2025)
- [x] Create authentication UI (login/register) (May 4, 2025)
- [x] Build athlete profile creation wizard (May 5, 2025)
- [ ] Enhance profile form with new fields:
  - [ ] Basic information (jersey number, high school, grad year, etc.)
  - [ ] Conditional fields for Transfer Portal role
  - [ ] Visibility toggle controls
  - [ ] File upload components (profile photo, transcript)
  - [ ] Video link input(s)
- [ ] Create public profile UI:
  - [ ] Implement slug-based routing
  - [ ] Build mobile-first layout
  - [ ] Create above-the-fold section
  - [ ] Add below-the-fold section with conditional content
  - [ ] YouTube embedding and Hudl linking
- [ ] Real-time slug availability check (STRETCH)
- [ ] First name + last initial display (STRETCH)
- [ ] Basic vCard download button (STRETCH)
- [ ] Multiple photo upload support (STRETCH)
- [ ] Implement recruiter search interface (Post-MVP)
- [ ] Create dashboards for different user roles (Post-MVP)
- [ ] Design and implement messaging UI (Post-MVP)

## Development Infrastructure
- [x] Fix migration system and conflicts (May 5, 2025)
- [x] Create migration utility scripts (May 5, 2025)
- [x] Standardize environment configurations (May 5, 2025)
- [x] Resolve code quality issues (May 5, 2025)
- [ ] Install additional dependencies (react-icons, etc.)
- [ ] Confirm ts-node-dev setup is working

## Testing & Quality Assurance
- [ ] Test end-to-end profile creation and viewing
- [ ] Verify visibility controls work correctly
- [ ] Validate file uploads and display
- [ ] Test conditional rendering based on athlete role
- [ ] Fix any identified issues

## Deployment & DevOps
- [ ] Set up CI/CD pipeline (Post-MVP)
- [ ] Configure production environment (Post-MVP)
- [ ] Implement monitoring and logging (Post-MVP)
- [ ] Set up backup and recovery systems (Post-MVP)
- [ ] Conduct security audit (Post-MVP)

## Business & Legal
- [ ] Finalize terms of service (Post-MVP)
- [ ] Implement privacy policy (Post-MVP)
- [ ] Set up data handling in compliance with regulations (Post-MVP)
- [ ] Create user agreements for different roles (Post-MVP)

*Last Updated: May 7, 2025* 