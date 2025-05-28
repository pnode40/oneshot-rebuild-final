# OneShot OG Image Generation Setup

## Overview

The OG Image Generation system creates stunning **Nike-style** social media images for athlete profiles that make recruiters stop scrolling. This feature generates professional-quality graphics with athlete photos, stats, and subtle OneShot branding designed to build trust and drive viral growth.

## Features

- **10 Nike-Style Templates**: From clean minimalist to premium luxury designs
- **Tiered Access System**: Free (1), Viral (4), Premium (10) templates
- **Multiple Image Slots**: Store up to 10 different OG images per athlete
- **Action Photo Integration**: Use athlete's best action shots as backgrounds
- **Subtle OneShot Branding**: Professional, trustworthy, not pushy
- **Social Media Optimized**: Perfect 1200x630 dimensions for all platforms
- **Built-in Sharing**: Direct sharing to Twitter, Facebook, Instagram (no LinkedIn)
- **Viral Growth Mechanics**: Unlock templates by sharing teammate profiles
- **Download Support**: Athletes can download their images
- **Real-time Generation**: Create new images instantly

## Tiered Access System

### 🆓 Free Tier (1 Template, 1 Slot)
- **Minimal Template**: Clean, professional white design
- Perfect for getting started
- Subtle OneShot branding

### 🔥 Viral Tier (4 Templates, 3 Slots)
**Unlock by sharing 25 teammate profiles**
- **Bold Template**: High contrast, attention-grabbing
- **Action Template**: Photo-focused with professional overlay
- **Stats Template**: Data-driven tech aesthetic
- Encourages viral growth through buddy sharing

### ⭐ Premium Tier (10 Templates, 10 Slots)
**$9.99/month subscription**
- **Elite Template**: Luxury black & gold design
- **Signature Template**: Personal branding style
- **Champion Template**: Victory-themed design
- **Legacy Template**: Timeless classic look
- **Future Template**: Modern tech aesthetic
- **Dynasty Template**: Elite legacy design
- All templates from lower tiers included

## Installation

### 1. Install Canvas Dependency

The OG image generation requires the `canvas` package for image manipulation:

```bash
cd OneShotLocal/server
npm install canvas@^2.11.2
```

**Note**: Canvas has native dependencies that may require additional setup:

#### macOS
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

#### Ubuntu/Debian
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

#### Windows
Canvas should install automatically with npm on Windows. If you encounter issues, consider using Windows Subsystem for Linux (WSL).

### 2. Database Migration

The OG image feature requires new database fields. Run the migration:

```bash
cd OneShotLocal/server
npm run migrate
```

This adds the following fields to `athlete_profiles`:
- `actionPhotos` (jsonb) - Array of action photo metadata
- `selectedOgPhotoId` (varchar) - ID of selected photo for OG image
- `generatedOgImageUrl` (jsonb) - Multiple OG images stored by slot
- `ogImageLastGenerated` (timestamp) - When OG image was last created
- `socialMediaLinks` (jsonb) - Social media profile links (no LinkedIn)
- `bio` (text) - Athlete biography

### 3. Create Upload Directories

```bash
mkdir -p OneShotLocal/server/uploads/og-images
mkdir -p OneShotLocal/server/uploads/action-photos
```

### 4. Optional: Add Custom Fonts

For better typography, add Inter fonts to the server:

```bash
mkdir -p OneShotLocal/server/assets/fonts
# Download Inter-Bold.ttf, Inter-Regular.ttf, and Inter-Black.ttf to this directory
```

If fonts are not available, the system will fallback to system fonts.

## Usage

### For Athletes (Internal Profile)

1. **Navigate to Social Media Tab**: In the profile dashboard, click the "Social Media" tab
2. **Check Your Tier**: See your current tier status and available templates
3. **Upload Action Photos**: Add your best action shots to the photo gallery
4. **Select Featured Photo**: Choose which action photo to use in your OG images
5. **Choose Template & Slot**: Select from available templates and image slots
6. **Generate Image**: Click "Generate [Template] Image"
7. **Share Everywhere**: Use built-in sharing buttons (Twitter, Facebook, Instagram)
8. **Unlock More**: Share teammate profiles to unlock viral tier templates

