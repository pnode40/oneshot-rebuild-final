# OneShot Public Profile Requirements

## Overview
This document outlines the must-have features and technical specifications for the public-facing athlete profile pages on the OneShot recruiting platform. The public profile is the core component viewed by college recruiters when evaluating athletes.

## Design Philosophy
- **Mobile-first approach**: Optimize for mobile viewing as recruiters often evaluate on-the-go
- **5-second scan strategy**: Key metrics must be visible immediately (Height, Weight, GPA)
- **Card-style premium design**: Clean layout with OneShot branding (subtle blue, premium aesthetic)
- **No CTAs or inline buttons**: Focus on presenting information, not actions

## URL Structure
- Slug-based URLs: `oneshot.xyz/u/{custom-slug}`
- Real-time slug availability checking during profile creation
- Shareable, memorable URLs for athletes to distribute to recruiters

## Core Profile Components

### Above-the-Fold Content (Mobile Priority)
The following must be visible without scrolling on mobile devices:

| Component | Details | Notes |
|-----------|---------|-------|
| Profile Photo | Banner-style presentation | Required |
| Name | First name + Last name + Jersey Number | Full visibility |
| School Info | High school + Graduation year | Always visible |
| Position(s) | Primary and secondary positions | Always visible |
| Key Metrics | Height, Weight, GPA | If made visible by athlete |
| Verification | Transcript badge (if uploaded) | Visual indicator only |
| NCAA Info | ID + Eligibility status | Only for Transfer Portal athletes |

### Video Highlights Section
- YouTube embed (plays inline) or Hudl redirect with thumbnail preview
- One featured video prominently displayed
- Clear playback behavior indicators

### Coach Contact Information
- Coach's First/Last Name
- Email and Phone number
- Visual verification status indicator
- Protected from scraping/automated collection

## Technical Requirements

### Responsive Design
- Fully responsive from mobile to desktop
- Card-style container maintains proportions across devices
- Typography scales appropriately for readability

### Image Handling
- Profile photos optimized for fast loading
- Support for OG image generation from action photos
- Minimum dimensions for social sharing: 1200×630px

### State Management
- Visibility toggles honored (server and client-side enforcement)
- Public/private state for each field
- Cached views for performance

### Rendering Modes
- Standard web view
- Social share optimized view
- QR code scan view (with vCard support)

## Data Requirements

### Required Fields (Must be Public)
- First Name + Last Initial
- Graduation Year
- High School
- Position(s)
- At least one profile photo

### Optional Public Fields
- Full metrics: Height, Weight, GPA
- NCAA ID and Eligibility (Transfer Portal only)
- Highlight Video
- Performance Metrics (if athlete chooses to share)
- Coach Contact Information

## Implementation Notes
- Profile data is pulled from the same source as the internal profile editor
- Views are structurally decoupled but use the same data models
- Minimum threshold of completed fields required to make profile public
- Coach contact information requires SMS verification before display

## Visual References
- Follow OneShot brand guidelines for color, typography, and spacing
- Use card-style layout from approved mockups
- Implement subtle animations for state changes (loading, expanding sections)

## Future Enhancements (Not MVP)
- Contact buttons / Direct messaging
- Recruiter analytics
- Profile completeness badge
- NCAA ID verification lookup 