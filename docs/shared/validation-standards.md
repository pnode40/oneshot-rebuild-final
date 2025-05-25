# OneShot Validation Standards

**Version**: 1.0  
**Created**: May 23, 2025  
**Authority**: OneShot Development Standards  
**Purpose**: Document Zod validation patterns, schema standards, and input validation practices

---

## 🛡️ VALIDATION OVERVIEW

### Validation Philosophy
OneShot uses **Zod** for comprehensive input validation, providing type safety, runtime validation, and clear error messages throughout the application.

### Validation Layers
1. **Request Validation** - API endpoint input validation
2. **Schema Validation** - Database operation validation
3. **Business Logic Validation** - Domain-specific rules
4. **Client-Side Validation** - Frontend form validation (shared schemas)

### Core Principles
- **Type Safety** - Runtime validation with TypeScript integration
- **Clear Error Messages** - User-friendly, actionable error messages
- **Reusable Schemas** - Shared validation logic across client/server
- **Fail Fast** - Validate early in request pipeline

---

## 📋 ZOD SCHEMA PATTERNS

### Basic Schema Structure
```typescript
import { z } from 'zod';

// Define schema with detailed error messages
const userSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['athlete', 'recruiter', 'admin', 'parent']).default('athlete')
});

// Type inference from schema
type UserData = z.infer<typeof userSchema>;
```

### Schema Organization
```typescript
// server/src/validations/
├── authSchemas.ts          # Authentication validation
├── athleteProfileSchemas.ts # Profile validation
├── mediaSchemas.ts         # Media upload validation
└── shared/
    ├── commonSchemas.ts    # Reusable validation patterns
    └── types.ts            # Shared type definitions
```

---

## 🔐 AUTHENTICATION SCHEMAS

### User Registration
```typescript
// server/src/validations/authSchemas.ts
export const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['athlete', 'recruiter', 'admin', 'parent']).default('athlete')
});

export type RegisterData = z.infer<typeof registerSchema>;
```

### User Login
```typescript
export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

export type LoginData = z.infer<typeof loginSchema>;
```

### Password Reset
```typescript
export const requestPasswordResetSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

---

## 🏃 ATHLETE PROFILE SCHEMAS

### Profile Creation
```typescript
// server/src/validations/athleteProfileSchemas.ts
export const createAthleteProfileSchema = z.object({
  sport: z.enum(['football', 'basketball', 'baseball', 'soccer', 'tennis', 'track', 'other']),
  position: z.enum(['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P']).optional(),
  graduationYear: z.number().int().min(2020).max(2030, 'Invalid graduation year'),
  height: z.string().regex(/^\d'(\d{1,2})"?$/, 'Height must be in format like 6\'2"').optional(),
  weight: z.number().int().min(80).max(400, 'Weight must be between 80-400 lbs').optional(),
  
  // Academic Information
  gpa: z.number().min(0).max(4.0, 'GPA must be between 0.0 and 4.0').optional(),
  satScore: z.number().int().min(400).max(1600, 'SAT score must be between 400-1600').optional(),
  actScore: z.number().int().min(1).max(36, 'ACT score must be between 1-36').optional(),
  
  // School Information
  highSchool: z.string().min(1, 'High school name is required').max(255),
  location: z.string().min(1, 'Location is required').max(255),
  
  // Profile Settings
  visibility: z.enum(['public', 'private', 'recruiter_only']).default('public'),
  commitmentStatus: z.enum(['uncommitted', 'committed', 'signed']).default('uncommitted'),
});
```

### Profile Update
```typescript
export const updateAthleteProfileSchema = createAthleteProfileSchema.partial();
export type UpdateAthleteProfileData = z.infer<typeof updateAthleteProfileSchema>;
```

---

## 📱 MEDIA VALIDATION SCHEMAS

### Video Link Upload
```typescript
// server/src/validations/mediaSchemas.ts
export const videoLinkUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  url: z.string().url('Invalid URL format. Please provide a valid URL for the video.'),
  description: z.string().max(1000, 'Description too long').optional(),
  mediaType: z.enum(['highlight_video', 'game_film', 'training_clip'], {
    errorMap: () => ({ message: 'Invalid media type. Must be one of: highlight_video, game_film, training_clip' })
  })
});

