# OneShot AI Development System - Safety Protocol

**Track**: A (Official Mainline)  
**Version**: 1.0  
**Created**: May 23, 2025  
**Authority**: Claude 4.0 Development Standards  
**Purpose**: Establish guardrails and safe practices for AI development team

---

## 🛡️ CORE SAFETY PRINCIPLES

### 1. Preservation First
- **Never break existing functionality**
- **Preserve all working code and dependencies**
- **Maintain system stability above all else**
- **When in doubt, don't modify**

### 2. Incremental Progress
- **Make one change at a time**
- **Test after each modification**
- **Document all changes made**
- **Build on proven patterns**

### 3. Zero-Risk Documentation
- **Documentation changes are always safe**
- **Content addition carries minimal risk**
- **Filling placeholder files improves AI context**
- **Knowledge preservation is critical**

---

## ✅ SAFE MODIFICATION CATEGORIES

### Category A: ZERO RISK (Always Safe)
- **Documentation files** - Adding/editing `.md` files
- **Placeholder content** - Filling empty documentation
- **Comment additions** - Adding code comments
- **README updates** - Project documentation improvements

### Category B: LOW RISK (Generally Safe)
- **New feature files** - Creating new routes/components
- **Test file additions** - Adding Jest test suites
- **Configuration additions** - Adding new config options (not modifying existing)
- **Static asset additions** - Adding images, fonts, etc.

### Category C: MEDIUM RISK (Proceed with Caution)
- **Dependency additions** - New npm packages
- **Environment variable additions** - New .env variables
- **Database migrations** - New tables/columns only
- **Route additions** - New API endpoints

### Category D: HIGH RISK (Avoid Unless Critical)
- **Existing code modifications** - Changing working functions
- **Dependency updates** - Updating package versions
- **Configuration changes** - Modifying existing config
- **Database schema changes** - Altering existing tables

### Category E: EXTREME RISK (Never Do)
- **File/directory movement** - Changing project structure
- **Import path changes** - Breaking existing references
- **Deletion of existing files** - Risk of breaking dependencies
- **Build system changes** - Modifying webpack/vite config

---

## 🚨 CRITICAL BOUNDARIES

### Files/Directories: NEVER MODIFY
```
oneshot-experimental/          # Archived Track B code
node_modules/                  # Package dependencies
.git/                         # Version control
dist/                         # Build outputs
build/                        # Build outputs
package-lock.json             # Dependency lock file
```

### Files/Directories: MODIFY WITH EXTREME CAUTION
```
package.json                  # Dependencies and scripts
.env files                   # Environment configuration
vite.config.ts               # Build configuration
drizzle.config.ts            # Database configuration
src/lib/db/                  # Database connections
```

### Files/Directories: SAFE TO MODIFY
```
docs/                        # All documentation
README.md                    # Project documentation
.cursor/rules/               # Development rules (additions only)
src/routes/                  # New API routes
src/components/              # New React components
src/test/                    # Test files
```

---

## 🔧 EMERGENCY RECOVERY PROCEDURES

### If System Breaks After Modification:

#### Step 1: Immediate Assessment
1. **Identify what was changed** in the last 30 minutes
2. **Document the error** - save error messages
3. **Note which features stopped working**
4. **Check if build process still works**

#### Step 2: Quick Recovery
1. **Revert the last change** if possible
2. **Check git status** for uncommitted changes
3. **Restore from last working state**
4. **Test basic functionality**

#### Step 3: Systematic Debugging
1. **Check server logs** (backend on port 3001)
2. **Check browser console** (frontend on port 5173)
3. **Verify database connections**
4. **Test API endpoints individually**

#### Step 4: Communication Protocol
1. **Document the incident** in decision log
2. **Update lessons learned** file
3. **Revise safety protocols** if needed
4. **Share findings with AI team**

---

## 📋 PRE-MODIFICATION CHECKLIST

### Before Making ANY Change:
- [ ] **Risk Category Assessment** - Which category does this change fall into?
- [ ] **Backup Strategy** - Can this change be easily reverted?
- [ ] **Impact Analysis** - What could this break?
- [ ] **Test Plan** - How will I verify this works?
- [ ] **Documentation** - Do I need to update docs?

### For Code Changes:
- [ ] **Follow .mdc rules** - Check all applicable development standards
- [ ] **Use established patterns** - Reference existing working code
- [ ] **Add comprehensive tests** - Jest tests for all new functionality
- [ ] **Error handling** - Handle all failure cases gracefully
- [ ] **Type safety** - Use TypeScript and Zod validation

---

## 🎯 AI DEVELOPMENT TEAM GUIDELINES

### For Claude 4.0 (Developer):
- **Always check this protocol** before making modifications
- **Start with documentation** when unsure about safety
- **Use incremental approach** for all changes
- **Test immediately** after each modification
- **Document decisions** and lessons learned

### For ChatGPT (Prompt Engineer):
- **Include safety considerations** in all prompts
- **Reference this protocol** when planning tasks
- **Break complex changes** into atomic, safe steps
- **Specify risk levels** for all proposed actions

### For Eric (Product Owner):
- **Verify using provided checklist** before approving changes
- **Check system functionality** after each implementation
- **Provide feedback** on safety protocol effectiveness
- **Update protocols** based on real-world experience

---

## 🔄 CONTINUOUS IMPROVEMENT

### Protocol Updates:
- **Update after each incident** - Learn from mistakes
- **Quarterly reviews** - Assess protocol effectiveness
- **Team feedback integration** - Incorporate lessons learned
- **Version control** - Track protocol evolution

### Success Metrics:
- **Zero system breakages** - Primary success indicator
- **Reduced recovery time** - If issues do occur
- **Improved AI confidence** - Better decision making
- **Faster development** - Safety enables speed

---

## 📚 REFERENCE DOCUMENTATION

### Related Files:
- `docs/track-a/Test-Strategy.md` - Testing requirements
- `docs/track-a/Verification-Checklist.md` - QA procedures
- `docs/OneShot-Safe-Action-Plan.md` - Current safe action plan
- `.cursor/rules/` - All development standards

### Emergency Contacts:
- **Eric** - Final authority on all changes
- **Session Logs** - Check previous Claude session summaries
- **Decision Log** - Historical decision context

---

**Last Updated**: May 23, 2025  
**Next Review**: June 2025  
**Status**: ✅ ACTIVE - All AI team members must follow