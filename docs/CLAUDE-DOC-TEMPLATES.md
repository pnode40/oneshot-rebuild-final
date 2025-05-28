# Claude Documentation Generation Templates

**Version**: 1.0  
**Date**: 2025-05-27  
**Status**: Active

## Purpose

This document provides standardized prompt templates for Claude to ensure consistent, complete, and high-quality documentation generation across the OneShot project.

## Core Principles

1. **Context-Aware**: Always check existing documentation before generating
2. **Complete**: No empty sections, placeholders, or TODO items
3. **Versioned**: Include proper version headers
4. **Structured**: Follow consistent markdown structure
5. **Actionable**: Include verification steps and examples

## Template Categories

### 1. Feature Documentation Template

```markdown
PROMPT TEMPLATE: Feature Documentation

You are documenting a new feature for OneShot. Follow this exact structure:

**Required Header:**
```
# [Feature Name]

**Version**: X.X
**Date**: YYYY-MM-DD
**Status**: Active|Draft|Deprecated
**Author**: Claude 3.7 Max
```

**Required Sections:**
1. ## Purpose
   - What this feature does
   - Why it was built
   - Who uses it

2. ## Implementation
   - Technical details
   - Code examples
   - API endpoints (if applicable)

3. ## Usage
   - Step-by-step instructions
   - Screenshots or examples
   - Common use cases

4. ## Verification Steps
   - Numbered steps to test the feature
   - Expected outcomes
   - Troubleshooting

5. ## Standards Applied
   - Design patterns used
   - Security considerations
   - Performance implications

6. ## Quality Check
   - Edge cases handled
   - Known limitations
   - Future improvements

**Validation Rules:**
- Minimum 200 words
- No TODO, TBD, PLACEHOLDER content
- Include at least 3 verification steps
- Add code examples where applicable
- Cross-reference related documentation
```

### 2. API Documentation Template

```markdown
PROMPT TEMPLATE: API Documentation

You are documenting an API endpoint for OneShot. Follow this exact structure:

**Required Header:**
```
# API: [Endpoint Name]

**Version**: X.X
**Date**: YYYY-MM-DD
**Status**: Active
**Endpoint**: [HTTP_METHOD] /api/path
```

**Required Sections:**
1. ## Overview
   - Purpose of the endpoint
   - Authentication requirements
   - Rate limiting

2. ## Request Format
   ```typescript
   interface RequestBody {
     // Complete TypeScript interface
   }
   ```

3. ## Response Format
   ```typescript
   interface ResponseBody {
     // Complete TypeScript interface
   }
   ```

4. ## Examples
   - Request example with curl
   - Response example (success)
   - Error response examples

5. ## Error Codes
   - All possible HTTP status codes
   - Error message formats
   - Troubleshooting guide

6. ## Implementation Notes
   - Database queries involved
   - Business logic
   - Security considerations

**Validation Rules:**
- Include complete TypeScript interfaces
- Provide working curl examples
- Document all error scenarios
- Include authentication details
- Add rate limiting information
```

### 3. Infrastructure Documentation Template

```markdown
PROMPT TEMPLATE: Infrastructure Documentation

You are documenting infrastructure for OneShot. Follow this exact structure:

**Required Header:**
```
# Infrastructure: [Component Name]

**Version**: X.X
**Date**: YYYY-MM-DD
**Status**: Active
**Environment**: Development|Staging|Production
```

**Required Sections:**
1. ## Architecture Overview
   - System components
   - Data flow
   - Dependencies

2. ## Setup Instructions
   - Prerequisites
   - Installation steps
   - Configuration

3. ## Operations
   - Start/stop procedures
   - Monitoring
   - Maintenance tasks

4. ## Troubleshooting
   - Common issues
   - Diagnostic commands
   - Resolution steps

5. ## Security
   - Access controls
   - Secrets management
   - Compliance requirements

6. ## Disaster Recovery
   - Backup procedures
   - Recovery steps
   - RTO/RPO targets

**Validation Rules:**
- Include architecture diagrams (ASCII or links)
- Provide complete setup commands
- Document all environment variables
- Include monitoring endpoints
- Add security checklist
```

