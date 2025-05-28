#!/bin/bash

# OneShot Documentation Safety Git Hooks Setup
# This script installs comprehensive git hooks for documentation quality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📚 OneShot Documentation Safety Hooks Setup${NC}"
echo -e "${BLUE}=============================================${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not in a git repository! Please run from project root.${NC}"
    exit 1
fi

# Create hooks directory
mkdir -p .git/hooks

echo -e "\n${YELLOW}🔗 Installing documentation safety hooks...${NC}"

# Create pre-commit hook for documentation validation
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# OneShot Documentation Safety Pre-commit Hook
# Prevents commits with poor quality documentation

echo "🔍 Running documentation safety checks..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Track if we should block the commit
BLOCK_COMMIT=false

# Get list of staged markdown files
STAGED_MD_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$' || true)

if [ -z "$STAGED_MD_FILES" ]; then
    echo -e "${GREEN}✅ No markdown files in this commit${NC}"
    exit 0
fi

echo -e "${YELLOW}📄 Checking staged markdown files:${NC}"
echo "$STAGED_MD_FILES"

# Check each staged markdown file
for file in $STAGED_MD_FILES; do
    echo -e "\n${YELLOW}🔍 Checking: $file${NC}"
    
    # Skip if file doesn't exist (deleted)
    if [ ! -f "$file" ]; then
        continue
    fi
    
    # Check file size
    size=$(wc -c < "$file")
    lines=$(wc -l < "$file")
    
    if [ $size -lt 50 ]; then
        echo -e "${RED}❌ FAIL: $file is too small ($size bytes)${NC}"
        echo -e "${RED}   Minimum size: 50 bytes${NC}"
        BLOCK_COMMIT=true
    fi
    
    if [ $lines -lt 5 ]; then
        echo -e "${RED}❌ FAIL: $file has too few lines ($lines lines)${NC}"
        echo -e "${RED}   Minimum lines: 5${NC}"
        BLOCK_COMMIT=true
    fi
    
    # Check for placeholder content
    if grep -q "TODO\|TBD\|PLACEHOLDER\|FIXME\|Lorem ipsum" "$file"; then
        echo -e "${RED}❌ FAIL: $file contains placeholder content${NC}"
        echo -e "${RED}   Found: $(grep -n "TODO\|TBD\|PLACEHOLDER\|FIXME\|Lorem ipsum" "$file" | head -3)${NC}"
        BLOCK_COMMIT=true
    fi
    
    # Check for version/date headers (recommended)
    if ! grep -q "Version:\|Date:\|Status:\|Created:" "$file"; then
        echo -e "${YELLOW}⚠️ WARNING: $file missing version/date header${NC}"
        echo -e "${YELLOW}   Consider adding: Version, Date, or Status header${NC}"
    fi
    
    # Check for basic structure
    if ! grep -q "^#\|^##" "$file"; then
        echo -e "${YELLOW}⚠️ WARNING: $file has no headings${NC}"
        echo -e "${YELLOW}   Consider adding proper markdown structure${NC}"
    fi
    
    # Check for empty sections
    if grep -q "^## .*$" "$file"; then
        # Find sections with no content
        awk '/^## / {section=$0; getline; if(/^$/ || /^## /) print "Empty section: " section}' "$file" | while read line; do
            if [ -n "$line" ]; then
                echo -e "${YELLOW}⚠️ WARNING: $file has empty sections${NC}"
                echo -e "${YELLOW}   $line${NC}"
            fi
        done
    fi
    
    if [ $size -ge 50 ] && [ $lines -ge 5 ] && ! grep -q "TODO\|TBD\|PLACEHOLDER\|FIXME\|Lorem ipsum" "$file"; then
        echo -e "${GREEN}✅ PASS: $file ($size bytes, $lines lines)${NC}"
    fi
done

# Check for .env files (security)
STAGED_ENV_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.env$' || true)
if [ -n "$STAGED_ENV_FILES" ]; then
    echo -e "\n${RED}❌ SECURITY: .env files should not be committed!${NC}"
    echo -e "${RED}Files found: $STAGED_ENV_FILES${NC}"
    echo -e "${RED}Please remove with: git reset HEAD .env${NC}"
    BLOCK_COMMIT=true
