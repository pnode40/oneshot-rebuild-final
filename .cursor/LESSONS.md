# LESSONS.md — Continuous Improvement Log

This document tracks lessons learned, improvements made, and patterns to follow or avoid based on project experience. Each entry should include what was learned, why it matters, and how to implement the improvement going forward.

---

## Lesson Template

**Date:** YYYY-MM-DD  
**Category:** [Code | Architecture | Process | Documentation]  
**Issue:** Brief description of the problem or challenge  
**Solution:** How it was resolved  
**Pattern to Follow:** What practice should be adopted  
**Pattern to Avoid:** What practice should be discontinued  
**Impact:** How this improves the project  
**Added to Rules:** Yes/No (with rule reference if applicable)  

---

## Example: Standardized API Error Handling

**Date:** 2025-05-08  
**Category:** Code  
**Issue:** Inconsistent error handling across API endpoints led to unpredictable client behavior  
**Solution:** Implemented global error middleware with standardized error format  
**Pattern to Follow:** Use centralized error handling middleware and consistent error response structure  
**Pattern to Avoid:** Handling errors differently across endpoints or returning raw error messages  
**Impact:** Frontend can reliably parse error responses; improved debugging and user experience  
**Added to Rules:** Yes, in api-standards.mdc under Error Handling section  

---

## Recent Lessons

## Lesson: Cursor Rules Implementation Strategy

**Date:** 2025-05-09  
**Category:** Process  
**Issue:** Implementing a comprehensive rules system while ensuring proper integration with existing documentation and avoiding overwhelming context  

**Solution:** Created a hierarchical rule structure with layered application (global, domain, utility) and careful metadata management

**Pattern to Follow:** - Start with minimal global rules (3-5 core principles)
- Use glob patterns to target specific file contexts
- Create self-documenting rule files with examples
- Implement progressive loading via references rather than content duplication

**Pattern to Avoid:** - Creating overlapping rules that might conflict
- Making rules too verbose (caused PowerShell script issues)
- Placing too much logic in always-apply rules (context efficiency)
- Relying on exact paths in glob patterns (fragile)

**Impact:** - Rules now provide consistent guidance with minimal context overhead
- Verification steps are standardized across all implementations
- Documentation is connected to enforcement mechanisms
- System scales with project growth through modular design

**Added to Rules:** Yes, principles have been embedded in rule structure itself

**Suggested Improvements:**
1. Create a simple rule validator script to check formatting
2. Document rule precedence explicitly for future reference
3. Consider implementing a visualization of which rules apply to which files
4. Create a mechanism to track which rules are most frequently triggered