### 4. Process Documentation Template

```markdown
PROMPT TEMPLATE: Process Documentation

You are documenting a process for OneShot. Follow this exact structure:

**Required Header:**
```
# Process: [Process Name]

**Version**: X.X
**Date**: YYYY-MM-DD
**Status**: Active
**Owner**: [Team/Role]
```

**Required Sections:**
1. ## Purpose
   - What this process achieves
   - When to use it
   - Who is responsible

2. ## Prerequisites
   - Required access/permissions
   - Tools needed
   - Knowledge requirements

3. ## Step-by-Step Procedure
   - Numbered steps
   - Decision points
   - Validation checkpoints

4. ## Examples
   - Real-world scenarios
   - Sample inputs/outputs
   - Common variations

5. ## Quality Assurance
   - Verification steps
   - Success criteria
   - Rollback procedures

6. ## Automation
   - Automated components
   - Manual overrides
   - Future automation plans

**Validation Rules:**
- Include clear decision trees
- Provide example scenarios
- Add verification checkpoints
- Document rollback procedures
- Include automation status
```

## Quality Enforcement Rules

### Pre-Generation Checklist

Before generating any documentation, Claude must:

1. **Check Existing Docs**: Search for related documentation
2. **Verify Context**: Understand the current system state
3. **Confirm Scope**: Clarify what needs to be documented
4. **Select Template**: Choose appropriate template
5. **Gather Information**: Collect all necessary details

### Post-Generation Validation

After generating documentation, Claude must verify:

1. **Completeness**: All required sections present
2. **Accuracy**: Technical details are correct
3. **Consistency**: Follows project standards
4. **Actionability**: Includes verification steps
5. **Quality**: No placeholders or empty sections

### Content Quality Standards

All generated documentation must:

- **Be immediately usable** by the target audience
- **Include working examples** where applicable
- **Provide verification steps** for testing
- **Cross-reference** related documentation
- **Follow security best practices**
- **Include proper error handling**

## Template Usage Examples

### Example 1: Feature Documentation

```
USER: Document the new OG image generation feature

CLAUDE RESPONSE:
# OG Image Generation System

**Version**: 1.0
**Date**: 2025-05-27
**Status**: Active
**Author**: Claude 3.7 Max

## Purpose
The OG Image Generation System creates professional social media images for athlete profiles...
[Complete documentation following template]
```

### Example 2: API Documentation

```
USER: Document the /api/v1/profiles endpoint

CLAUDE RESPONSE:
# API: Profile Management

**Version**: 1.0
**Date**: 2025-05-27
**Status**: Active
**Endpoint**: GET /api/v1/profiles

## Overview
This endpoint retrieves athlete profile information...
[Complete documentation following template]
```

## Continuous Improvement

### Template Updates

Templates should be updated when:
- New documentation patterns emerge
- Quality issues are identified
- User feedback suggests improvements
- Technology stack changes

### Feedback Loop

1. **Monitor**: Track documentation quality metrics
2. **Analyze**: Identify common issues or gaps
3. **Update**: Revise templates based on findings
4. **Validate**: Test updated templates
5. **Deploy**: Roll out improvements

## Integration with Tools

### Git Hooks Integration

Templates work with git hooks to:
- Validate generated documentation
- Enforce quality standards
- Prevent incomplete commits

### CI/CD Integration

Templates integrate with GitHub Actions to:
- Automatically validate structure
- Check for required sections
- Generate quality reports

### AI Model Integration

Templates ensure:
- Consistent output across AI sessions
- Proper context preservation
- Quality maintenance over time

---

## Usage Instructions for Claude

When asked to generate documentation:

1. **Identify the type** of documentation needed
2. **Select the appropriate template** from above
3. **Follow the template structure exactly**
4. **Include all required sections**
5. **Validate against quality standards**
6. **Provide complete, actionable content**

**Remember**: Never generate incomplete documentation. If information is missing, ask for clarification rather than using placeholders.

---

*These templates ensure OneShot maintains world-class documentation standards across all AI-generated content.* 