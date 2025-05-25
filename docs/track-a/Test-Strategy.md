# OneShot AI Development - Test Strategy

**Track**: A (Official Mainline)  
**Version**: 1.0  
**Created**: May 23, 2025  
**Authority**: Claude 4.0 Development Standards  
**Purpose**: Define comprehensive testing requirements and procedures

---

## 🎯 TESTING PHILOSOPHY

### Core Principles
- **Test-Driven Confidence** - Every feature must have comprehensive tests
- **Safety First** - Tests prevent regressions and breaking changes
- **Documentation Through Tests** - Tests serve as living documentation
- **Continuous Verification** - Manual + automated testing combined

### Testing Pyramid
```
    ┌─────────────────┐
    │   Manual E2E    │  ← Eric's final verification
    │    (Critical)   │
    ├─────────────────┤
    │  API Integration│  ← Jest + Supertest
    │     Tests       │
    ├─────────────────┤
    │   Unit Tests    │  ← Jest + individual functions
    │  (Foundation)   │
    └─────────────────┘
```

---

## 🧪 JEST TESTING STANDARDS

### Test File Structure
```
src/
├── routes/
│   ├── api/
│   │   ├── media.ts              # Implementation
│   │   └── media.test.ts         # Jest tests
├── test/
│   ├── helpers/
│   │   ├── auth-helpers.ts       # Authentication test utilities
│   │   ├── db-helpers.ts         # Database test utilities
│   │   └── request-helpers.ts    # HTTP request utilities
│   └── fixtures/
│       ├── users.ts              # Test user data
│       └── media.ts              # Test media data
```

### Test Naming Convention
```typescript
describe('PATCH /api/media/:mediaItemId', () => {
  describe('✅ Success Cases', () => {
    it('should update video link title and url', async () => {})
    it('should update PDF title only', async () => {})
    it('should update image title only', async () => {})
  })
  
  describe('❌ Error Cases', () => {
    it('should reject invalid mediaItemId', async () => {})
    it('should reject unauthorized access', async () => {})
    it('should reject invalid payload', async () => {})
  })
  
  describe('🧨 Edge Cases', () => {
    it('should handle file deletion failure gracefully', async () => {})
    it('should handle database connection failure', async () => {})
  })
})
```

---

## 📋 REQUIRED TEST CATEGORIES

### Category 1: Success Path Testing ✅
**Purpose**: Verify feature works as intended

#### API Endpoint Tests:
- [ ] **Valid request with correct data**
- [ ] **Authentication/authorization success**
- [ ] **Database operations complete successfully**
- [ ] **Response format matches specification**
- [ ] **Status codes are correct (200, 201, 204)**

#### Frontend Component Tests:
- [ ] **Component renders with valid props**
- [ ] **User interactions work as expected**
- [ ] **State updates correctly**
- [ ] **API calls are made with correct data**

### Category 2: Input Validation Testing ❌
**Purpose**: Verify system handles bad input gracefully

#### Required Validations:
- [ ] **Invalid data types** (string instead of number, etc.)
- [ ] **Missing required fields**
- [ ] **Fields exceeding length limits**
- [ ] **Malicious input** (XSS, SQL injection attempts)
- [ ] **Invalid IDs** (non-existent, malformed)

#### Expected Behaviors:
- [ ] **400 Bad Request** for invalid input
- [ ] **Clear error messages** describing the problem
- [ ] **No system crashes** or unhandled exceptions
- [ ] **Security boundaries maintained**

### Category 3: Authorization Testing 🔐
**Purpose**: Verify security boundaries are enforced

#### Authentication Tests:
- [ ] **Missing JWT token** → 401 Unauthorized
- [ ] **Invalid JWT token** → 401 Unauthorized
- [ ] **Expired JWT token** → 401 Unauthorized

#### Authorization Tests:
- [ ] **User accessing own data** → Allow
- [ ] **Admin accessing any data** → Allow
- [ ] **User accessing other's data** → 403 Forbidden
- [ ] **Role-based permissions** → Enforce correctly

### Category 4: Edge Case Testing 🧨
**Purpose**: Verify system handles unusual situations

#### System Boundaries:
- [ ] **Database connection failures**
- [ ] **File system errors** (disk full, permissions)
- [ ] **Network timeouts and failures**
- [ ] **Concurrent access scenarios**

#### Data Boundaries:
- [ ] **Empty databases** (no existing data)
- [ ] **Large datasets** (performance testing)
- [ ] **Unicode and special characters**
- [ ] **Null and undefined values**

---

## 🛠️ TESTING UTILITIES & PATTERNS

### Authentication Helper
```typescript
// src/test/helpers/auth-helpers.ts
export const createTestUser = async () => {
  // Create user in test database
}

export const generateAuthToken = (userId: number, role: 'ATHLETE' | 'ADMIN') => {
  // Generate valid JWT for testing
}

export const authenticatedRequest = (token: string) => {
  return request(app).set('Authorization', `Bearer ${token}`)
}
```

