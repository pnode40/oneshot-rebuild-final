# OneShot Recruiting Platform

A recruiting platform for student athletes to create profiles and share them with college recruiters.

## Project Overview

OneShot is built with:
- Express.js backend (PORT 3001)
- React/Vite frontend (PORT 5173)
- PostgreSQL database with Drizzle ORM

## Development Tracks

The project is organized into two development tracks:

### Track A (Main Application)
- Production code
- Follows standard middleware patterns
- Tested and stable features

### Track B (Experimental)
- Feature prototyping environment
- Isolated API endpoints under `/api/experimental/`
- Testing ground for new approaches
- Code migrates to Track A when stable

## Key Features

### Media Management
- **Video Links**: Management of YouTube/Vimeo links with custom metadata
- **Profile Photos**: Image upload with local storage
- **Transcripts**: PDF upload for academic records

### Profile Management
- Athlete profile creation and editing
- Fine-grained control over profile visibility
- Role-based access control

## Project Structure

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
│   └── App.tsx              # Main app component
│
├── .cursor/rules/           # AI development rules
│   ├── 1-global/            # Global rules that always apply
│   └── 2-domain/            # Domain-specific rules
│
├── docs/                    # Documentation
│   ├── track-a/             # Main track documentation
│   └── track-b/             # Experimental track documentation
│
└── uploads/                 # Local file storage
    ├── profile-photos/      # Athlete profile photos
    └── transcripts/         # Academic transcripts
```

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/oneshot.git
cd oneshot
```

2. Install dependencies:
```
npm install
cd client
npm install
cd ..
```

3. Set up environment variables:
```
cp .env.example .env
```

4. Start the development servers:
```
npm run dev
```

5. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Documentation

Comprehensive documentation can be found in the `docs/` directory:

- `docs/OneShot-System-Documentation.md`: System architecture overview
- `docs/track-a/Sprint-History.md`: Development sprint history
- `docs/track-a/TaskPlan.md`: Current task planning

## AI Development Team

This project is built using an innovative AI-driven development workflow:

- **Eric**: Product Owner
- **Gemini 2.5 Pro**: CTO Advisor
- **ChatGPT**: Prompt Engineer
- **Claude 3.7 Max**: Developer

## License

This project is licensed under the MIT License - see the LICENSE file for details.
