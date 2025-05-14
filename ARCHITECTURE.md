# OneShot Architecture

## Overview

OneShot is a mobile-first, athlete-driven recruiting platform built using a monorepo structure with a React frontend and Express.js backend. This document outlines the overall architecture, component relationships, and development standards.

## Project Structure

```
oneshot/
├── client/               # Frontend React application
│   ├── src/              # React source code
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context providers
│   │   ├── services/     # API client and services
│   │   └── ...
│   ├── public/           # Static assets
│   └── ...               # Configuration files
├── server/               # Backend Express application
│   ├── src/              # Server source code
│   │   ├── db/           # Database access layer
│   │   │   ├── schema/   # Drizzle schema definitions
│   │   │   └── ...       # Migration utilities
│   │   ├── routes/       # API endpoint definitions
│   │   ├── middleware/   # Express middleware
│   │   ├── services/     # Business logic
│   │   ├── validators/   # Input validation
│   │   ├── utils/        # Shared utilities
│   │   └── index.ts      # Application entry point
│   ├── migrations/       # SQL migration files
│   └── ...               # Configuration files
└── package.json          # Root package.json for top-level scripts
```

## Technology Stack

### Frontend
- React with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- React Router for navigation

### Backend
- Express.js with TypeScript
- Drizzle ORM for database access
- PostgreSQL as the database
- JWT for authentication
- Zod for validation

### Infrastructure
- File uploads handled by Multer
- Local development environment

## Data Flow

1. Client components make API requests through service layer
2. Express routes receive requests and apply middleware
3. Validators ensure data integrity
4. Service layer implements business logic
5. Database layer handles data persistence with Drizzle ORM
6. Responses flow back through the same layers

## Development Workflow

1. Backend changes:
   - Update schema definitions if needed
   - Create migrations for schema changes
   - Implement API endpoints and services
   - Test with manual API tests

2. Frontend changes:
   - Implement UI components
   - Connect to API services
   - Test on mobile and desktop viewports

## Migration System

OneShot uses a custom migration system to address issues with Drizzle's standard migration system. The primary migration commands are:

- `npm run migrate:direct`: Runs custom migration system
- `npm run migrate:validate`: Validates migration state
- `npm run migrate:rebuild`: Rebuilds migration tracking table

Always use the recommended `migrate:direct` command for applying migrations.

## Authentication Flow

1. User registers or logs in
2. Server validates credentials and issues JWT
3. Client stores token and includes it in subsequent requests
4. Server middleware validates token for protected routes
5. Role-based access control determines permissions

## Key Features

- Athlete profile management
- Privacy controls for profile fields
- Slug-based public profile URLs
- Media management (photos, videos, transcripts)
- Mobile-first design for recruiter scanning

## Deployment

The application is deployed with separate frontend and backend instances that communicate via API. 