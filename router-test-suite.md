# AI Model Router Test Suite

## Purpose
This test suite validates that our AI model routing system correctly classifies tasks and routes them to the appropriate model tier. Use these test cases for regression testing and cost audits.

## Test Categories

### 1. Simple Tasks → Nano Tier

#### Test 1.1: Typo Fix
```yaml
input: "Fix typo in README: 'teh' should be 'the'"
expected:
  model: nano
  reasoning: "Matched rule: Typo Fixes"
  confidence: 0.9
  estimatedTokens: ~200
  estimatedCost: ~$0.00002
```

#### Test 1.2: JSON Formatting
```yaml
input: "Format this JSON file"
fileContent: '{"name":"test","value":123}'
expected:
  model: nano
  reasoning: "Matched rule: Formatting"
  confidence: 0.9
  estimatedTokens: ~150
  estimatedCost: ~$0.000015
```

#### Test 1.3: Simple Rename
```yaml
input: "Rename variable 'usr' to 'user'"
expected:
  model: nano
  reasoning: "Matched rule: Simple Renames"
  confidence: 0.9
  estimatedTokens: ~250
  estimatedCost: ~$0.000025
```

#### Test 1.4: Config File Edit
```yaml
input: "Update port number in config"
fileName: "config.json"
expected:
  model: nano
  reasoning: "Matched rule: Configuration Files"
  confidence: 0.9
  estimatedTokens: ~300
  estimatedCost: ~$0.00003
```

### 2. Basic Tasks → Micro Tier

#### Test 2.1: Add Comments
```yaml
input: "Add comments to explain this function"
fileContent: "function calculate(a, b) { return a * b + 10; }"
expected:
  model: micro
  reasoning: "Matched rule: Add Comments"
  confidence: 0.9
  estimatedTokens: ~400
  estimatedCost: ~$0.0004
```

#### Test 2.2: Write Simple Test
```yaml
input: "Write a unit test for the login function"
fileName: "auth.test.js"
expected:
  model: micro
  reasoning: "Matched rule: Test Files"
  confidence: 0.9
  estimatedTokens: ~800
  estimatedCost: ~$0.0008
```

#### Test 2.3: Documentation Update
```yaml
input: "Update the API documentation for the new endpoint"
fileName: "API.md"
expected:
  model: micro
  reasoning: "Matched rule: Documentation"
  confidence: 0.9
  estimatedTokens: ~1000
  estimatedCost: ~$0.001
```

#### Test 2.4: PM Task List
```yaml
input: "[PM] List all the tasks for next sprint"
expected:
  model: nano
  reasoning: "Matched rule: Simple PM Tasks"
  confidence: 0.9
  estimatedTokens: ~600
  estimatedCost: ~$0.00006
```

### 3. Standard Tasks → Standard Tier

#### Test 3.1: Feature Implementation
```yaml
input: "[DEVELOPER] Implement user profile picture upload"
expected:
  model: standard
  reasoning: "Standard complexity - using default model"
  confidence: 0.7
  estimatedTokens: ~2000
  estimatedCost: ~$0.02
```

#### Test 3.2: API Endpoint
```yaml
input: "Create REST API endpoint for fetching user statistics"
expected:
  model: standard
  reasoning: "Matched rule: API Development"
  confidence: 0.7
  estimatedTokens: ~1500
  estimatedCost: ~$0.015
```

#### Test 3.3: React Component
```yaml
input: "Build a responsive navigation component"
fileName: "Navigation.tsx"
expected:
  model: standard
  reasoning: "Matched rule: Frontend Components"
  confidence: 0.7
  estimatedTokens: ~1800
  estimatedCost: ~$0.018
```

#### Test 3.4: Database Query
```yaml
input: "Write SQL query to find top performing athletes"
fileContent: "SELECT * FROM athletes..."
expected:
  model: standard
  reasoning: "Matched rule: Database Operations"
  confidence: 0.7
  estimatedTokens: ~1200
  estimatedCost: ~$0.012
```

### 4. Complex Tasks → Power Tier

#### Test 4.1: Architecture Design
```yaml
input: "[ARCHITECT] Design microservices architecture for video processing"
expected:
  model: power
  reasoning: "Matched rule: Architecture Mode"
  confidence: 0.9
  estimatedTokens: ~3000
  estimatedCost: ~$0.30
```

#### Test 4.2: Security Audit
```yaml
input: "Perform security audit on authentication system"
expected:
  model: power
  reasoning: "Matched rule: Security Analysis"
  confidence: 0.9
  estimatedTokens: ~2500
  estimatedCost: ~$0.25
```

#### Test 4.3: Performance Optimization
```yaml
input: "Optimize database queries for 10x performance improvement"
expected:
  model: power
  reasoning: "Matched rule: Performance Optimization"
  confidence: 0.9
  estimatedTokens: ~2000
  estimatedCost: ~$0.20
```

#### Test 4.4: System Design
```yaml
input: "Design distributed caching system for 1M concurrent users"
expected:
  model: power
  reasoning: "Matched rule: System Design"
  confidence: 0.9
  estimatedTokens: ~4000
  estimatedCost: ~$0.40
```

### 5. Ultra Tasks → Ultra Tier

#### Test 5.1: Massive Context
```yaml
input: "Analyze this entire codebase and suggest architectural improvements"
fileContent: "[25000 tokens of code]"
expected:
  model: ultra
  reasoning: "High complexity or large context requires powerful model"
  confidence: 0.7
  estimatedTokens: ~26000
  estimatedCost: ~$26.00
```

