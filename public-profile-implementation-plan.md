# Public Profile Implementation Plan

## Phase 1: Setup & Core Infrastructure

### Task 1: Project Structure Setup
- [ ] Create route handlers for slug-based profiles (`/u/:slug`)
- [ ] Set up API endpoint for slug availability checking
- [ ] Define component folder structure for public profile
- [ ] Create visibility toggle utility functions
- [ ] Implement basic authentication middleware for profile access

### Task 2: Data Schema Finalization
- [ ] Update athlete profile schema with visibility flags
- [ ] Create database query for public profile data
- [ ] Add slug field with uniqueness constraint
- [ ] Implement server-side visibility filtering
- [ ] Set up data validation for minimum required fields

## Phase 2: Public Profile UI Components

### Task 3: Mobile-First Profile Header
- [ ] Implement banner-style profile photo component
- [ ] Create name, school, and position header section
- [ ] Build responsive metrics display (height, weight, GPA)
- [ ] Add verification badge components
- [ ] Implement responsive layout for above-the-fold content

### Task 4: Video Integration
- [ ] Create video player component that supports YouTube embeds
- [ ] Implement Hudl thumbnail + redirect functionality
- [ ] Add helper modal explaining playback behavior
- [ ] Set up lazy loading for optimal performance
- [ ] Ensure responsive video container maintains aspect ratio

### Task 5: Coach Information Section
- [ ] Build coach contact information card
- [ ] Implement verification status indicators
- [ ] Add protection against automated scraping
- [ ] Create coach verification flow (SMS)
- [ ] Set up visibility toggle for coach information

## Phase 3: Profile Editor & Preview

### Task 6: Internal Preview Component
- [ ] Create real-time profile preview
- [ ] Implement toggle switches for field visibility
- [ ] Build slug selector with availability checking
- [ ] Add validation for required fields
- [ ] Implement save/publish workflow

### Task 7: Slug Management
- [ ] Create slug generation utility from name
- [ ] Implement real-time slug availability checker
- [ ] Add slug reservation system
- [ ] Build slug editing UI with validation
- [ ] Set up redirect system for changed slugs

## Phase 4: Social & Sharing Features

### Task 8: OG Image Generation
- [ ] Set up image processing pipeline for action photos
- [ ] Create OG image template with key metrics
- [ ] Implement dynamic OG image generation
- [ ] Add proper meta tags for social platforms
- [ ] Test social sharing across platforms

### Task 9: QR & vCard Integration
- [ ] Create QR code generation for profile links
- [ ] Build vCard generation from profile data
- [ ] Implement special QR scan view
- [ ] Add downloadable vCard functionality
- [ ] Test QR codes on various devices

## Phase 5: Testing & Optimization

### Task 10: Performance Optimization
- [ ] Implement image lazy loading and optimization
- [ ] Set up component-level code splitting
- [ ] Add caching for public profiles
- [ ] Optimize database queries
- [ ] Perform lighthouse audits and fix issues

### Task 11: Cross-Device Testing
- [ ] Test on various mobile devices
- [ ] Verify desktop experience
- [ ] Test on slow connections
- [ ] Ensure accessibility compliance
- [ ] Fix any responsive layout issues

## Phase 6: Launch Preparation

### Task 12: Final Review & Documentation
- [ ] Complete user documentation
- [ ] Create admin guide for profile management
- [ ] Document API endpoints
- [ ] Prepare launch checklist
- [ ] Final stakeholder review

## Development Approach

### Frontend Technology Stack
- React for component structure
- Tailwind CSS for styling
- React Router for slug-based routing
- Context API for state management

### Backend Requirements
- Express.js API endpoints
- Drizzle ORM for database queries
- Zod for validation
- Multer for image handling
- JWT for authentication

### Testing Strategy
- Unit tests for utility functions
- Component tests for UI elements
- Integration tests for form submissions
- End-to-end tests for core user flows
- Accessibility testing

## Timeline Estimates
- Phase 1: 3-4 days
- Phase 2: 5-7 days
- Phase 3: 4-5 days
- Phase 4: 3-4 days
- Phase 5: 3-4 days
- Phase 6: 1-2 days

Total estimated timeline: 19-26 days 