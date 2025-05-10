# @FEATURE-AuthFlow.md

## Overview
The OneShot authentication system provides secure user identity management with registration, login, and role-based access control. It serves as the foundation for user-specific features and secures API endpoints throughout the application.

### Key Technologies
- JSON Web Tokens (JWT) for stateless authentication
- bcrypt for secure password hashing
- Zod for request validation
- React Context API for frontend state management

## Backend Authentication (`server/src/routes/auth.ts`)

### Registration Flow
1. **Input Validation**: Uses Zod schema to validate email, password, name, and role. See `@PATTERN-ZodRequestValidation.md` for details on our validation approach.
2. **Duplicate Check**: Verifies email isn't already registered
3. **Password Hashing**: Secures passwords with bcrypt. See `@PATTERN-SecurePasswordManagement.md` for our password security strategy.
4. **Verification Token**: Generates a random token for email verification (placeholder)
5. **Database Storage**: Creates user record with `isVerified=false`
6. **JWT Issuance**: Generates a signed token containing user ID, email, and role. See `@PATTERN-JWTAuthentication.md` for token generation details.
7. **Response**: Returns token and non-sensitive user data

### Login Flow
1. **Input Validation**: Validates email and password format using our Zod validation pattern
2. **User Retrieval**: Finds user by email
3. **Password Verification**: Uses bcrypt to compare passwords as detailed in `@PATTERN-SecurePasswordManagement.md`
4. **JWT Issuance**: Generates token with user ID, email, and role following `@PATTERN-JWTAuthentication.md`
5. **Response**: Returns token and user data

### JWT Details
JWT is used for stateless authentication with user identity and role data. See `@PATTERN-JWTAuthentication.md` for full details on token generation, structure, and verification strategy.

## Frontend Authentication

### AuthContext (`client/src/context/AuthContext.tsx`)
Provides authentication state throughout the application using React Context API. See `@PATTERN-ReactAuthContext.md` for the complete implementation pattern.

### API Service Layer (`client/src/services/api.ts`)
- **Token Storage**: Manages JWT in localStorage
- **Auth Headers**: Adds Authorization header to authenticated requests
- **API Methods**: Implements login and registration API calls
- **Error Handling**: Consistent response and error processing

### UI Components
- **Login.tsx**: Email/password form with validation and error handling
- **Register.tsx**: Registration form with field validation and role selection
- **Integration**: Both use the `useAuth` hook to access context

## Middleware (`server/src/middleware/auth.ts`)

### Authentication Middleware
- **Token Extraction**: Gets JWT from Authorization header
- **Verification**: Validates token signature and expiration
- **Request Augmentation**: Attaches user data to request object
- **Type Safety**: Uses `AuthRequest` interface for type checking

### Role-Based Authorization
- **Purpose**: Restricts endpoints based on user role
- **Usage**: Function factory pattern that accepts allowed roles
- **Verification**: Checks if authenticated user has required role

## Database (`users` table)

### Auth-Related Fields
- `id`: Primary key for user identification
- `email`: Unique identifier for login (with index for performance)
- `hashedPassword`: Bcrypt-hashed password storage
- `role`: User type (athlete, recruiter, admin, parent)
- `isVerified`: Email verification status
- `emailVerificationToken`: Token for email verification process

## Security Features Implemented

- **Password Security**: bcrypt hashing with salt rounds as specified in `@PATTERN-SecurePasswordManagement.md`
- **Token Security**: JWT with expiration and signature verification following `@PATTERN-JWTAuthentication.md`
- **Role-Based Access**: Authorization middleware for endpoint protection
- **Storage**: Token stored in localStorage (frontend)
- **Input Validation**: Zod schemas for request validation as detailed in `@PATTERN-ZodRequestValidation.md`

## Notable TODOs / Limitations

- **Email Verification**: Structure exists but workflow not fully implemented
- **Token Refresh**: No mechanism to refresh expired tokens
- **Remember Me**: No persistence option beyond token expiration
- **Password Reset**: No forgot password or reset workflow
- **Environment Management**: JWT secret should be environment-managed in production
- **Token Validation**: Frontend doesn't verify token expiration on initial load
- **HTTPS**: Should be enforced in production for secure token transmission 