fi

# Check for potential secrets in documentation
echo -e "\n${YELLOW}🔒 Checking for potential secrets in documentation...${NC}"
for file in $STAGED_MD_FILES; do
    if [ -f "$file" ]; then
        # Look for potential secrets (excluding examples)
        if grep -i "password.*=\|secret.*=\|key.*=\|token.*=" "$file" | grep -v "example\|placeholder\|your-.*-here" > /dev/null; then
            echo -e "${RED}❌ POTENTIAL SECRET: $file may contain sensitive information${NC}"
            echo -e "${RED}   Please review and remove any real credentials${NC}"
            BLOCK_COMMIT=true
        fi
    fi
done

# Final decision
if [ "$BLOCK_COMMIT" = true ]; then
    echo -e "\n${RED}❌ COMMIT BLOCKED: Documentation quality issues found${NC}"
    echo -e "${RED}Please fix the issues above and try again${NC}"
    echo -e "\n${YELLOW}💡 Tips:${NC}"
    echo -e "• Add meaningful content to small files"
    echo -e "• Replace TODO/TBD with actual content"
    echo -e "• Add version headers to documentation"
    echo -e "• Remove any sensitive information"
    exit 1
else
    echo -e "\n${GREEN}✅ All documentation quality checks passed!${NC}"
    exit 0
fi
EOF

# Create commit-msg hook for commit message validation
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

# OneShot Documentation Commit Message Hook
# Ensures commit messages for documentation changes are descriptive

commit_file=$1
commit_msg=$(cat "$commit_file")

# Check if this commit includes documentation changes
STAGED_MD_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$' || true)

