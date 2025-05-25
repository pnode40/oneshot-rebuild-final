# OneShot AI Development - Prompt Templates

**Track**: A (Official Mainline)  
**Version**: 1.0  
**Created**: May 23, 2025  
**Authority**: AI Development Team Standards  
**Purpose**: Standardized prompt formats for ChatGPT → Claude task coordination

---

## 🎯 PROMPT TEMPLATE OVERVIEW

### Template Purpose
These templates ensure consistent, clear communication between ChatGPT (Prompt Engineer) and Claude (Developer), reducing ambiguity and improving implementation success rates.

### Template Categories
1. **Feature Implementation** - New functionality development
2. **Bug Fix Tasks** - Addressing existing issues
3. **Testing & Quality** - Test creation and quality improvements
4. **Refactoring** - Code improvement without behavior changes
5. **Documentation** - Technical documentation updates
6. **Emergency Response** - Critical issue resolution

---

## 🚀 FEATURE IMPLEMENTATION TEMPLATE

### Standard Feature Prompt Structure
```markdown
# [FEATURE] Feature Name - Implementation Task

## CONTEXT
**Feature**: [Brief description of what this feature does]
**User Story**: As a [user type], I want to [action] so that [benefit]
**Track A Context**: [Reference to existing patterns or related features]

## REQUIREMENTS
**Primary Functionality**:
- [ ] Requirement 1 with specific acceptance criteria
- [ ] Requirement 2 with measurable outcomes
- [ ] Requirement 3 with error handling specifications

**API Specification** (if applicable):
- **Endpoint**: `[METHOD] /api/path`
- **Authentication**: `requireSelfOrAdmin` middleware
- **Request Schema**: [Zod validation details]
- **Response Format**: [Expected JSON structure]

## IMPLEMENTATION DETAILS
**Files to Modify/Create**:
- `server/src/routes/api/[filename].ts` - API implementation
- `src/components/[ComponentName].tsx` - Frontend component (if needed)
- `server/src/routes/api/[filename].test.ts` - Jest tests

**Required Patterns**:
- Follow [specific .mdc rule reference]
- Use existing [pattern name] from [reference file]
- Implement error handling per Safety Protocol

**Database Operations** (if applicable):
- Table: `[tableName]`
- Operations: CREATE/READ/UPDATE/DELETE
- Relationships: [foreign key details]

## TESTING REQUIREMENTS
**Success Cases**:
- [ ] Valid input with expected output
- [ ] Authentication/authorization success
- [ ] Database operations complete correctly

**Error Cases**:
- [ ] Invalid input validation
- [ ] Unauthorized access blocked
- [ ] Database error handling

**Edge Cases**:
- [ ] Boundary conditions
- [ ] Concurrent access scenarios
- [ ] Performance under load

## VERIFICATION STEPS
**For Eric's Manual Testing**:
1. Start development servers (backend: 3001, frontend: 5173)
2. Navigate to [specific URL or component]
3. Test [specific user interaction]
4. Verify [expected behavior]
5. Test error cases: [specific scenarios]

## SAFETY CONSIDERATIONS
**Risk Level**: [Low/Medium/High]
**Safety Protocol Reference**: [Category A/B/C/D from Safety Protocol]
**Rollback Plan**: [How to undo if issues arise]

## SUCCESS CRITERIA
- [ ] Feature works as specified in requirements
- [ ] All tests pass (Jest + manual verification)
- [ ] No existing functionality broken
- [ ] Documentation updated appropriately
- [ ] Eric's verification checklist passes
```

