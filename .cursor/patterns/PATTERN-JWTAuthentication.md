# JWT Authentication Pattern

## Purpose
Standardizes JSON Web Token (JWT) implementation for secure, stateless authentication across the OneShot platform.

## Pattern Structure

### Token Generation
```typescript
const token = jwt.sign(
  { 
    userId: user.id, 
    email: user.email,
    role: user.role
  }, 
  JWT_SECRET,
  { expiresIn: '7d' }
);
```

### Token Storage (Frontend)
```typescript
// Store token
localStorage.setItem('oneshot_auth_token', token);

// Retrieve token
const token = localStorage.getItem('oneshot_auth_token');

// Remove token on logout
localStorage.removeItem('oneshot_auth_token');
```

### Request Authentication
```typescript
// Add token to request headers
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

### Token Verification (Middleware)
```typescript
// Extract and verify token
const token = authHeader.split(' ')[1];
const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

// Attach user data to request
req.user = {
  userId: decoded.userId,
  email: decoded.email,
  role: decoded.role
};
```

## Implementation Guidelines

1. **Token Payload**: Include only necessary data (userId, email, role)
2. **Expiration**: Default to 7 days unless specific need for shorter/longer
3. **Secret Management**: Use environment variables for JWT_SECRET
4. **Error Handling**: Return 401 for missing/invalid tokens
5. **Security**: Use HTTPS in production environments

## Common Pitfalls

- Storing sensitive data in token payload
- Missing token expiration
- Hardcoded secrets in source code
- Not validating tokens on sensitive operations 