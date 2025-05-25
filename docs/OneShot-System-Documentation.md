# OneShot System Documentation

This document provides a comprehensive overview of the OneShot recruiting platform's architecture, development approach, and AI team structure.

## 1. System Overview

OneShot is a recruiting platform for student athletes to create profiles and share them with college recruiters. The system allows athletes to:

- Create and manage profiles
- Upload various media types (videos, images, transcripts)
- Share profiles with recruiters

### Technology Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Zod for validation
- **Database**: PostgreSQL with Drizzle ORM
- **File Storage**: Local filesystem (planned migration to cloud)

## 2. AI Development Team

OneShot uses an innovative AI-driven development approach with a team composed of:

| Role | AI Model | Responsibilities |
|------|----------|-----------------|
| **Product Owner** | Eric (Human) | Final verification, task definition |
| **CTO Advisor** | Gemini 2.5 Pro | Architecture decisions, technical strategy |
| **Prompt Engineer** | ChatGPT | Task planning, breaking features into atomic tasks |
| **Developer** | Claude 3.7 Max | Code implementation |

### Development Workflow

1. Eric defines or approves a feature/bugfix
2. ChatGPT creates implementation prompts
3. Claude generates code
4. Eric verifies the implementation
5. Eric commits approved code

## 3. Code Organization

### Project Structure

```
oneshot/
├── server/                  # Backend Express application
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth and validation middleware
│   │   ├── services/        # Business logic
│   │   ├── validations/     # Zod schemas
│   │   ├── db/              # Database connection and schema
│   │   └── index.ts         # Main server file
│   └── tests/               # Backend tests
│
├── src/                     # Frontend React application
│   ├── components/          # Reusable UI components
│   ├── features/            # Feature-specific components
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── services/            # API client services
│   └── App.tsx              # Main app component
│
├── .cursor/                 # AI development rules
│   └── rules/               # MDC rules for Claude
│
├── docs/                    # Documentation
│   ├── track-a/             # Main track documentation
│   └── track-b/             # Experimental track documentation
│
└── uploads/                 # Local file storage
    ├── profile-photos/      # Athlete profile photos
    └── transcripts/         # Academic transcripts
```

## 4. Development Tracks

OneShot development is organized into two distinct tracks:

### Track A (Main)

The primary development track for stable features that are already integrated into the main application. Uses standard production middleware, naming conventions, and follows consistent patterns.

### Track B (Experimental)

Used for experimental features with potentially different approaches. Serves as a proving ground before features are migrated to Track A. Uses `/api/experimental` routes and custom middleware for isolation.

## 5. Rules System

OneShot uses an innovative `.mdc` rules system to guide AI-based development:

### Global Rules (1-global/)
- **002-system-context**: Defines team roles and workflow
- **003-self-correction**: Establishes error handling and improvement protocols

### Domain Rules (2-domain/)
- **api/api-standards**: RESTful API design patterns
- **db/drizzle-patterns**: Database schema conventions
- **ui/component-standards**: React component patterns

### Track-Specific Rules
- **track-a-rules.mdc**: Main application conventions
- **track-b-rules.mdc**: Experimental track patterns

## 6. Key Features

### Media Management

The system supports multiple media types:
- **Video Links**: YouTube/Vimeo links with metadata
- **Images**: Profile photos with title/description
- **PDFs**: Transcripts and other documents

Each media type supports CRUD operations with type-specific validation and handling.

### Authentication System

- JWT-based authentication
- Role-based access control
- Different middleware for different contexts:
  - `requireSelfOrAdmin`: Track A standard
  - `requireProfileOwnerOrAdmin`: Track B standard

## 7. Migration Protocol

When moving features from Track B to Track A:

1. Update import paths
2. Change middleware from `requireProfileOwnerOrAdmin` to `requireSelfOrAdmin` 
3. Update route registration in `server/src/index.ts`
4. Ensure consistent error handling and response formats
5. Update tests to match Track A conventions
6. Document the migration in Sprint history

## 8. Testing Strategy

- Jest for backend testing
- Test coverage includes:
  - Success cases for each endpoint
  - Validation failures
  - Authentication/authorization failures
  - Error handling scenarios
  - File operation edge cases

## 9. Future Roadmap

- Cloud storage migration
- Image processing features
- Advanced media search and filtering
- Frontend components for all media types
 