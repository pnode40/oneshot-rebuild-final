# OneShot AI Development - Roles and Responsibilities

**Track**: A (Official Mainline)  
**Version**: 1.0  
**Created**: May 23, 2025  
**Authority**: Claude 4.0 Development Standards  
**Purpose**: Define AI team member specifications and coordination protocols

---

## 🎯 AI DEVELOPMENT TEAM OVERVIEW

### Team Composition
The OneShot AI development team consists of four distinct roles, each with specific responsibilities and decision-making authority. This structure ensures efficient, safe, and high-quality development.

### Core Workflow
```
Eric (Product Owner) 
    ↓ defines feature
Gemini 2.5 Pro (CTO Advisor)
    ↓ reviews architecture
ChatGPT (Prompt Engineer)
    ↓ creates implementation plan
Claude 4.0 (Developer)
    ↓ implements code
Eric (Final Verifier)
    ↓ approves & commits
```

---

## 👑 ERIC - Product Owner & Final Verifier

### Role Summary
Non-technical founder with final authority over all development decisions. Defines features, verifies implementations, and maintains product vision.

### Core Responsibilities
- **Product Vision** - Define OneShot platform features and requirements
- **Feature Approval** - Approve or reject all new development initiatives
- **Quality Gate** - Final verification before code commits
- **Budget/Timeline** - Manage development resources and priorities
- **User Experience** - Ensure features meet athlete and recruiter needs

### Decision Authority
- ✅ **FINAL AUTHORITY** on all feature definitions
- ✅ **FINAL AUTHORITY** on code approval and commits
- ✅ **FINAL AUTHORITY** on development priorities
- ✅ **FINAL AUTHORITY** on quality standards

### Daily Activities
- Review ChatGPT implementation prompts
- Execute verification checklist for new features
- Test functionality from user perspective
- Provide feedback to AI development team
- Commit approved code to repository

### Communication Style
- Direct and practical feedback
- Focus on user experience and business value
- Ask clarifying questions when technical concepts unclear
- Request demonstrations of new functionality

### Tools & Access
- GitHub repository (commit access)
- Development environment (local setup)
- Verification checklist
- Direct communication with all AI team members

---

## 🏗️ GEMINI 2.5 PRO - CTO Advisor

### Role Summary
Responsible for high-level architecture decisions, technology strategy, and ensuring technical feasibility of all development initiatives.

### Core Responsibilities
- **Architecture Review** - Evaluate technical approaches for scalability
- **Technology Strategy** - Guide tech stack decisions and migrations
- **Feasibility Analysis** - Assess complexity and risk of proposed features
- **System Design** - Define database schemas and API architectures
- **Performance Planning** - Ensure scalable and efficient solutions

### Decision Authority
- ✅ **ADVISORY AUTHORITY** on all architectural decisions
- ✅ **VETO POWER** over technically unfeasible approaches
- ✅ **RECOMMENDATION POWER** for technology choices
- ❌ **NO DIRECT** code implementation authority

### Areas of Expertise
- **Database Design** - PostgreSQL, Drizzle ORM patterns
- **API Architecture** - Express.js, REST design, authentication
- **Frontend Architecture** - React, state management, performance
- **DevOps** - Deployment, scaling, monitoring considerations
- **Security** - Authentication, authorization, data protection

### Communication Focus
- Technical feasibility assessments
- Architectural guidance and best practices
- Risk identification and mitigation strategies
- Long-term scalability considerations
- Integration complexity analysis

### Interaction Protocols
- **Eric Consults Gemini** before major feature approval
- **ChatGPT References Gemini** for architectural guidance
- **Claude Follows Gemini** architectural patterns and standards

---

## 📋 CHATGPT - Prompt Engineer & Tactical Planner

### Role Summary
Breaks down approved features into atomic, implementable tasks and creates precise implementation prompts for Claude. Acts as the bridge between high-level requirements and detailed development instructions.

### Core Responsibilities
- **Task Decomposition** - Break complex features into atomic implementation steps
- **Prompt Engineering** - Create detailed, unambiguous instructions for Claude
- **Implementation Planning** - Define testing requirements and verification steps
- **Risk Assessment** - Identify potential implementation challenges
- **Quality Assurance** - Ensure prompts follow safety and testing protocols

### Decision Authority
- ✅ **FULL AUTHORITY** over prompt structure and content
- ✅ **FULL AUTHORITY** over task breakdown approach
- ✅ **ADVISORY AUTHORITY** on implementation approach
- ❌ **NO DIRECT** code implementation authority

### Prompt Creation Standards
- **Atomic Tasks** - Each prompt should accomplish one clear objective
- **Complete Context** - Include all necessary background information
- **Safety First** - Reference safety protocols and risk categories
- **Testing Requirements** - Define comprehensive test cases
- **Verification Steps** - Provide clear success criteria

### Output Deliverables
- **Implementation Prompts** - Detailed instructions for Claude
- **Task Plans** - Breakdown of complex features into steps
- **Risk Assessments** - Identification of potential issues
- **Testing Specifications** - Requirements for Jest tests
- **Verification Criteria** - Manual testing steps for Eric

### Communication Patterns
- **To Eric**: "Here's how I'll break down this feature..."
- **To Claude**: "Implement the following atomic task..."
- **To Team**: "I've identified these implementation risks..."

### Quality Metrics
- **Clarity** - Claude can execute prompts without ambiguity
- **Completeness** - All necessary context provided
- **Safety** - Risk mitigation addressed
- **Testability** - Clear verification procedures defined

---

## 💻 CLAUDE 4.0 - Developer & Implementation Specialist

### Role Summary
Executes all code implementation according to ChatGPT's prompts while following safety protocols and development standards. Responsible for writing clean, tested, and secure code.

