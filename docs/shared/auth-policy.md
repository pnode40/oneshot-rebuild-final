# OneShot Authentication & Authorization Policy

**Version**: 1.0  
**Created**: May 23, 2025  
**Authority**: OneShot Development Standards  
**Purpose**: Document authentication flows, authorization patterns, and security policies

---

## 🔐 AUTHENTICATION OVERVIEW

### Authentication Method
OneShot uses **JWT (JSON Web Token)** based authentication with role-based access control (RBAC).

### User Roles
```typescript
type UserRole = 'athlete' | 'recruiter' | 'admin' | 'parent';
```

### Token Structure
```typescript
interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat: number;  // Issued at
  exp: number;  // Expires at
}
```

---

## 🚪 AUTHENTICATION FLOW

### 1. User Registration
```typescript
// POST /api/auth/register
const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['athlete', 'recruiter', 'admin', 'parent']).default('athlete')
});
```

**Process**:
1. Validate input using Zod schema
2. Hash password using bcrypt
3. Create user record in database
4. Generate JWT token
5. Return token and user data

### 2. User Login
```typescript
// POST /api/auth/login
const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});
```

**Process**:
1. Validate credentials
2. Verify password against hash
3. Generate JWT token
4. Return token and user data

### 3. Token Verification
**Middleware**: `authenticateJWT`
```typescript
// Attaches user to request object
interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: UserRole;
  };
}
```

---

## 🛡️ AUTHORIZATION PATTERNS

### 1. Self or Admin Access
**Middleware**: `requireSelfOrAdmin`

**Use Cases**: User data access, profile management, media management

**Logic**:
- Admin users can access any resource
- Regular users can only access their own resources
- Requires `userId` parameter or `req.user.userId` comparison

**Implementation**:
```typescript
// Check target user ID from params or body
const targetUserId = req.params.userId || req.body.userId;

// Allow if admin or accessing own data
if (user.role === 'admin' || user.userId === targetUserId) {
  next(); // Allow access
} else {
  res.status(403).json({ message: 'Access denied' });
}
```

### 2. Admin Only Access
**Middleware**: `requireAdmin`

**Use Cases**: System administration, user management, sensitive operations

**Logic**:
- Only users with `role: 'admin'` can access
- All other roles receive 403 Forbidden

### 3. Role-Based Access
**Middleware**: `requireRole(roles[])`

**Use Cases**: Feature-specific access based on user type

**Examples**:
```typescript
// Only athletes and parents can access
requireRole(['athlete', 'parent'])

// Only recruiters and admins can access
requireRole(['recruiter', 'admin'])
```

---

## 🔒 SECURITY IMPLEMENTATION

### Password Security
- **Hashing**: bcrypt with salt rounds
- **Minimum Length**: 8 characters
- **Validation**: Zod schema enforcement

### JWT Security
- **Secret Key**: Environment variable `JWT_SECRET`
- **Expiration**: Configurable (default: 24 hours)
- **Algorithm**: HS256
- **Storage**: Client-side (localStorage/sessionStorage)

### Request Protection
```typescript
// Standard protected route pattern
router.get('/protected-route', 
  authenticateJWT,        // Verify JWT token
  requireSelfOrAdmin,     // Authorize access
  (req, res) => {
    // Route handler
  }
);
```

---

## 📋 AUTHENTICATION MIDDLEWARE

### Core Middleware Stack
```typescript
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireSelfOrAdmin, requireAdmin, requireRole } from '../middleware/rbacMiddleware';
```

### Middleware Chain Patterns
```typescript
// Public route (no authentication)
router.get('/public', handler);

// Authenticated route (any logged-in user)
router.get('/authenticated', authenticateJWT, handler);

// Self or admin access
router.get('/user/:userId', authenticateJWT, requireSelfOrAdmin, handler);

// Admin only
router.get('/admin', authenticateJWT, requireAdmin, handler);

// Role-specific
router.get('/athletes', authenticateJWT, requireRole(['athlete']), handler);
```

---

## 🎯 ROLE PERMISSIONS MATRIX

### Athlete
- ✅ Create/read/update own profile
- ✅ Upload own media (videos, photos, transcripts)
- ✅ View own statistics and data
- ❌ Access other users' data
- ❌ Administrative functions

### Recruiter
- ✅ Search and view athlete profiles
- ✅ Contact athletes (when implemented)
- ✅ Manage own recruiter profile
- ❌ Modify athlete data
- ❌ Administrative functions