### Example: Video Link Feature Prompt
```markdown
# [FEATURE] Video Link Upload - PATCH Endpoint Implementation

## CONTEXT
**Feature**: Allow athletes to edit video link titles and URLs
**User Story**: As an athlete, I want to edit my video link details so that I can keep my profile current
**Track A Context**: Extends existing video link CRUD from Sprint-B-002 migration

## REQUIREMENTS
**Primary Functionality**:
- [ ] Update video link title (1-100 characters)
- [ ] Update video link URL (valid URL format)
- [ ] Maintain ownership restrictions (self or admin only)

**API Specification**:
- **Endpoint**: `PATCH /api/media/:mediaItemId`
- **Authentication**: `requireSelfOrAdmin` middleware
- **Request Schema**: `{ title?: string, url?: string }`
- **Response Format**: `{ success: boolean, message: string }`

## IMPLEMENTATION DETAILS
**Files to Modify/Create**:
- `server/src/routes/api/media.ts` - Add PATCH endpoint
- `server/src/routes/api/media.test.ts` - Comprehensive tests

**Required Patterns**:
- Follow 2-domain/api/api-standards.mdc
- Use existing Drizzle ORM patterns
- Implement Zod validation per validation-standards.mdc

**Database Operations**:
- Table: `mediaItem`
- Operations: UPDATE with WHERE clause
- Relationships: Foreign key to `user.id`

[Continue with testing, verification, safety sections...]
```

---

## 🐛 BUG FIX TEMPLATE

### Standard Bug Fix Prompt Structure
```markdown
# [BUGFIX] Bug Title - Resolution Task

## BUG CONTEXT
**Issue Description**: [Clear description of what's broken]
**Reproduction Steps**:
1. Step 1 to reproduce
2. Step 2 to reproduce
3. Expected vs actual behavior

**Impact Assessment**: [Low/Medium/High/Critical]
**Affected Users**: [Who experiences this bug]

## ROOT CAUSE ANALYSIS
**Problem Location**: [File and function where bug exists]
**Why It Happens**: [Technical explanation of root cause]
**Related Systems**: [What else might be affected]

## SOLUTION APPROACH
**Fix Strategy**: [High-level approach to resolution]
**Files to Modify**:
- `[filepath]` - [specific changes needed]
- `[test-filepath]` - [test updates needed]

**Validation Method**: [How to confirm fix works]

## IMPLEMENTATION REQUIREMENTS
**Code Changes**:
- [ ] Fix core issue in [specific function]
- [ ] Add validation to prevent recurrence
- [ ] Update error handling if needed

**Testing Requirements**:
- [ ] Reproduce bug in test (verify it fails before fix)
- [ ] Implement fix
- [ ] Verify test passes after fix
- [ ] Add regression tests for edge cases

## VERIFICATION STEPS
**Bug Reproduction** (before fix):
1. [Steps to see the bug]
2. Confirm bug exists

**Fix Verification** (after implementation):
1. [Steps to test the fix]
2. Verify bug no longer occurs
3. Test related functionality still works

## SAFETY CONSIDERATIONS
**Risk Level**: [Assessment based on change scope]
**Regression Risk**: [What else might break]
**Rollback Plan**: [Immediate recovery if fix causes issues]

## SUCCESS CRITERIA
- [ ] Original bug no longer reproducible
- [ ] No new bugs introduced
- [ ] All existing tests still pass
- [ ] New tests cover the bug scenario
```

---

## 🧪 TESTING TEMPLATE

### Test Implementation Prompt Structure
```markdown
# [TESTING] Test Suite for [Feature/Component]

## TESTING CONTEXT
**Target**: [What needs testing - API, component, function]
**Test Type**: [Unit/Integration/E2E]
**Coverage Goal**: [Percentage or specific scenarios]

## TEST CATEGORIES REQUIRED

**Success Path Tests** ✅:
- [ ] Valid input with expected output
- [ ] Authentication success scenarios
- [ ] Database operations work correctly

**Error Handling Tests** ❌:
- [ ] Invalid input validation
- [ ] Authentication failures
- [ ] Database errors and timeouts

**Edge Case Tests** 🧨:
- [ ] Boundary conditions
- [ ] Null/undefined values
- [ ] Concurrent operations

## IMPLEMENTATION REQUIREMENTS
**Test Files**:
- `[test-file-path]` - Main test suite
- `src/test/helpers/[helper].ts` - Test utilities (if needed)

**Test Structure**:
```typescript
describe('[Component/API] Name', () => {
  describe('✅ Success Cases', () => {
    it('should handle valid scenario', async () => {})
  });
  
  describe('❌ Error Cases', () => {
    it('should reject invalid input', async () => {})
  });
  
  describe('🧨 Edge Cases', () => {
    it('should handle boundary condition', async () => {})
  });
});
```

**Test Data**:
- Use test helpers from `src/test/helpers/`
- Create minimal, focused test fixtures
- Clean up after each test

## SUCCESS CRITERIA
- [ ] All test categories covered
- [ ] Tests follow naming conventions
- [ ] Test data setup/teardown works
- [ ] Coverage meets requirements
- [ ] Tests run fast and reliably
```