#### Test 5.2: Bleeding Edge
```yaml
input: "Implement quantum-resistant encryption algorithm"
expected:
  model: power  # Would upgrade to ultra if complexity score > 0.9
  reasoning: "architecture tasks benefit from advanced reasoning"
  confidence: 0.7
  estimatedTokens: ~3000
  estimatedCost: ~$0.30
```

### 6. Edge Cases & Special Scenarios

#### Test 6.1: Urgent Simple Task
```yaml
input: "URGENT: Fix typo in production homepage"
expected:
  model: micro  # Upgraded from nano due to urgency
  reasoning: "Urgent but simple - using fast model"
  confidence: 0.7
  estimatedTokens: ~200
  estimatedCost: ~$0.0002
```

#### Test 6.2: Mode Override
```yaml
input: "[OPERATOR] Check server status"
expected:
  model: nano
  reasoning: "Matched rule: Quick Operator Tasks"
  confidence: 0.9
  estimatedTokens: ~300
  estimatedCost: ~$0.00003
```

#### Test 6.3: Explicit Model Request
```yaml
input: "!power Explain why the server is slow"
expected:
  model: power
  reasoning: "Explicit model request override"
  confidence: 1.0
  estimatedTokens: ~1000
  estimatedCost: ~$0.10
```

#### Test 6.4: Cost Limit Downgrade
```yaml
input: "Design new authentication system"
context:
  hourlyCostSoFar: 9.50
  hourlyLimit: 10.00
expected:
  model: standard  # Downgraded from power
  reasoning: "System Design tasks benefit from advanced reasoning (downgraded due to cost limits)"
  confidence: 0.7
  estimatedTokens: ~2000
  estimatedCost: ~$0.02
```

### 7. Domain-Specific Tests

#### Test 7.1: Infrastructure Task
```yaml
input: "Set up Docker container for the application"
expected:
  model: standard
  reasoning: "Standard complexity - using default model"
  confidence: 0.7
  domain: "infrastructure"
  estimatedTokens: ~1500
  estimatedCost: ~$0.015
```

#### Test 7.2: Frontend Styling
```yaml
input: "Style the button with Tailwind classes"
fileName: "Button.tsx"
expected:
  model: standard
  reasoning: "Matched rule: Frontend Components"
  confidence: 0.7
  domain: "frontend"
  estimatedTokens: ~800
  estimatedCost: ~$0.008
```

#### Test 7.3: Testing Task
```yaml
input: "Write integration tests for user registration"
fileName: "registration.test.ts"
expected:
  model: micro
  reasoning: "Matched rule: Test Files"
  confidence: 0.9
  domain: "testing"
  estimatedTokens: ~1200
  estimatedCost: ~$0.0012
```

### 8. Learning System Tests

#### Test 8.1: Similar Task Recognition
```yaml
input: "Fix typo in documentation"
historicalData:
  - task: "Fix typo in README"
    model: nano
    qualityScore: 0.95
    actualCost: 0.00002
  - task: "Fix spelling error"
    model: nano
    qualityScore: 0.98
    actualCost: 0.00001
expected:
  model: nano
  reasoning: "Learning system suggests nano based on 2 similar tasks"
  confidence: 0.85
```

#### Test 8.2: Quality-Based Upgrade
```yaml
input: "Refactor authentication module"
historicalData:
  - task: "Refactor user module"
    model: standard
    qualityScore: 0.4  # Poor quality
  - task: "Refactor payment module"
    model: power
    qualityScore: 0.9  # Good quality
expected:
  model: power
  reasoning: "Learning system suggests power based on quality/cost ratio"
  confidence: 0.85
```

## Regression Test Execution

### How to Run Tests
```typescript
import { ModelRouter } from './model-router';
import { testSuite } from './router-test-suite';

const router = new ModelRouter();

for (const test of testSuite) {
  const result = await router.route(test.input);
  assert(result.model === test.expected.model);
  assert(result.confidence >= test.expected.confidence - 0.1);
}
```

### Expected Pass Rate
- Rule-based tests: 100% (deterministic)
- Smart routing tests: 90%+ (heuristic)
- Learning tests: 80%+ (adaptive)

### Cost Audit Metrics
```yaml
Total Test Suite Execution:
  Tests: 40
  Total Estimated Cost: ~$28.15
  Average Cost per Test: ~$0.70
  
  By Tier:
    Nano: 8 tests, ~$0.00024 total
    Micro: 7 tests, ~$0.005 total  
    Standard: 12 tests, ~$0.18 total
    Power: 12 tests, ~$1.95 total
    Ultra: 1 test, ~$26.00 total
```

## Continuous Improvement

### Monthly Review
1. Run all tests
2. Compare actual vs expected costs
3. Identify misrouted tasks
4. Update rules based on findings

### Quality Tracking
```sql
-- Find tests with poor quality scores
SELECT test_name, model_used, quality_score
FROM test_results
WHERE quality_score < 0.7
ORDER BY quality_score ASC;

-- Find cost optimization opportunities  
SELECT test_name, 
       expected_model, 
       actual_model,
       expected_cost,
       actual_cost,
       (actual_cost - expected_cost) as cost_diff
FROM test_results
WHERE actual_cost > expected_cost * 1.5
ORDER BY cost_diff DESC;
```

### Adding New Tests
When adding new features or encountering new patterns:
1. Create test case with expected routing
2. Run through router
3. Verify outcome
4. Add to regression suite
5. Update rules if needed

## Conclusion

This test suite ensures our AI routing system maintains quality while optimizing costs. Regular execution catches routing drift and identifies optimization opportunities. 