### Database Helper
```typescript
// src/test/helpers/db-helpers.ts
export const setupTestDb = async () => {
  // Setup clean test database before each test
}

export const teardownTestDb = async () => {
  // Clean up test database after each test
}

export const seedTestData = async () => {
  // Insert known test data
}
```

### File System Testing
```typescript
// For media upload/delete testing
export const createTestFile = (filename: string) => {
  // Create temporary test file
}

export const cleanupTestFiles = () => {
  // Remove test files after testing
}
```

---

## 📊 TEST COVERAGE REQUIREMENTS

### Minimum Coverage Targets:
- **API Routes**: 95% coverage (critical business logic)
- **Database Operations**: 90% coverage
- **Authentication/Authorization**: 100% coverage
- **Validation Logic**: 100% coverage
- **Error Handling**: 85% coverage

### Coverage Reporting:
```bash
# Generate coverage report
npm run test:coverage

# View detailed coverage
open coverage/lcov-report/index.html
```

---

## 🔄 TESTING WORKFLOW

### For New Features:
1. **Write tests first** (Test-Driven Development)
2. **Implement minimum code** to pass tests
3. **Refactor while maintaining test passage**
4. **Add edge case tests**
5. **Manual verification by Eric**

### For Bug Fixes:
1. **Write test that reproduces bug**
2. **Verify test fails** (confirms bug exists)
3. **Fix the bug**
4. **Verify test passes** (confirms fix works)
5. **Add additional edge case tests**

### For Refactoring:
1. **Ensure existing tests pass**
2. **Add tests for new edge cases** if discovered
3. **Refactor implementation**
4. **Verify all tests still pass**
5. **Update tests if behavior intentionally changed**

---

## 🧪 EXAMPLE TEST IMPLEMENTATION

### Complete API Test Suite Example:
```typescript
import request from 'supertest'
import { app } from '../../../app'
import { setupTestDb, teardownTestDb, seedTestData } from '../../helpers/db-helpers'
import { createTestUser, generateAuthToken } from '../../helpers/auth-helpers'

describe('PATCH /api/media/:mediaItemId', () => {
  let testUser: any
  let testAdmin: any
  let authToken: string
  let adminToken: string

  beforeEach(async () => {
    await setupTestDb()
    testUser = await createTestUser({ role: 'ATHLETE' })
    testAdmin = await createTestUser({ role: 'ADMIN' })
    authToken = generateAuthToken(testUser.id, 'ATHLETE')
    adminToken = generateAuthToken(testAdmin.id, 'ADMIN')
    await seedTestData()
  })

  afterEach(async () => {
    await teardownTestDb()
  })

  describe('✅ Success Cases', () => {
    it('should update video link title and url', async () => {
      const response = await request(app)
        .patch('/api/media/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Video Title',
          url: 'https://youtube.com/updated'
        })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Media item updated successfully'
      })
    })
  })

  describe('❌ Error Cases', () => {
    it('should reject invalid mediaItemId', async () => {
      await request(app)
        .patch('/api/media/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test' })
        .expect(400)
    })
  })
})
```

---

## 🎯 MANUAL VERIFICATION PROTOCOL

### Eric's Verification Checklist:
1. **Start development servers**
   ```bash
   npm run dev:backend    # Port 3001
   npm run dev:frontend   # Port 5173
   ```

2. **Test core functionality**
   - [ ] Authentication works (login/logout)
   - [ ] New feature performs as expected
   - [ ] No existing features broken
   - [ ] Error messages are clear and helpful

3. **Test edge cases**
   - [ ] Invalid input handled gracefully
   - [ ] Unauthorized access blocked
   - [ ] System recovers from errors

4. **Performance check**
   - [ ] Pages load quickly
   - [ ] No console errors
   - [ ] Database queries efficient

---

## 🚨 TEST FAILURE PROTOCOL

### When Tests Fail:
1. **Never ignore failing tests**
2. **Fix the test or fix the code** - one must change
3. **Understand why the test failed** before making changes
4. **Document if the failure reveals a design issue**

### Test Maintenance:
- **Update tests when requirements change**
- **Remove obsolete tests** for removed features
- **Keep test data realistic** and representative
- **Maintain test performance** (fast execution)

---

## 📚 REFERENCE DOCUMENTATION

### Related Files:
- `docs/track-a/System-Safety-Protocol.md` - Development guardrails
- `docs/track-a/Verification-Checklist.md` - Manual verification steps
- `.cursor/rules/` - All development standards

### Jest Configuration:
- `jest.config.js` - Jest setup and configuration
- `src/test/setup.ts` - Test environment setup
- `package.json` - Test scripts and dependencies

---

**Last Updated**: May 23, 2025  
**Next Review**: June 2025  
**Status**: ✅ ACTIVE - Required for all new features