export type VideoLinkUploadData = z.infer<typeof videoLinkUploadSchema>;
```

### Video Link Update
```typescript
export const videoLinkUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  url: z.string().url('Invalid URL format').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
}).refine(data => 
  Object.keys(data).length > 0, 
  { message: 'At least one field must be provided for update' }
);
```

### File Upload Validation
```typescript
export const fileUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  mediaType: z.enum(['image', 'pdf']),
  // File validation handled by multer middleware
});

// File size and type validation (used with multer)
export const fileValidationRules = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    pdf: ['application/pdf']
  }
};
```

---

## 🔧 VALIDATION MIDDLEWARE

### Request Validation Middleware
```typescript
// server/src/middleware/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

interface ValidationSchemas {
  body?: AnyZodObject;
  params?: AnyZodObject;
  query?: AnyZodObject;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (!bodyResult.success) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formatZodErrors(bodyResult.error)
          });
        }
        req.body = bodyResult.data;
      }

      // Validate request params
      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (!paramsResult.success) {
          return res.status(400).json({
            success: false,
            message: 'Invalid parameters',
            errors: formatZodErrors(paramsResult.error)
          });
        }
        req.params = paramsResult.data;
      }

      // Validate query parameters
      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (!queryResult.success) {
          return res.status(400).json({
            success: false,
            message: 'Invalid query parameters',
            errors: formatZodErrors(queryResult.error)
          });
        }
        req.query = queryResult.data;
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal validation error'
      });
    }
  };
};
```

### Error Formatting
```typescript
const formatZodErrors = (error: ZodError) => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
};
```

---

## 🎯 COMMON VALIDATION PATTERNS

### Parameter Validation
```typescript
// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

// User ID parameter validation
export const userIdParamSchema = z.object({
  userId: z.string().regex(/^\d+$/, 'User ID must be a number').transform(Number)
});

// Media item ID parameter validation
export const mediaItemIdParamSchema = z.object({
  mediaItemId: z.string().regex(/^\d+$/, 'Media item ID must be a number').transform(Number)
});
```

### Query Parameter Validation
```typescript
// Pagination parameters
export const paginationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  sort: z.enum(['asc', 'desc']).default('desc'),
});

// Search parameters
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query required').max(100),
  sport: z.enum(['football', 'basketball', 'baseball', 'soccer', 'tennis', 'track', 'other']).optional(),
  graduationYear: z.string().regex(/^\d{4}$/).transform(Number).optional(),
});
```

### Conditional Validation
```typescript
// Profile visibility with conditional rules
export const profileVisibilitySchema = z.object({
  visibility: z.enum(['public', 'private', 'recruiter_only']),
  allowMessaging: z.boolean().optional(),
}).refine(data => {
  // If private, messaging should be disabled
  if (data.visibility === 'private') {
    return data.allowMessaging !== true;
  }
  return true;
}, {
  message: 'Private profiles cannot allow messaging',
  path: ['allowMessaging']
});
```

---

## 📊 VALIDATION USAGE PATTERNS

### API Route Implementation
```typescript
// Example: Video link upload endpoint
import { validateRequest } from '../middleware/validationMiddleware';
import { videoLinkUploadSchema, idParamSchema } from '../validations/mediaSchemas';

router.post('/video-link',
  authenticateJWT,
  validateRequest({ body: videoLinkUploadSchema }),
  async (req: Request, res: Response) => {
    // req.body is now typed and validated
    const { title, url, description, mediaType } = req.body;
    
    try {
      const result = await createVideoLink({
        title,
        url,
        description,
        mediaType,
        userId: req.user.userId
      });
      
      res.status(201).json({
        success: true,
        message: 'Video link created successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create video link'
      });
    }
  }
);
```

### Update Endpoint Pattern
```typescript
router.patch('/media/:mediaItemId',
  authenticateJWT,
  requireSelfOrAdmin,
  validateRequest({ 
    params: mediaItemIdParamSchema,
    body: videoLinkUpdateSchema 
  }),
  async (req: Request, res: Response) => {
    const { mediaItemId } = req.params;
    const updateData = req.body;
    
    // Type-safe update operation
    const result = await updateMediaItem(mediaItemId, updateData);
    
    res.json({
      success: true,
      message: 'Media item updated successfully',
      data: result
    });
  }
);
```

---

## 🚨 ERROR HANDLING PATTERNS

### Standard Error Response
```typescript
interface ValidationErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// Example error response
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required",
      "code": "invalid_string"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters",
      "code": "too_small"
    }
  ]
}
```

### Custom Error Messages
```typescript
// Detailed custom error messages
const emailSchema = z.string({
  required_error: 'Email is required',
  invalid_type_error: 'Email must be a string'
}).email('Please enter a valid email address');

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password is too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );
```

---

## 🔄 SCHEMA TRANSFORMATIONS

### Data Transformation
```typescript
// Transform string inputs to appropriate types
const athleteProfileSchema = z.object({
  graduationYear: z.string().regex(/^\d{4}$/).transform(Number),
  weight: z.string().regex(/^\d+$/).transform(Number).optional(),
  gpa: z.string().regex(/^\d\.\d{2}$/).transform(Number).optional(),
});

