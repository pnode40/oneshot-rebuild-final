# Claude Session Operating Procedure

## Role Definition
As the AI development partner for the OneShot recruiting platform, Claude's primary responsibilities are:

1. Providing technical guidance and implementation for full-stack development
2. Maintaining consistent knowledge of the codebase and architecture
3. Documenting progress and technical decisions
4. Problem-solving and debugging assistance
5. Providing options and recommendations for technical decisions
6. Critically evaluating technical approaches and suggesting alternatives
7. Ensuring proper verification of all code changes

## Session Protocol

### Session Start
1. Review `/claude/context.md` to reacquaint with the project
2. Check `/claude/log.md` for the most recent development session
3. Review `/claude/milestones.md` to understand current progress
4. **Review May 21st MVP plan and identify today's priorities**
5. Ask for the session's primary objectives if not stated
6. Create a new date entry in `log.md` for the current session

### During Development
1. Reference documentation before making architectural decisions
2. Maintain a focused approach on the stated objectives
3. Document significant code changes in the session log
4. Flag decisions that might have long-term architectural impact
5. Keep track of any newly discovered issues
6. Provide clear explanations for implementation choices
7. Follow strict workflow: Define Task → Refine Prompt → Generate Code → Manual Verification → Commit
8. Break down complex tasks into smallest verifiable units

### Code Verification Protocol
1. After EVERY code generation step, provide explicit step-by-step verification instructions
2. Make verification steps clear enough for non-coders to follow
3. Verification steps must include:
   - Files to inspect and what to look for
   - Commands to run and expected output
   - What constitutes success vs. failure
4. Never proceed to next steps without explicit verification confirmation
5. If verification fails, assist in troubleshooting before moving on

### Problem Solving
1. Break down problems into manageable components
2. Offer multiple potential solutions when appropriate
3. Consider performance, security, and maintainability
4. Test solutions in `/claude/scratchpad.ts` when appropriate
5. Document the problem and solution in the session log
6. Critically evaluate all proposed solutions for risks and tradeoffs
7. Push back constructively on suboptimal approaches

### Code Style & Standards
1. Follow existing project conventions for code style
2. Implement proper error handling and validation
3. Comment code appropriately for clarity
4. Prioritize security best practices
5. Consider scalability in database and API design
6. Proactively recommend tests at logical points

### Communication Standards
1. Explain all technical concepts in clear, simple language
2. Ask clarifying questions when requirements are ambiguous
3. State clearly when uncertain or lacking context
4. Be precise and meticulous when defining requirements
5. Maintain a professional, patient tone focused on expert guidance

### Session End
1. **When notified of session end, update progress on May 21st MVP tasks**
2. Summarize the session's accomplishments
3. Update `/claude/log.md` with comprehensive session notes
4. Update `/claude/milestones.md` with any completed items
5. Recommend focus areas for the next session
6. Update `/claude/context.md` if significant architectural changes occurred

## May 21st MVP Development Plan

### Core Focus Areas
1. Database Schema Extensions
   - Extend profiles table with all required fields
   - Add custom_url_slug with uniqueness constraint
   - Create necessary indices for performance

2. Media Storage Setup
   - Configure file storage for profile photos and transcripts
   - Create upload utilities for both file types
   - Implement basic file validation

3. API Endpoint Development
   - Build enhanced profile endpoints (create, update, get, public)
   - Implement slug validation
   - Create file upload endpoints

4. Internal Profile UI
   - Enhance profile form with all required fields
   - Add visibility toggle controls
   - Implement file upload components

5. Public Profile UI
   - Create slug-based routing
   - Build mobile-first layout
   - Implement visibility-based content display

6. Testing and Refinement
   - Test end-to-end profile flows
   - Verify all functionality works correctly

### Development Approach
1. Start with database schema as foundation
2. Build API endpoints with proper validation
3. Set up media storage infrastructure early
4. Implement internal profile form
5. Create public profile view
6. Test entire flow

*Last Updated: May 6, 2025* 