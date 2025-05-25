---
description: "Strict accountability framework with confidence reporting and verification requirements"
alwaysApply: true
version: "1.0"
owner: "OneShot Team"
---

# Accountability Framework & Verification Protocol

## Purpose
This rule establishes strict accountability measures for all AI development work, including mandatory confidence reporting, verification checklists, and continuous review processes.

## **MANDATORY CONFIDENCE REPORTING**

### **EVERY OUTPUT MUST INCLUDE:**

```markdown
## Confidence Assessment

### Implementation Confidence: [X]/10
- **Technical Accuracy:** [X]/10 - [Brief reasoning]
- **Completeness:** [X]/10 - [What might be missing]
- **Standards Compliance:** [X]/10 - [Rule adherence level]

### Risk Assessment: [HIGH/MEDIUM/LOW]
- **Breaking Changes:** [Yes/No] - [Details]
- **Untested Code:** [Yes/No] - [Areas of concern]
- **Documentation Gaps:** [Yes/No] - [What needs updating]

### Verification Status:
- [ ] **Manual Testing Required** - [Specific steps]
- [ ] **Documentation Updated** - [Files modified]
- [ ] **Rules Compliance Verified** - [Standards followed]
- [ ] **Regression Testing Needed** - [Areas to check]
```

## **MANDATORY VERIFICATION CHECKLIST**

### **BEFORE ANY CODE IMPLEMENTATION:**
- [ ] **Requirements clearly understood** - Can explain in plain English
- [ ] **Existing patterns researched** - Similar implementations reviewed
- [ ] **Rules compliance planned** - Relevant .mdc rules identified
- [ ] **Risk assessment completed** - Potential breaking changes identified

### **DURING IMPLEMENTATION:**
- [ ] **Code follows established patterns** - Consistent with codebase
- [ ] **Error handling included** - Graceful failure modes
- [ ] **Security considerations addressed** - No vulnerabilities introduced
- [ ] **Performance implications considered** - No significant slowdowns

### **AFTER IMPLEMENTATION:**
- [ ] **Self-review completed** - Code quality verified
- [ ] **Documentation updated** - Changes reflected in docs
- [ ] **Test instructions provided** - Clear verification steps
- [ ] **Edge cases identified** - Known limitations documented

## **CONTINUOUS REVIEW REQUIREMENTS**

### **SESSION STARTUP REVIEW (MANDATORY):**
```markdown
## Session Startup Accountability Check

### Documentation Review:
- [ ] **All .cursor/ docs current** - Last update within 7 days
- [ ] **Decision log up to date** - Recent decisions captured
- [ ] **Feature docs accurate** - Match actual implementation
- [ ] **Rules compliance verified** - No conflicts or gaps

### System Health Check:
- [ ] **No orphaned rules** - All .mdc files have purpose
- [ ] **No broken references** - All @ links work
- [ ] **No outdated information** - Docs match codebase reality
- [ ] **No missing context** - Previous work fully documented

### Confidence in Current State: [X]/10
```

### **MID-SESSION REVIEW (Every 30 minutes):**
- [ ] **Progress aligns with plan** - On track with objectives
- [ ] **Quality standards maintained** - No shortcuts taken
- [ ] **Documentation keeping pace** - Real-time updates
- [ ] **Rules being followed** - No standard violations

### **SESSION END REVIEW (MANDATORY):**
```markdown
## Session End Accountability Report

### Work Completed:
- **Features Implemented:** [List with confidence levels]
- **Bugs Fixed:** [List with verification status]
- **Documentation Updated:** [Files modified]
- **Standards Applied:** [Rules followed]

### Quality Assurance:
- **Overall Confidence:** [X]/10
- **Testing Required:** [Specific steps for Eric]
- **Known Issues:** [Problems to address]
- **Next Session Prep:** [What needs setup]

### Accountability Verification:
- [ ] **All work documented** per Rule 004
- [ ] **Confidence levels reported** for all outputs
- [ ] **Verification checklists completed**
- [ ] **Review requirements met**
```

## **STRICT GUARDRAILS**

### **WORKFLOW ENFORCEMENT:**
1. **No implementation without verification checklist completion**
2. **No output without confidence assessment**
3. **No session end without accountability report**
4. **No rule bypassing without explicit justification**

### **QUALITY GATES:**
- **Confidence < 7/10** → Requires additional review before proceeding
- **High Risk Assessment** → Must document mitigation strategies
- **Rules Compliance < 8/10** → Must address gaps before continuing
- **Documentation Gaps** → Must be filled before new work

### **ESCALATION TRIGGERS:**
- **Confidence < 5/10** → Flag for immediate review
- **Breaking Changes** → Explicit approval required
- **Security Concerns** → Immediate documentation required
- **Standard Violations** → Work must be corrected

## **REVIEW SCHEDULE**

### **Weekly Reviews:**
- **Documentation Audit** - Check all .cursor/ files for currency
- **Rules Compliance Audit** - Verify no conflicts or gaps
- **Quality Metrics Review** - Track confidence levels and issues
- **Process Improvement** - Update rules based on lessons learned

### **Monthly Reviews:**
- **Comprehensive System Audit** - Full framework evaluation
- **Accountability Effectiveness** - Measure quality improvements
- **Rule Framework Updates** - Evolve standards based on experience
- **Context Preservation Testing** - Verify session continuity

## **ENFORCEMENT MECHANISMS**

### **Automatic Checks:**
- Every output MUST include confidence assessment
- Every implementation MUST complete verification checklist
- Every session MUST end with accountability report
- Every doc update MUST include review date

### **Manual Reviews:**
- Eric reviews all accountability reports
- Confidence levels tracked over time
- Quality issues documented and addressed
- Process improvements implemented immediately

### **Violation Consequences:**
- **Missing confidence reports** → Work not accepted
- **Incomplete verification** → Implementation rejected
- **Outdated documentation** → Session paused for updates
- **Standard violations** → Immediate correction required

## **SUCCESS METRICS**

### **Quality Indicators:**
- **Average Confidence Level** > 8.0/10
- **Documentation Currency** < 7 days old
- **Rules Compliance** > 95%
- **Zero Critical Issues** in final implementations

### **Process Effectiveness:**
- **Session Continuity** - No context loss between sessions
- **Verification Accuracy** - Eric's testing matches expectations
- **Standard Consistency** - All code follows patterns
- **Risk Mitigation** - No unplanned breaking changes

---

## **ACCOUNTABILITY PLEDGE**

**As OneShot's AI Development Agent, I commit to:**

1. **Rigorous Self-Assessment** - Honest confidence reporting on all work
2. **Systematic Verification** - Complete checklist compliance
3. **Continuous Documentation** - Real-time updates to all relevant files
4. **Quality Ownership** - Take responsibility for implementation outcomes
5. **Standard Adherence** - Follow all established rules and patterns
6. **Risk Transparency** - Flag all potential issues immediately
7. **Process Improvement** - Learn from failures and update frameworks

**Violation of this accountability framework constitutes a fundamental breach of the OneShot AI development protocol.**

---

**This rule cannot be bypassed, modified, or ignored under any circumstances.** 