// Clean and normalize data
const nameSchema = z.string()
  .transform(str => str.trim())                    // Remove whitespace
  .transform(str => str.toLowerCase())             // Normalize case
  .transform(str => str.charAt(0).toUpperCase() + str.slice(1)); // Capitalize
```

### Preprocessing
```typescript
// Preprocess data before validation
const urlSchema = z.preprocess(
  (val) => {
    if (typeof val === 'string' && !val.startsWith('http')) {
      return `https://${val}`;
    }
    return val;
  },
  z.string().url('Invalid URL format')
);
```

---

## 🧪 TESTING VALIDATION

### Schema Testing
```typescript
// server/src/validations/__tests__/authSchemas.test.ts
import { registerSchema } from '../authSchemas';

describe('registerSchema', () => {
  it('should validate correct registration data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'athlete'
    };
    
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };
    
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe('Valid email is required');
  });
});
```

### Integration Testing
```typescript
// Test validation middleware with supertest
describe('POST /api/auth/register', () => {
  it('should reject invalid registration data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid',
        password: '123'
      })
      .expect(400);
      
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toHaveLength(3); // email, password, firstName
  });
});
```

---

## 🎯 FRONTEND VALIDATION

### Shared Schema Usage
```typescript
// Shared between frontend and backend
// src/shared/validations/authSchemas.ts
export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

// Frontend form validation
import { loginSchema } from '../shared/validations/authSchemas';

const LoginForm = () => {
  const handleSubmit = (data: any) => {
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      // Show validation errors
      setErrors(result.error.errors);
      return;
    }
    
    // Submit validated data
    submitLogin(result.data);
  };
};
```

---

## 📈 PERFORMANCE CONSIDERATIONS

### Validation Optimization
```typescript
// Use .strict() to prevent extra properties
const strictSchema = z.object({
  name: z.string(),
  email: z.string().email()
}).strict(); // Rejects additional properties

// Use .passthrough() for flexible validation
const flexibleSchema = z.object({
  name: z.string(),
  email: z.string().email()
}).passthrough(); // Allows additional properties
```

### Caching Validation Results
```typescript
// Cache compiled schemas for better performance
const schemaCache = new Map();

const getCompiledSchema = (key: string, schema: z.ZodSchema) => {
  if (!schemaCache.has(key)) {
    schemaCache.set(key, schema);
  }
  return schemaCache.get(key);
};
```

---

## 📚 REFERENCE DOCUMENTATION

### Implementation Files
- `server/src/validations/authSchemas.ts` - Authentication validation
- `server/src/validations/athleteProfileSchemas.ts` - Profile validation
- `server/src/validations/mediaSchemas.ts` - Media validation
- `server/src/middleware/validationMiddleware.ts` - Validation middleware

### Related Documentation
- `docs/shared/auth-policy.md` - Authentication flow validation
- `docs/shared/db-schema.md` - Database schema validation
- `docs/track-a/Test-Strategy.md` - Validation testing strategies
- `.cursor/rules/2-domain/api/api-standards.mdc` - API validation standards

### External Resources
- [Zod Documentation](https://zod.dev/)
- [Zod GitHub Repository](https://github.com/colinhacks/zod)

---

**Last Updated**: May 23, 2025  
**Next Review**: After validation system changes  
**Status**: ✅ ACTIVE - Defines all OneShot validation standards and patterns