### For Developers

#### Generate OG Image Programmatically

```typescript
import { ogImageService } from './services/ogImageService';

// Generate OG image for user with specific template and slot
const ogImageUrl = await ogImageService.generateAndSaveOGImage(userId, 'elite', 2);

// Check user's tier and available templates
const templates = await ogImageService.getAvailableTemplates(userId);
const maxSlots = await ogImageService.getMaxSlots(userId);
```

#### API Endpoints

- `GET /api/v1/og-image/templates` - Get available templates for user
- `POST /api/v1/og-image/generate` - Generate OG image with template and slot
- `POST /api/v1/og-image/generate-all` - Generate multiple images (premium only)
- `POST /api/v1/og-image/select-photo` - Select action photo
- `GET /api/v1/og-image/status` - Get generation status and tier info
- `GET /api/v1/og-image/:slug` - Get primary OG image for public profile

## Template Showcase

### Free Tier Templates

#### Minimal
- Clean white background with subtle gradient
- Professional typography with OneShot cyan accent
- Perfect for professional contexts
- Builds trust and credibility

### Viral Tier Templates

#### Bold
- High contrast navy-to-charcoal gradient
- Dynamic orange accent stripe
- Large jersey number overlay
- Attention-grabbing design

#### Action
- Full-background action photo with professional overlay
- Strong text contrast with stroke effects
- Position badge with OneShot watermark
- Perfect for showcasing athletic moments

#### Stats
- Tech-inspired dark gradient with grid pattern
- Cyan stat boxes with athlete metrics
- Modern, data-driven aesthetic
- Appeals to analytics-minded recruiters

### Premium Tier Templates

#### Elite
- Luxury black background with gold accents
- "ELITE ATHLETE" badge
- Premium OneShot branding
- Conveys exclusivity and high performance

#### Signature
- Sophisticated radial gradient
- Split first/last name styling
- Large jersey number background element
- Personal branding focus

#### Champion, Legacy, Future, Dynasty
- Each with unique color schemes and messaging
- Victory themes, timeless designs, futuristic aesthetics
- Premium positioning for top-tier athletes

## Viral Growth Mechanics

### Buddy Sharing System
- Athletes unlock viral tier by sharing 25 teammate profiles
- Special messaging encourages peer-to-peer sharing
- "Help your teammates get discovered" prompts
- Viral share tracking and analytics

### Social Media Integration
- Platform-specific sharing optimization
- No LinkedIn support (focused on youth platforms)
- Instagram copy-to-clipboard functionality
- Viral messaging for social media traffic

## Monetization Strategy

### Subscription Tiers
- **Free**: Basic functionality, builds user base
- **Viral**: Earned through engagement, drives growth
- **Premium**: $9.99/mo, premium features and unlimited access

### Upgrade Prompts
- Beautiful upgrade modals when locked templates are clicked
- Clear tier comparison and benefits
- "Upgrade Now" call-to-action buttons
- Viral tier promotion through sharing

## Performance Considerations

- **Template Caching**: Generated images cached by slot
- **Lazy Generation**: Images generated on-demand only
- **Fallback Support**: System works without canvas dependency
- **File Size Optimization**: PNG compression for optimal sharing
- **Multiple Slots**: Athletes can have different images for different contexts

## Security & Privacy

- Generated images stored in public uploads directory
- No sensitive information in OG images
- Rate limiting prevents abuse of generation endpoints
- Authentication required for all generation operations
- Tier verification prevents unauthorized template access

## Analytics & Tracking

- Template usage analytics by tier
- Viral sharing conversion tracking
- Upgrade funnel analysis
- Social media platform performance metrics

## Future Enhancements

- **Video Thumbnails**: Generate OG images from video highlights
- **School Branding**: Custom school colors and logos (premium feature)
- **A/B Testing**: Multiple OG image variants for optimization
- **CDN Integration**: Serve images from CDN for better performance
- **Batch Generation**: Generate images for multiple athletes
- **Custom Templates**: Allow premium users to create custom layouts
- **Team Packages**: Bulk subscriptions for entire teams 