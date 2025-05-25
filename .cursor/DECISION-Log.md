## DECISION-Log.md — Project-Wide Architecture & Implementation Rulings

This document records key decisions made during OneShot development that impact architecture, data modeling, naming conventions, or validation standards. Claude and Gemini must consult this file before proposing alternative solutions.

> Claude: If your output changes a rule, pattern, or architectural assumption, log it here.

---

### ✅ Example Entry

**DECISION:** Use UUIDs for profile IDs instead of human-readable slugs  
**DATE:** 2025-05-08  
**STATUS:** Active  
**RULE:** All profile objects must use `uuidv4` as their primary key  
**WHY:** Avoids slug collisions and simplifies uniqueness enforcement  
**REVIEWED BY:** Eric, Gemini

---

### ✅ Enhanced Athlete Profile System Architecture

**DECISION:** Implement "Traffic Light" psychology-driven public profile design  
**DATE:** 2025-05-24  
**STATUS:** Active  
**RULE:** Public recruiter profiles must prioritize critical qualification data (name, jersey, height, weight, GPA) in hero section with color-coded indicators  
**WHY:** Recruiters filter in 5-second windows - need instant qualification validation, not browsing experience  
**REVIEWED BY:** Eric

---

### ✅ Trust Verification Innovation for GPA

**DECISION:** Implement quick-view transcript verification without downloads  
**DATE:** 2025-05-24  
**STATUS:** Active  
**RULE:** GPA displays include small verification icon that opens iframe modal for 2-3 second transcript validation  
**WHY:** Competitive advantage - allows coaches to verify GPA quickly without disruptive downloads while maintaining evaluation momentum  
**REVIEWED BY:** Eric

---

### ✅ vCard Strategy with Profile Photos

**DECISION:** Generate comprehensive vCards including profile photos via URL reference  
**DATE:** 2025-05-24  
**STATUS:** Active  
**RULE:** vCards must include: Name+Jersey, Phone, Email, Title (Position/School/Year), Website (profile link), Notes (key stats), Photo (URL reference)  
**WHY:** Creates seamless contact exchange at camps/events while maintaining OneShot branding  
**REVIEWED BY:** Eric

---

### ✅ Mutual Contact Exchange Strategy

**DECISION:** Implement prompted coach contact sharing after vCard save  
**DATE:** 2025-05-24  
**STATUS:** Active  
**RULE:** When coach saves player vCard, prompt to share coach contact info in return  
**WHY:** Transforms one-way business card into mutual networking platform, creates stronger connections  
**REVIEWED BY:** Eric

---

### ✅ Domain Strategy for Mobile-First Platform

**DECISION:** Use oneshotrecruits.com for primary domain  
**DATE:** 2025-05-24  
**STATUS:** Active  
**RULE:** Keep existing domain - meets credibility requirements for recruiting space  
**WHY:** Already owned, .com extension provides trust, recruiting-specific branding, cost-effective  
**REVIEWED BY:** Eric

---

### ✅ Coach Verification as "Verified" vs "Qualified"

**DECISION:** Use "verified" terminology for coach-validated athletic metrics  
**DATE:** 2025-05-24  
**STATUS:** Active  
**RULE:** Display coach-verified metrics with "verified" badge/indicator, not "qualified"  
**WHY:** "Verified" is clearer and more trustworthy than "qualified" for recruiter understanding  
**REVIEWED BY:** Eric

---

### ✅ Giant QR Code Instant Access Strategy

**DECISION:** Prioritize frictionless QR code access for camp/event scenarios  
**DATE:** 2025-05-24  
**STATUS:** Active  
**RULE:** Primary UX focus on instant QR code access without fumbling - implement as Phase 1 priority  
**WHY:** Critical "moment of truth" when nervous players need to quickly exchange contact with coaches at camps  
**REVIEWED BY:** Eric

---

### ✍️ Entry Template

**DECISION:** [What was decided?]  
**DATE:** [YYYY-MM-DD]  
**STATUS:** [Active / Deprecated / Under Review]  
**RULE:** [What implementation guidance does this establish?]  
**WHY:** [Why was this decision made?]  
**REVIEWED BY:** [Who approved or confirmed this rule?]

> Claude: Always log decisions that affect future outputs, validation expectations, or schema logic.
