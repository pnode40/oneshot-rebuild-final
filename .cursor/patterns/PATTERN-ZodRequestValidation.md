# Zod Request Validation Pattern

## Purpose
Establishes a pattern for robust request validation using Zod schemas.

## Pattern Structure

### Schema Definition
```typescript
// Define validation schema with detailed error messages
const registerSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(['athlete', 'recruiter', 'admin', 'parent']).default('athlete')
});

// Type inference from schema
type RegisterData = z.infer<typeof registerSchema>;
```

### Request Validation
```typescript
// Validate request body
const validationResult = registerSchema.safeParse(req.body);

if (!validationResult.success) {
  return res.status(400).json({ 
    success: false, 
    errors: validationResult.error.errors 
  });
}

// Use validated data with correct types
const validatedData = validationResult.data;
```

## Implementation Guidelines

1. **Schema Organization**: Define schemas close to their usage
2. **Error Messages**: Provide user-friendly error messages in schema
3. **Defaults**: Use defaults for optional fields when appropriate
4. **Type Inference**: Use `z.infer<>` to derive TypeScript types
5. **Safe Parsing**: Use `safeParse()` for error handling

## Benefits

- **Type Safety**: Runtime validation with TypeScript integration
- **Error Messages**: Detailed, customizable error messages
- **Transformations**: Data transformation during validation
- **Schema Reuse**: Composable schemas across endpoints 