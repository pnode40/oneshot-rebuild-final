# Secure Password Management Pattern

## Purpose
Establishes standardized practices for secure password handling across the OneShot platform.

## Pattern Structure

### Password Hashing (Registration)
```typescript
// Hash password with bcrypt before storage
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// Store hashed password in database
await db.insert(users).values({
  // other fields...
  hashedPassword: hashedPassword,
});
```

### Password Verification (Login)
```typescript
// Retrieve user with hashed password
const user = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.email, email)
});

// Verify password
const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
if (!passwordMatch) {
  // Handle invalid password
}
```

## Implementation Guidelines

1. **Never store plaintext passwords**: Always hash before storage
2. **Use bcrypt**: Standard library with 10+ salt rounds
3. **Error messages**: Use generic "invalid credentials" messages
4. **Validation**: Require minimum password strength (8+ characters)

## Security Considerations

- **Salt Rounds**: Set to 10 minimum in development, 12+ in production
- **Hash Timing**: bcrypt is intentionally slow to prevent brute force
- **Error Messages**: Don't reveal which part of credentials is incorrect
- **Password Requirements**: Implement frontend and backend validation 