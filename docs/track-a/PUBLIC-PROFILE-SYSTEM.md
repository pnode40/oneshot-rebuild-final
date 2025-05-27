# Public Profile System Implementation

## Overview
Complete implementation of the OneShot public profile system with QR code sharing, vCard downloads, and Progressive Web App support.

## Features Implemented

### 1. Three Profile Versions
- **Internal Edit View** - Athlete's private dashboard for editing
- **Public Social View** (`/u/{slug}`) - Social media friendly, no contact info
- **Public Recruiter View** (`/u/{slug}?qr=true`) - Full contact info with vCard download

### 2. QR Code System
- **Floating Action Button** - Orange button in bottom-right corner
- **Full-Screen Display** - Maximized brightness, wake lock enabled
- **Swipe-to-Close** - Natural mobile gesture
- **Smart URL Generation** - Adds `?qr=true` parameter for recruiter version

### 3. vCard Integration
- **Comprehensive Contact Info**:
  - Name, phone, email
  - School, positions, jersey number
  - Physical stats (height, weight)
  - Academic info (GPA)
  - Performance metrics
  - Coach contact details
- **One-tap Download** - Prominent button for QR scan users
- **Cross-platform Compatible** - Works on iOS and Android

### 4. Transcript Preview Modal
- **No Download Required** - Recruiters can verify GPA without downloading
- **PDF and Image Support** - Handles both file types
- **Secure Viewing** - Modal overlay prevents direct file access
- **Mobile Optimized** - Full-screen display with touch gestures

### 5. Progressive Web App
- **Offline Support** - Service worker caches profiles
- **Installable** - Can be added to home screen
- **App-like Experience** - Full-screen mode, custom theme color

## Technical Implementation

### Frontend Components

#### PublicProfilePage (`/client/src/components/publicProfile/PublicProfilePage.tsx`)
- Main container component
- Detects QR parameter for recruiter version
- Handles meta tags for social sharing
- Shows vCard download button when appropriate

#### PublicProfileHeader (`/client/src/components/publicProfile/PublicProfileHeader.tsx`)
- Displays athlete info, school, positions
- Shows key metrics (height, weight, GPA)
- Transcript preview button with green checkmark
- Respects visibility settings

#### PublicProfileVideo (`/client/src/components/publicProfile/PublicProfileVideo.tsx`)
- YouTube embed support
- Hudl redirect handling
- Responsive video player
- Fallback for missing videos

#### PublicProfileMetrics (`/client/src/components/publicProfile/PublicProfileMetrics.tsx`)
- Two-column layout for performance stats
- Speed/Agility category
- Strength/Power category
- Only shows populated metrics

#### PublicProfileCoach (`/client/src/components/publicProfile/PublicProfileCoach.tsx`)
- Coach contact information
- Verification badge (when implemented)
- Privacy-aware display

#### QRCodeDisplay (`/client/src/components/QRCodeDisplay.tsx`)
- Full-screen QR code presentation
- Device brightness control
- Wake lock to prevent sleep
- Swipe gesture handling

#### TranscriptModal (`/client/src/components/publicProfile/TranscriptModal.tsx`)
- PDF viewer using iframe
- Image display for non-PDF transcripts
- Escape key and click-outside to close
- Verification badge

### Backend Implementation

#### Database Schema Updates (`/server/src/db/schema/athleteProfiles.ts`)
- Added comprehensive fields:
  - `slug` - Unique URL identifier
  - `jerseyNumber`, `transcriptUrl`
  - Performance metrics (40-yard dash, bench press, etc.)
  - Coach information fields
  - Visibility toggles for each section
  - Featured video fields

#### Public Profile Service (`/server/src/services/publicProfileService.ts`)
- Filters data based on visibility settings
- Only returns public profiles
- Respects field-level privacy

#### Public Routes (`/server/src/routes/publicProfiles.ts`)
- `GET /api/public/:slug` - Fetch public profile
- `GET /api/public/check-slug/:slug` - Check slug availability

### PWA Configuration

#### Manifest (`/client/public/manifest.json`)
- App name and icons
- Theme color matching brand
- Display mode: standalone
- Portrait orientation

#### Service Worker (`/client/public/service-worker.js`)
- Caches essential files
- Offline profile viewing
- API response caching

## Design Decisions

### Mobile-First Approach
- 5-second scan optimization at camps
- Touch-friendly interfaces
- Swipe gestures for natural interaction

### Privacy by Design
- Granular visibility controls
- Different views for different audiences
- Contact info protected unless explicitly shared

### Performance Optimization
- Lazy loading for modals
- Service worker caching
- Minimal bundle size

## Future Enhancements

### Planned Features
1. **Coach SMS Verification** - Verify coach phone numbers
2. **Social Share Buttons** - Easy sharing to Twitter, Instagram
3. **Analytics Tracking** - Profile view counts
4. **Referral System** - Incentivize athlete signups
5. **Enhanced PWA** - Push notifications, background sync

### Technical Improvements
1. **Cloudinary Integration** - Professional media storage
2. **NCAA Compliance** - Recruiting calendar awareness
3. **SEO Optimization** - Better social media previews
4. **A/B Testing** - Optimize conversion rates

## Usage Instructions

### For Athletes
1. Complete profile with all required fields
2. Toggle visibility settings as desired
3. Make profile public when ready
4. Share via QR code at camps or social media

### For Recruiters
1. Scan QR code at prospect camps
2. Download vCard for contact info
3. View transcript to verify GPA
4. Access performance metrics

## Color Scheme
- **Navy Blue** (#1F2A44) - Primary brand color
- **Electric Cyan** (#00C2FF) - Accent color
- **Signal Orange** (#FF6B35) - CTA buttons, QR button

## Dependencies Added
- `react-qr-code` - QR code generation
- `vcf` - vCard file creation
- PWA support via manifest and service worker

---

*Last Updated: [Current Date]*
*OneShot Recruiting Platform - Disrupting the recruiting industry* 