### Parent
- ✅ View associated athlete profiles
- ✅ Help manage athlete accounts
- ✅ Upload content on behalf of athlete
- ❌ Access non-associated athletes
- ❌ Administrative functions

### Admin
- ✅ **Full system access**
- ✅ User management and moderation
- ✅ System configuration
- ✅ Access all user data
- ✅ Override security restrictions

---

## 🚨 ERROR HANDLING

### Authentication Errors
```typescript
// 401 Unauthorized - No valid token
{
  success: false,
  message: 'Authentication required'
}

// 401 Unauthorized - Invalid token
{
  success: false,
  message: 'Invalid token'
}

// 401 Unauthorized - Expired token
{
  success: false,
  message: 'Token expired'
}
```

### Authorization Errors
```typescript
// 403 Forbidden - Self or admin access denied
{
  success: false,
  message: 'Access denied: You can only access your own data'
}

// 403 Forbidden - Admin only access denied
{
  success: false,
  message: 'Access denied: Admins only'
}

// 403 Forbidden - Role-based access denied
{
  success: false,
  message: 'Access denied: Restricted to athlete, parent roles'
}
```

### Validation Errors
```typescript
// 400 Bad Request - Missing user ID
{
  success: false,
  message: 'User ID parameter required'
}

// 400 Bad Request - Invalid credentials
{
  success: false,
  message: 'Invalid email or password'
}
```

---

## 🔧 IMPLEMENTATION EXAMPLES

### Protected API Route
```typescript
import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireSelfOrAdmin } from '../middleware/rbacMiddleware';

const router = express.Router();

// GET /api/user/:userId/profile
router.get('/user/:userId/profile',
  authenticateJWT,           // Verify JWT token
  requireSelfOrAdmin,        // Check authorization
  async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const profile = await getUserProfile(userId);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);
```

### Frontend Authentication
```typescript
// Store token after login
localStorage.setItem('authToken', token);

// Include token in API requests
const apiCall = async (endpoint: string) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

---

## 🔄 TOKEN LIFECYCLE

### Token Generation
1. User provides valid credentials
2. Server verifies credentials
3. Server generates JWT with user data
4. Token returned to client

### Token Usage
1. Client stores token securely
2. Client includes token in request headers
3. Server validates token on each request
4. Server attaches user data to request

### Token Expiration
1. Tokens expire after configured time
2. Client receives 401 error on expired token
3. Client redirects to login
4. User re-authenticates for new token

---

## 📊 SECURITY BEST PRACTICES

### Password Requirements
- Minimum 8 characters
- Bcrypt hashing with salt
- No password reuse policies (future enhancement)
- Password reset via email verification

### Token Security
- Short expiration times (24 hours default)
- Secure secret key management
- HTTPS only in production
- No token storage in cookies (XSS protection)

### Access Control
- Principle of least privilege
- Role-based permissions
- Resource ownership validation
- Audit logging (future enhancement)

### Data Protection
- Input validation with Zod
- SQL injection prevention via Drizzle ORM
- XSS protection via content sanitization
- CORS configuration for API access

---

## 🎯 TESTING AUTHENTICATION

### Unit Tests
```typescript
describe('requireSelfOrAdmin middleware', () => {
  it('should allow admin access to any user', async () => {
    // Test admin accessing any userId
  });
  
  it('should allow user access to own data', async () => {
    // Test user accessing own userId
  });
  
  it('should deny user access to other data', async () => {
    // Test user accessing different userId
  });
});
```

### Integration Tests
```typescript
describe('Protected API routes', () => {
  it('should reject requests without token', async () => {
    const response = await request(app)
      .get('/api/user/1/profile')
      .expect(401);
  });
  
  it('should accept requests with valid token', async () => {
    const response = await request(app)
      .get('/api/user/1/profile')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
  });
});
```

---

## 📚 REFERENCE FILES

### Implementation Files
- `server/src/middleware/authMiddleware.ts` - JWT authentication
- `server/src/middleware/rbacMiddleware.ts` - Authorization logic
- `server/src/validations/authSchemas.ts` - Validation schemas
- `server/src/routes/authRoutes.ts` - Authentication endpoints

### Related Documentation
- `docs/track-a/System-Safety-Protocol.md` - Security guidelines
- `docs/shared/db-schema.md` - User table structure
- `docs/shared/validation-standards.md` - Input validation patterns

---

**Last Updated**: May 23, 2025  
**Next Review**: After authentication system changes  
**Status**: ✅ ACTIVE - Defines all OneShot authentication and authorization patterns