---

## 🔄 REFACTORING TEMPLATE

### Code Improvement Prompt Structure
```markdown
# [REFACTOR] Refactoring Task - [Component/Module Name]

## REFACTORING CONTEXT
**Current Issue**: [What's wrong with existing code]
**Improvement Goal**: [What the refactoring achieves]
**Scope**: [Specific files/functions affected]

## CURRENT STATE ANALYSIS
**Existing Pattern**: [How it works now]
**Problems**:
- Performance issue: [specific problem]
- Maintainability issue: [specific problem]
- Code duplication: [specific locations]

## TARGET STATE
**New Pattern**: [How it should work]
**Benefits**:
- Performance improvement: [expected gain]
- Code clarity: [how it's clearer]
- Reusability: [how it's more reusable]

## IMPLEMENTATION APPROACH
**Step-by-Step Plan**:
1. Ensure comprehensive test coverage exists
2. Create new implementation alongside old
3. Update tests to work with new implementation
4. Switch to new implementation
5. Remove old code

**Files to Modify**:
- `[file1]` - [specific changes]
- `[file2]` - [specific changes]

## SAFETY REQUIREMENTS
**Pre-Refactoring**:
- [ ] All existing tests pass
- [ ] Backup/branch created
- [ ] Impact assessment completed

**During Refactoring**:
- [ ] Tests continue to pass
- [ ] Behavior remains identical
- [ ] Performance monitoring active

**Post-Refactoring**:
- [ ] All tests still pass
- [ ] Manual verification completed
- [ ] Performance meets or exceeds baseline

## SUCCESS CRITERIA
- [ ] Identical functionality to before
- [ ] Improved code quality metrics
- [ ] Better performance (if applicable)
- [ ] Enhanced maintainability
- [ ] No regressions introduced
```

---

## 📚 DOCUMENTATION TEMPLATE

### Documentation Update Prompt Structure
```markdown
# [DOCS] Documentation Update - [Topic/File]

## DOCUMENTATION CONTEXT
**Target File**: `[filepath]`
**Update Type**: [New content/Update existing/Fix inaccuracies]
**Audience**: [AI team/Eric/External developers]

## CONTENT REQUIREMENTS
**Sections to Add/Update**:
- [ ] Section 1: [specific content needed]
- [ ] Section 2: [specific content needed]
- [ ] Code examples: [what to demonstrate]

**Information Sources**:
- Existing code in `[file references]`
- Previous documentation in `[file references]`
- Team decision logs and context

## DOCUMENTATION STANDARDS
**Format Requirements**:
- Follow existing document structure
- Use consistent markdown formatting
- Include practical examples
- Add cross-references to related docs

**Content Quality**:
- Accurate reflection of current system
- Clear, actionable instructions
- Updated version information
- Proper attribution and dates

## VERIFICATION STEPS
**Accuracy Check**:
1. Verify all code examples work
2. Test any procedures documented
3. Check cross-references are valid

**Completeness Check**:
1. All requirements addressed
2. No outdated information remains
3. Links and references updated

## SUCCESS CRITERIA
- [ ] Documentation reflects current system state
- [ ] Examples are tested and working
- [ ] Format consistent with existing docs
- [ ] Useful for intended audience
```

---

## 🚨 EMERGENCY RESPONSE TEMPLATE