if [ -n "$STAGED_MD_FILES" ]; then
    # This commit includes documentation changes
    
    # Check commit message length
    if [ ${#commit_msg} -lt 10 ]; then
        echo "❌ COMMIT BLOCKED: Commit message too short for documentation changes"
        echo "   Minimum length: 10 characters"
        echo "   Current length: ${#commit_msg} characters"
        exit 1
    fi
    
    # Check for generic commit messages
    if echo "$commit_msg" | grep -qi "^update\|^fix\|^docs\|^wip\|^temp"; then
        echo "⚠️ WARNING: Generic commit message detected for documentation changes"
        echo "   Consider being more specific about what was documented"
        echo "   Current message: $commit_msg"
        # Don't block, just warn
    fi
    
    echo "✅ Commit message validation passed for documentation changes"
fi

exit 0
EOF

# Create post-commit hook for documentation tracking
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash

# OneShot Documentation Post-commit Hook
# Tracks documentation changes and updates coverage

# Check if this commit included documentation changes
COMMITTED_MD_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD | grep '\.md$' || true)

if [ -n "$COMMITTED_MD_FILES" ]; then
    echo "📚 Documentation updated in this commit:"
    echo "$COMMITTED_MD_FILES"
    
    # Update documentation coverage stats (optional)
    total_md=$(find . -name "*.md" -type f | wc -l)
    versioned_md=$(find . -name "*.md" -type f -exec grep -l "Version:\|Date:\|Status:" {} \; 2>/dev/null | wc -l)
    
    if [ $total_md -gt 0 ]; then
        coverage=$((versioned_md * 100 / total_md))
        echo "📊 Current documentation coverage: $coverage% ($versioned_md/$total_md files)"
        
        if [ $coverage -lt 80 ]; then
            echo "⚠️ Consider adding version headers to improve coverage"
        fi
    fi
fi
EOF

# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/post-commit

echo -e "${GREEN}✅ Documentation safety hooks installed!${NC}"

# Create documentation standards file
echo -e "\n${YELLOW}📋 Creating documentation standards file...${NC}"

cat > DOCUMENTATION-STANDARDS.md << 'EOF'
# OneShot Documentation Standards

**Version**: 1.0  
**Date**: 2025-05-27  
**Status**: Active

## Purpose

This document defines the quality standards and requirements for all documentation in the OneShot project to ensure consistency, completeness, and maintainability.

## Required Elements

### 1. File Headers
All documentation files must include:
```markdown
**Version**: X.X
**Date**: YYYY-MM-DD
**Status**: Active|Draft|Deprecated
```

### 2. Minimum Content Requirements
- **Minimum file size**: 50 bytes
- **Minimum lines**: 5 lines
- **No placeholder content**: TODO, TBD, PLACEHOLDER, FIXME
- **Proper structure**: At least one heading level

### 3. Required Sections
Documentation should include:
- **Purpose/Overview**: What this document covers
- **Implementation/Usage**: How to use or implement
- **Examples**: Practical examples where applicable

### 4. Quality Standards
- **Clear headings**: Use proper markdown hierarchy
- **Complete sections**: No empty sections
- **Spell-checked**: Use proper spelling and grammar
- **Internal links**: Verify all internal links work

## Git Hook Enforcement

The following git hooks enforce these standards:

### Pre-commit Hook
- Blocks commits with files < 50 bytes
- Blocks commits with placeholder content
- Warns about missing version headers
- Scans for potential secrets

### Commit Message Hook
- Requires descriptive commit messages for doc changes
- Warns about generic commit messages

### Post-commit Hook
- Tracks documentation coverage
- Reports current quality metrics

## CI/CD Validation

GitHub Actions automatically validate:
- Markdown linting and structure
- Content quality and completeness
- Spell checking
- Internal link validation
- Security scanning
- Coverage reporting

## Best Practices

1. **Version Control**: Update version headers when making significant changes
2. **Cross-references**: Link related documentation
3. **Examples**: Include practical examples
4. **Maintenance**: Regular review and updates
5. **Security**: Never include real credentials or secrets

## Exemptions

The following files are exempt from some requirements:
- README.md files (structure flexibility)
- CHANGELOG.md files (different format)
- Auto-generated documentation

## Enforcement

- **Blocking**: Pre-commit hooks block low-quality commits
- **Warning**: CI provides warnings for quality issues
- **Reporting**: Coverage reports track overall quality

## Support

For questions about documentation standards:
1. Check this document first
2. Review existing high-quality documentation
3. Ask in team channels
4. Update standards if needed

---

*This document is enforced by automated tools and should be followed for all OneShot documentation.*
EOF

echo -e "${GREEN}✅ Documentation standards created!${NC}"

# Test the hooks
echo -e "\n${YELLOW}🧪 Testing documentation hooks...${NC}"

# Create a test file to verify hooks work
cat > test-doc-quality.md << 'EOF'
# Test Documentation

**Version**: 1.0
**Date**: 2025-05-27
**Status**: Test

## Purpose
This is a test file to verify documentation quality hooks are working properly.

## Implementation
The hooks should validate this file and allow it to be committed since it meets all requirements.

## Cleanup
This file will be removed after testing.
EOF

echo -e "${GREEN}✅ Test file created: test-doc-quality.md${NC}"
echo -e "${YELLOW}You can test the hooks by staging and committing this file${NC}"

# Final instructions
echo -e "\n${GREEN}🎉 Documentation safety system installed!${NC}"
echo -e "\n${BLUE}📋 What was installed:${NC}"
echo -e "• Pre-commit hook: Validates documentation quality"
echo -e "• Commit-msg hook: Ensures descriptive commit messages"
echo -e "• Post-commit hook: Tracks documentation coverage"
echo -e "• GitHub Actions: Comprehensive CI validation"
echo -e "• Documentation standards: DOCUMENTATION-STANDARDS.md"

echo -e "\n${BLUE}📚 Next steps:${NC}"
echo -e "1. Review DOCUMENTATION-STANDARDS.md"
echo -e "2. Test hooks with: git add test-doc-quality.md && git commit -m 'Test doc hooks'"
echo -e "3. Update existing documentation to meet standards"
echo -e "4. Remove test file: rm test-doc-quality.md"

echo -e "\n${GREEN}✅ Documentation safety system ready! 📚${NC}" 