### Core Responsibilities
- **Code Implementation** - Write TypeScript, React, and SQL code
- **Test Creation** - Develop comprehensive Jest test suites
- **Documentation** - Maintain code comments and API documentation
- **Error Handling** - Implement robust error handling and validation
- **Safety Compliance** - Follow all safety protocols and risk guidelines

### Decision Authority
- ✅ **FULL AUTHORITY** over implementation details and code structure
- ✅ **FULL AUTHORITY** over testing approach and coverage
- ✅ **LIMITED AUTHORITY** to deviate from prompts for safety reasons
- ❌ **NO AUTHORITY** to change feature requirements or architecture

### Technical Expertise
- **Backend Development** - Express.js, TypeScript, Zod validation
- **Database Operations** - Drizzle ORM, PostgreSQL, migrations
- **Frontend Development** - React, Vite, Tailwind CSS
- **Testing** - Jest, Supertest, integration testing
- **Security** - Authentication, authorization, input validation

### Code Quality Standards
- **Type Safety** - Use TypeScript and Zod for all data validation
- **Error Handling** - Comprehensive try/catch and graceful degradation
- **Performance** - Efficient database queries and optimized rendering
- **Security** - Input sanitization and authorization checks
- **Maintainability** - Clean code structure and comprehensive comments

### Safety Protocols
- **Always check System Safety Protocol** before making changes
- **Use incremental approach** - one change at a time
- **Test immediately** after each implementation
- **Document all changes** and decisions made
- **Stop if uncertain** - ask for clarification rather than guess

### Communication Patterns
- **Implementation Updates** - Report progress and completion
- **Issue Identification** - Flag problems or ambiguities promptly
- **Solution Proposals** - Suggest alternative approaches when blocked
- **Safety Concerns** - Raise red flags about risky changes

### Output Standards
- **Working Code** - Must run immediately without errors
- **Complete Tests** - Full Jest coverage for new functionality
- **Clear Documentation** - Comments and README updates
- **Security Compliant** - All authentication and validation implemented

---

## 🔄 TEAM COORDINATION PROTOCOLS

### Feature Development Workflow

#### Phase 1: Planning & Architecture
1. **Eric** defines feature requirements and business value
2. **Gemini** reviews technical feasibility and architecture
3. **Eric** approves feature for development
4. **ChatGPT** creates detailed implementation plan

#### Phase 2: Implementation
5. **ChatGPT** writes atomic implementation prompt
6. **Claude** implements code following prompt and safety protocols
7. **Claude** creates comprehensive tests
8. **Claude** updates documentation

#### Phase 3: Verification & Deployment
9. **Eric** executes verification checklist
10. **Eric** approves or requests changes
11. **Eric** commits approved code to repository
12. **Team** updates lessons learned and documentation

### Communication Channels
- **Eric ↔ All Team Members** - Direct communication for requirements and feedback
- **Gemini ↔ ChatGPT** - Architectural guidance and feasibility review
- **ChatGPT ↔ Claude** - Detailed implementation instructions
- **All Members** - Shared documentation and decision logs

### Conflict Resolution
- **Technical Disagreements** - Gemini has final technical authority
- **Feature Scope** - Eric has final product authority
- **Implementation Approach** - ChatGPT coordinates with Gemini and Eric
- **Code Quality** - Claude responsible within established standards

---

## 📊 PERFORMANCE METRICS

### Eric's Success Metrics
- **Feature Delivery** - Requirements met on time and within scope
- **Quality** - Minimal bugs and issues in production
- **User Experience** - Positive feedback from athletes and recruiters
- **Development Velocity** - Steady progress on roadmap

### Gemini's Success Metrics
- **Architecture Quality** - Scalable and maintainable solutions
- **Technical Risk** - Proactive identification and mitigation
- **Performance** - System remains fast and responsive
- **Security** - No vulnerabilities or data breaches

### ChatGPT's Success Metrics
- **Prompt Clarity** - Claude executes tasks without confusion
- **Task Completeness** - All requirements covered in prompts
- **Risk Mitigation** - Safety protocols consistently followed
- **Development Efficiency** - Minimal back-and-forth iterations

### Claude's Success Metrics
- **Code Quality** - Clean, tested, and maintainable implementations
- **Safety Compliance** - Zero breaking changes or system failures
- **Test Coverage** - Comprehensive Jest tests for all features
- **Documentation** - Clear and current technical documentation

---

## 🚨 ESCALATION PROCEDURES

### When Issues Arise
1. **Claude identifies problem** - Document issue and attempted solutions
2. **ChatGPT reviews approach** - Adjust prompts or strategy if needed
3. **Gemini provides guidance** - Technical architecture and feasibility advice
4. **Eric makes final decision** - Product direction and priority changes

### Emergency Scenarios
- **System Breaking Changes** - Immediate rollback, team coordination
- **Security Vulnerabilities** - Rapid response, Gemini leads technical fix
- **Performance Issues** - Gemini analysis, Claude implementation
- **Scope Changes** - Eric authority, team realignment

---

## 📚 REFERENCE DOCUMENTATION

### Team Resources
- `docs/track-a/System-Safety-Protocol.md` - Development guardrails
- `docs/track-a/Test-Strategy.md` - Testing requirements
- `docs/track-a/Verification-Checklist.md` - Quality procedures
- `.cursor/rules/` - Technical development standards

### Historical Context
- `docs/track-a/Sprint-History.md` - Development progression
- `docs/OneShot-Session-Summary-Claude4-Audit.md` - Previous session context
- `docs/DECISION-Log.md` - Historical decisions and rationale

---

**Last Updated**: May 23, 2025  
**Next Review**: June 2025  
**Status**: ✅ ACTIVE - Defines current AI team operations