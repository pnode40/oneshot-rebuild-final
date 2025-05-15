# OneShot: Athlete-Driven Recruiting Platform

OneShot is a mobile-first recruiting platform that helps athletes create professional profiles and connect with recruiters. This application provides athletes with tools to showcase their skills, academic achievements, and highlight videos, all in a shareable format designed for recruiters.

## Project Structure

The project is organized as a monorepo with client and server components:

```
oneshot/
├── client/               # React frontend application
│   └── src/              # Frontend source code
├── server/               # Express.js backend application
│   └── src/              # Backend source code
└── package.json          # Root package.json for top-level scripts
```

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Features

- Athlete profile management with privacy controls
- Media management (photos, videos, transcripts)
- Public profile viewing with mobile optimization
- User authentication and role-based access
- Slug-based profile URLs

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: JWT-based
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-org/oneshot.git
   cd oneshot
   ```

2. Install dependencies
   ```
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```

4. Run database migrations
   ```
   npm run migrate:direct
   ```

5. Start development servers
   ```
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the backend server
- `npm run migrate:direct` - Run database migrations
- `npm run migrate:validate` - Validate migration state
- `npm run migrate:rebuild` - Rebuild migration tracking table

For more detailed information about the migration system, see [server/src/db/README.md](./server/src/db/README.md).

## Development

For information about project status, roadmap, and contribution guidelines, see:

- [OneShot-MVP-Scope.md](./OneShot-MVP-Scope.md) - Features and scope
- [OneShot-MVP-Progress.md](./OneShot-MVP-Progress.md) - Current implementation status

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Project architecture
- [server/src/db/README.md](./server/src/db/README.md) - Database and migration system
- [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) - Codebase consolidation plan