### Critical Issue Resolution Prompt Structure
```markdown
# [EMERGENCY] Critical Issue - Immediate Response Required

## CRISIS CONTEXT
**Issue Type**: [System down/Security breach/Data loss/Performance]
**Impact Level**: [Critical/High] - Production affected
**Time Discovered**: [When issue first noticed]
**Affected Users**: [Who/how many are impacted]

## IMMEDIATE ASSESSMENT
**Symptoms Observed**:
- [ ] Specific error messages
- [ ] System behavior changes
- [ ] Performance degradation details

**Potential Causes**:
- Recent changes: [what was deployed recently]
- External factors: [infrastructure, dependencies]
- Known risks: [anticipated failure modes]

## RESPONSE PRIORITIES
**Priority 1 - Stop the Bleeding**:
- [ ] Prevent further damage
- [ ] Isolate affected systems
- [ ] Implement temporary workarounds

**Priority 2 - Restore Service**:
- [ ] Identify root cause
- [ ] Implement permanent fix
- [ ] Verify system stability

**Priority 3 - Prevent Recurrence**:
- [ ] Update monitoring
- [ ] Improve error handling
- [ ] Document lessons learned

## SAFETY PROTOCOLS
**Emergency Authority**: Eric has final decision authority
**Risk Assessment**: All changes must prevent further damage
**Communication**: Document all actions taken
**Rollback Plan**: Immediate reversion strategy if fixes fail

## SUCCESS CRITERIA
- [ ] System functionality restored
- [ ] No data loss or corruption
- [ ] Root cause identified and fixed
- [ ] Monitoring improved
- [ ] Post-mortem documentation complete
```

---

## 📋 PROMPT QUALITY CHECKLIST

### Before Sending Any Prompt to Claude
- [ ] **Context Complete** - All necessary background provided
- [ ] **Requirements Clear** - Unambiguous acceptance criteria
- [ ] **Safety Addressed** - Risk level and protocols referenced
- [ ] **Testing Specified** - Comprehensive test requirements
- [ ] **Verification Defined** - Clear success criteria for Eric
- [ ] **Files Identified** - Specific paths and modifications
- [ ] **Patterns Referenced** - Existing code and standards cited

### Template Customization Guidelines
- **Adapt to Task Size** - Atomic tasks need less detail
- **Include Context** - Reference related features and decisions
- **Specify Constraints** - Technical limitations and requirements
- **Define Success** - Measurable, verifiable outcomes
- **Address Risks** - Safety considerations and mitigation

---

## 🎯 TEMPLATE USAGE GUIDELINES

### For ChatGPT (Prompt Engineer)
1. **Choose Appropriate Template** based on task type
2. **Customize for Specific Task** with actual requirements
3. **Reference Existing Patterns** in OneShot codebase
4. **Include Safety Considerations** from current protocols
5. **Define Clear Success Criteria** for Eric's verification

### For Eric (Product Owner)
- **Review Prompts** before ChatGPT sends to Claude
- **Verify Requirements** match business needs
- **Confirm Testing Plan** meets quality standards
- **Approve Implementation Approach** for feasibility

### For Claude (Developer)
- **Follow Template Structure** when providing updates
- **Ask for Clarification** if any template section unclear
- **Reference Template Categories** when escalating issues
- **Use Template Format** for status reports and documentation

---

## 📚 REFERENCE DOCUMENTATION

### Related Files
- `docs/track-a/ClaudePersona-TrackA.md` - Claude behavioral guidelines
- `docs/track-a/Roles-and-Responsibilities.md` - AI team coordination
- `docs/track-a/System-Safety-Protocol.md` - Development safety
- `docs/track-a/Test-Strategy.md` - Testing requirements

### Template Sources
- Successful OneShot development patterns
- AI team communication best practices
- Software development industry standards
- OneShot-specific requirements and constraints

---

**Last Updated**: May 23, 2025  
**Next Review**: After template effectiveness assessment  
**Status**: ✅ ACTIVE - Required for all ChatGPT → Claude coordination