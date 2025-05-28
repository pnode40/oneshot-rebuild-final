import path from 'path';
import fs from 'fs/promises';
import { db } from '../db/client';
import { athleteProfiles } from '../db/schema';
import { eq } from 'drizzle-orm';

// Optional canvas import with fallback
let createCanvas: any, loadImage: any, registerFont: any;
try {
  const canvas = require('canvas');
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
  registerFont = canvas.registerFont;
} catch (error) {
  console.warn('Canvas module not available. OG image generation will be disabled.');
}

interface AthleteData {
  firstName: string;
  lastName: string;
  jerseyNumber?: string;
  primaryPosition?: string;
  graduationYear?: number;
  highSchoolName?: string;
  sport?: string;
  actionPhotoUrl?: string;
  heightInches?: number;
  weightLbs?: number;
}

// Premium Nike-style templates
type OGTemplate = 'minimal' | 'bold' | 'action' | 'stats' | 'elite' | 'signature' | 'champion' | 'legacy' | 'future' | 'dynasty';

interface OGImageOptions {
  width?: number;
  height?: number;
  template?: OGTemplate;
  slot?: number; // Which OG image slot (1-10)
}

export class OGImageService {
  private static readonly DEFAULT_WIDTH = 1200;
  private static readonly DEFAULT_HEIGHT = 630;
  
  // Nike-inspired color palette
  private static readonly BRAND_COLORS = {
    // Primary OneShot colors
    navy: '#1F2A44',
    cyan: '#00C2FF',
    orange: '#FF6B35',
    
    // Nike-style neutrals
    charcoal: '#2D2D2D',
    platinum: '#E6E6E6',
    white: '#FFFFFF',
    black: '#000000',
    
    // Premium accents
    gold: '#FFD700',
    silver: '#C0C0C0',
    electric: '#00FFFF',
    neon: '#39FF14'
  };

  private canvasAvailable: boolean;

  constructor() {
    this.canvasAvailable = !!createCanvas;
    if (this.canvasAvailable) {
      this.registerFonts();
    }
  }

  private async registerFonts() {
    if (!registerFont) return;
    
    try {
      const fontsDir = path.join(__dirname, '../../assets/fonts');
      
      try {
        await fs.access(fontsDir);
        registerFont(path.join(fontsDir, 'Inter-Bold.ttf'), { family: 'Inter', weight: 'bold' });
        registerFont(path.join(fontsDir, 'Inter-Regular.ttf'), { family: 'Inter', weight: 'normal' });
        registerFont(path.join(fontsDir, 'Inter-Black.ttf'), { family: 'Inter', weight: '900' });
      } catch {
        console.log('Custom fonts not found, using system fonts');
      }
    } catch (error) {
      console.log('Font registration failed, using system fonts:', error);
    }
  }

  /**
   * Generate premium Nike-style OG image
   */
  async generateOGImage(
    athleteData: AthleteData,
    options: OGImageOptions = {}
  ): Promise<Buffer | null> {
    if (!this.canvasAvailable) {
      console.warn('Canvas not available, cannot generate OG image');
      return null;
    }

    const {
      width = OGImageService.DEFAULT_WIDTH,
      height = OGImageService.DEFAULT_HEIGHT,
      template = 'minimal'
    } = options;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw template-specific design
    switch (template) {
      case 'minimal':
        await this.drawMinimalTemplate(ctx, athleteData, width, height);
        break;
      case 'bold':
        await this.drawBoldTemplate(ctx, athleteData, width, height);
        break;
      case 'action':
        await this.drawActionTemplate(ctx, athleteData, width, height);
        break;
      case 'stats':
        await this.drawStatsTemplate(ctx, athleteData, width, height);
        break;
      case 'elite':
        await this.drawEliteTemplate(ctx, athleteData, width, height);
        break;
      case 'signature':
        await this.drawSignatureTemplate(ctx, athleteData, width, height);
        break;
      case 'champion':
        await this.drawChampionTemplate(ctx, athleteData, width, height);
        break;
      case 'legacy':
        await this.drawLegacyTemplate(ctx, athleteData, width, height);
        break;
      case 'future':
        await this.drawFutureTemplate(ctx, athleteData, width, height);
        break;
      case 'dynasty':
        await this.drawDynastyTemplate(ctx, athleteData, width, height);
        break;
      default:
        await this.drawMinimalTemplate(ctx, athleteData, width, height);
    }

    return canvas.toBuffer('image/png');
  }

  /**
   * FREE TIER: Minimal Template - Clean, professional
   */
  private async drawMinimalTemplate(ctx: any, athleteData: AthleteData, width: number, height: number) {
    // Clean white background with subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(1, '#F8F9FA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle geometric accent
    ctx.fillStyle = OGImageService.BRAND_COLORS.cyan;
    ctx.fillRect(0, 0, 8, height);

    // Athlete name - bold and prominent
    ctx.font = 'bold 64px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.charcoal;
    ctx.textAlign = 'left';
    const fullName = `${athleteData.firstName} ${athleteData.lastName}`;
    ctx.fillText(fullName, 60, height * 0.4);

    // Position and class
    ctx.font = '32px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.navy;
    const positionText = athleteData.primaryPosition || 'Athlete';
    const classText = athleteData.graduationYear ? ` • Class of ${athleteData.graduationYear}` : '';
    ctx.fillText(`${positionText}${classText}`, 60, height * 0.4 + 50);

    // School name
    if (athleteData.highSchoolName) {
      ctx.font = '24px Inter, Arial, sans-serif';
      ctx.fillStyle = OGImageService.BRAND_COLORS.platinum;
      ctx.fillText(athleteData.highSchoolName, 60, height * 0.4 + 85);
    }

    // Subtle OneShot branding
    ctx.font = '18px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.cyan;
    ctx.textAlign = 'right';
    ctx.fillText('OneShot', width - 40, height - 40);
  }

  /**
   * VIRAL TIER: Bold Template - High contrast, attention-grabbing
   */
  private async drawBoldTemplate(ctx: any, athleteData: AthleteData, width: number, height: number) {
    // Bold gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, OGImageService.BRAND_COLORS.navy);
    gradient.addColorStop(1, OGImageService.BRAND_COLORS.charcoal);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Dynamic accent stripe
    ctx.fillStyle = OGImageService.BRAND_COLORS.orange;
    ctx.fillRect(0, height * 0.7, width, 12);

    // Large, bold name
    ctx.font = 'bold 72px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.white;
    ctx.textAlign = 'left';
    const fullName = `${athleteData.firstName} ${athleteData.lastName}`;
    ctx.fillText(fullName, 60, height * 0.35);

    // Jersey number overlay
    if (athleteData.jerseyNumber) {
      ctx.font = 'bold 120px Inter, Arial, sans-serif';
      ctx.fillStyle = OGImageService.BRAND_COLORS.cyan;
      ctx.globalAlpha = 0.2;
      ctx.textAlign = 'right';
      ctx.fillText(`#${athleteData.jerseyNumber}`, width - 60, height * 0.4);
      ctx.globalAlpha = 1;
    }

    // Position with emphasis
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.cyan;
    ctx.textAlign = 'left';
    ctx.fillText(athleteData.primaryPosition || 'ATHLETE', 60, height * 0.35 + 60);

    // OneShot badge
    this.drawOneShotBadge(ctx, width - 120, 40);
  }

  /**
   * VIRAL TIER: Action Template - Photo-focused
   */
  private async drawActionTemplate(ctx: any, athleteData: AthleteData, width: number, height: number) {
    // Dark base for photo overlay
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.fillRect(0, 0, width, height);

    // Action photo if available
    if (athleteData.actionPhotoUrl && loadImage) {
      try {
        const image = await loadImage(athleteData.actionPhotoUrl);
        
        // Full background with professional overlay
        ctx.drawImage(image, 0, 0, width, height);
        
        // Professional gradient overlay
        const overlay = ctx.createLinearGradient(0, 0, 0, height);
        overlay.addColorStop(0, 'rgba(31, 42, 68, 0.3)');
        overlay.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, width, height);
      } catch (error) {
        console.error('Failed to load action photo:', error);
      }
    }

    // Name with strong contrast
    ctx.font = 'bold 68px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.white;
    ctx.textAlign = 'left';
    ctx.strokeStyle = OGImageService.BRAND_COLORS.black;
    ctx.lineWidth = 3;
    
    const fullName = `${athleteData.firstName} ${athleteData.lastName}`;
    ctx.strokeText(fullName, 60, height - 120);
    ctx.fillText(fullName, 60, height - 120);

    // Position badge
    ctx.fillStyle = OGImageService.BRAND_COLORS.cyan;
    ctx.fillRect(60, height - 80, 200, 40);
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.textAlign = 'center';
    ctx.fillText(athleteData.primaryPosition || 'ATHLETE', 160, height - 55);

    // OneShot watermark
    ctx.font = '16px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.white;
    ctx.textAlign = 'right';
    ctx.fillText('OneShot', width - 20, height - 20);
  }

  /**
   * VIRAL TIER: Stats Template - Data-focused
   */
  private async drawStatsTemplate(ctx: any, athleteData: AthleteData, width: number, height: number) {
    // Tech-inspired gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0A0A0A');
    gradient.addColorStop(0.5, OGImageService.BRAND_COLORS.navy);
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grid pattern overlay
    ctx.strokeStyle = OGImageService.BRAND_COLORS.cyan;
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Name with tech styling
    ctx.font = 'bold 56px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.white;
    ctx.textAlign = 'left';
    const fullName = `${athleteData.firstName} ${athleteData.lastName}`;
    ctx.fillText(fullName, 60, 120);

    // Stats grid
    const statsY = 200;
    const statBoxes = [
      { label: 'HEIGHT', value: athleteData.heightInches ? `${Math.floor(athleteData.heightInches / 12)}'${athleteData.heightInches % 12}"` : 'N/A' },
      { label: 'WEIGHT', value: athleteData.weightLbs ? `${athleteData.weightLbs}` : 'N/A' },
      { label: 'POSITION', value: athleteData.primaryPosition || 'ATH' },
      { label: 'CLASS', value: athleteData.graduationYear ? `'${athleteData.graduationYear.toString().slice(-2)}` : 'N/A' }
    ];

    statBoxes.forEach((stat, index) => {
      const x = 60 + (index * 250);
      
      // Stat box
      ctx.fillStyle = OGImageService.BRAND_COLORS.cyan;
      ctx.fillRect(x, statsY, 200, 120);
      
      // Stat value
      ctx.font = 'bold 36px Inter, Arial, sans-serif';
      ctx.fillStyle = OGImageService.BRAND_COLORS.black;
      ctx.textAlign = 'center';
      ctx.fillText(stat.value, x + 100, statsY + 55);
      
      // Stat label
      ctx.font = '16px Inter, Arial, sans-serif';
      ctx.fillText(stat.label, x + 100, statsY + 80);
    });

    // OneShot tech badge
    ctx.fillStyle = OGImageService.BRAND_COLORS.cyan;
    ctx.fillRect(width - 140, height - 60, 120, 40);
    ctx.font = 'bold 18px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.textAlign = 'center';
    ctx.fillText('OneShot', width - 80, height - 35);
  }

  /**
   * PREMIUM TIER: Elite Template - Luxury aesthetic
   */
  private async drawEliteTemplate(ctx: any, athleteData: AthleteData, width: number, height: number) {
    // Luxury black background
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.fillRect(0, 0, width, height);

    // Gold accent lines
    ctx.fillStyle = OGImageService.BRAND_COLORS.gold;
    ctx.fillRect(0, 0, width, 4);
    ctx.fillRect(0, height - 4, width, 4);

    // Premium name styling
    ctx.font = 'bold 64px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.white;
    ctx.textAlign = 'center';
    const fullName = `${athleteData.firstName} ${athleteData.lastName}`;
    ctx.fillText(fullName, width / 2, height * 0.4);

    // Elite badge
    ctx.fillStyle = OGImageService.BRAND_COLORS.gold;
    ctx.fillRect(width / 2 - 100, height * 0.5, 200, 60);
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.fillText('ELITE ATHLETE', width / 2, height * 0.5 + 35);

    // School with prestige styling
    if (athleteData.highSchoolName) {
      ctx.font = '28px Inter, Arial, sans-serif';
      ctx.fillStyle = OGImageService.BRAND_COLORS.platinum;
      ctx.fillText(athleteData.highSchoolName, width / 2, height * 0.7);
    }

    // OneShot premium badge
    this.drawPremiumBadge(ctx, width / 2, height - 80);
  }

  /**
   * PREMIUM TIER: Signature Template - Personal branding
   */
  private async drawSignatureTemplate(ctx: any, athleteData: AthleteData, width: number, height: number) {
    // Sophisticated gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, '#1A1A1A');
    gradient.addColorStop(1, OGImageService.BRAND_COLORS.navy);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Signature-style name
    ctx.font = 'bold 72px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.white;
    ctx.textAlign = 'left';
    ctx.fillText(athleteData.firstName, 60, height * 0.35);
    
    ctx.font = 'bold 72px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.cyan;
    ctx.fillText(athleteData.lastName, 60, height * 0.35 + 80);

    // Personal brand elements
    if (athleteData.jerseyNumber) {
      ctx.font = 'bold 200px Inter, Arial, sans-serif';
      ctx.fillStyle = OGImageService.BRAND_COLORS.orange;
      ctx.globalAlpha = 0.15;
      ctx.textAlign = 'right';
      ctx.fillText(`${athleteData.jerseyNumber}`, width - 40, height * 0.6);
      ctx.globalAlpha = 1;
    }

    // OneShot signature
    ctx.font = 'italic 20px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.platinum;
    ctx.textAlign = 'right';
    ctx.fillText('Powered by OneShot', width - 40, height - 30);
  }

  /**
   * Helper: Draw OneShot badge
   */
  private drawOneShotBadge(ctx: any, x: number, y: number) {
    ctx.fillStyle = OGImageService.BRAND_COLORS.cyan;
    ctx.fillRect(x, y, 80, 30);
    ctx.font = 'bold 14px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.textAlign = 'center';
    ctx.fillText('OneShot', x + 40, y + 20);
  }

  /**
   * Helper: Draw premium badge
   */
  private drawPremiumBadge(ctx: any, x: number, y: number) {
    ctx.fillStyle = OGImageService.BRAND_COLORS.gold;
    ctx.fillRect(x - 60, y - 20, 120, 40);
    ctx.font = 'bold 16px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.textAlign = 'center';
    ctx.fillText('OneShot', x, y + 5);
  }

  /**
   * PREMIUM TIER: Champion Template - Victory aesthetic
   */
  private async drawChampionTemplate(ctx: any, athleteData: AthleteData, width: number, height: number) {
    // Championship gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, OGImageService.BRAND_COLORS.gold);
    gradient.addColorStop(0.5, OGImageService.BRAND_COLORS.orange);
    gradient.addColorStop(1, OGImageService.BRAND_COLORS.charcoal);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Champion name styling
    ctx.font = 'bold 68px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.textAlign = 'center';
    const fullName = `${athleteData.firstName} ${athleteData.lastName}`;
    ctx.fillText(fullName, width / 2, height * 0.4);

    // Champion badge
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.fillRect(width / 2 - 120, height * 0.5, 240, 60);
    ctx.font = 'bold 28px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.gold;
    ctx.fillText('CHAMPION', width / 2, height * 0.5 + 35);

    this.drawPremiumBadge(ctx, width / 2, height - 80);
  }

  /**
   * PREMIUM TIER: Legacy Template - Timeless design
   */
  private async drawLegacyTemplate(ctx: any, athleteData: AthleteData, width: number, height: number) {
    // Classic gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, OGImageService.BRAND_COLORS.platinum);
    gradient.addColorStop(1, OGImageService.BRAND_COLORS.charcoal);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Legacy name styling
    ctx.font = 'bold 64px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.navy;
    ctx.textAlign = 'center';
    const fullName = `${athleteData.firstName} ${athleteData.lastName}`;
    ctx.fillText(fullName, width / 2, height * 0.4);

    // Legacy elements
    ctx.font = '32px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.charcoal;
    ctx.fillText('LEGACY', width / 2, height * 0.6);

    this.drawPremiumBadge(ctx, width / 2, height - 80);
  }

  /**
   * PREMIUM TIER: Future Template - Modern tech aesthetic
   */
  private async drawFutureTemplate(ctx: any, athleteData: AthleteData, width: number, height: number) {
    // Futuristic gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, OGImageService.BRAND_COLORS.electric);
    gradient.addColorStop(1, OGImageService.BRAND_COLORS.navy);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Future name styling
    ctx.font = 'bold 72px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.white;
    ctx.textAlign = 'center';
    const fullName = `${athleteData.firstName} ${athleteData.lastName}`;
    ctx.fillText(fullName, width / 2, height * 0.4);

    // Future elements
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.electric;
    ctx.fillText('FUTURE STAR', width / 2, height * 0.6);

    this.drawPremiumBadge(ctx, width / 2, height - 80);
  }

  /**
   * PREMIUM TIER: Dynasty Template - Elite legacy design
   */
  private async drawDynastyTemplate(ctx: any, athleteData: AthleteData, width: number, height: number) {
    // Dynasty gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, OGImageService.BRAND_COLORS.black);
    gradient.addColorStop(0.3, OGImageService.BRAND_COLORS.gold);
    gradient.addColorStop(0.7, OGImageService.BRAND_COLORS.silver);
    gradient.addColorStop(1, OGImageService.BRAND_COLORS.black);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Dynasty name styling
    ctx.font = 'bold 76px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.textAlign = 'center';
    const fullName = `${athleteData.firstName} ${athleteData.lastName}`;
    ctx.fillText(fullName, width / 2, height * 0.4);

    // Dynasty crown
    ctx.font = 'bold 32px Inter, Arial, sans-serif';
    ctx.fillStyle = OGImageService.BRAND_COLORS.black;
    ctx.fillText('DYNASTY', width / 2, height * 0.6);

    this.drawPremiumBadge(ctx, width / 2, height - 80);
  }

  // Additional premium templates (champion, legacy, future, dynasty) would follow similar patterns
  // with increasingly sophisticated designs and effects

  /**
   * Generate and save OG image with slot support
   */
  async generateAndSaveOGImage(
    userId: number, 
    template: OGTemplate = 'minimal',
    slot: number = 1
  ): Promise<string | null> {
    if (!this.canvasAvailable) {
      console.warn('Canvas not available, cannot generate OG image');
      return null;
    }

    try {
      const profile = await db.query.athleteProfiles.findFirst({
        where: eq(athleteProfiles.userId, userId)
      });

      if (!profile) {
        throw new Error('Athlete profile not found');
      }

      // Check if user has access to this template
      const hasAccess = await this.checkTemplateAccess(userId, template);
      if (!hasAccess) {
        throw new Error('Template not available for current subscription tier');
      }

      const athleteData: AthleteData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        jerseyNumber: profile.jerseyNumber || undefined,
        primaryPosition: profile.primaryPosition || undefined,
        graduationYear: profile.graduationYear || undefined,
        highSchoolName: profile.highSchoolName || undefined,
        sport: profile.sport || 'Football',
        heightInches: profile.heightInches || undefined,
        weightLbs: profile.weightLbs || undefined
      };

      // Get selected action photo if available
      if (profile.actionPhotos && profile.selectedOgPhotoId) {
        const actionPhotos = profile.actionPhotos as any[];
        const selectedPhoto = actionPhotos.find(photo => photo.id === profile.selectedOgPhotoId);
        if (selectedPhoto) {
          athleteData.actionPhotoUrl = selectedPhoto.url;
        }
      }

      const imageBuffer = await this.generateOGImage(athleteData, { template, slot });
      
      if (!imageBuffer) {
        return null;
      }

      const uploadsDir = path.join(__dirname, '../../uploads/og-images');
      await fs.mkdir(uploadsDir, { recursive: true });

      const filename = `og-${profile.slug}-${template}-slot${slot}-${Date.now()}.png`;
      const filepath = path.join(uploadsDir, filename);
      
      await fs.writeFile(filepath, imageBuffer);

      const ogImageUrl = `/uploads/og-images/${filename}`;

      // Update profile with generated OG image URL for this slot
      const updateData: any = {
        ogImageLastGenerated: new Date()
      };

      // Store multiple OG images in JSON structure
      const currentOgImages = (profile.generatedOgImageUrl as any) || {};
      currentOgImages[`slot${slot}`] = {
        url: ogImageUrl,
        template,
        generatedAt: new Date().toISOString()
      };
      updateData.generatedOgImageUrl = currentOgImages;

      await db.update(athleteProfiles)
        .set(updateData)
        .where(eq(athleteProfiles.userId, userId));

      return ogImageUrl;
    } catch (error) {
      console.error('Failed to generate OG image:', error);
      return null;
    }
  }

  /**
   * Check if user has access to template based on subscription tier
   */
  async checkTemplateAccess(userId: number, template: OGTemplate): Promise<boolean> {
    // Get user's subscription tier and viral sharing count
    const userTier = await this.getUserTier(userId);
    
    const templateTiers = {
      // Free tier (1 template)
      'minimal': 'free',
      
      // Viral tier (3 templates) - unlocked by sharing 25 profiles
      'bold': 'viral',
      'action': 'viral',
      'stats': 'viral',
      
      // Premium tier (10 templates) - $9.99/mo
      'elite': 'premium',
      'signature': 'premium',
      'champion': 'premium',
      'legacy': 'premium',
      'future': 'premium',
      'dynasty': 'premium'
    };

    const requiredTier = templateTiers[template] || 'premium';
    
    switch (requiredTier) {
      case 'free':
        return true;
      case 'viral':
        return userTier === 'viral' || userTier === 'premium';
      case 'premium':
        return userTier === 'premium';
      default:
        return false;
    }
  }

  /**
   * Get user's current tier based on subscription and viral sharing
   */
  async getUserTier(userId: number): Promise<'free' | 'viral' | 'premium'> {
    // TODO: Implement actual subscription and viral sharing logic
    // For now, return free tier
    
    // Check if user has premium subscription
    // const subscription = await checkSubscription(userId);
    // if (subscription?.active) return 'premium';
    
    // Check viral sharing count
    // const viralShares = await getViralShareCount(userId);
    // if (viralShares >= 25) return 'viral';
    
    return 'free';
  }

  /**
   * Get available templates for user
   */
  async getAvailableTemplates(userId: number): Promise<{ template: OGTemplate; tier: string; locked: boolean }[]> {
    const userTier = await this.getUserTier(userId);
    
    const templates = [
      { template: 'minimal' as OGTemplate, tier: 'free', locked: false },
      { template: 'bold' as OGTemplate, tier: 'viral', locked: userTier === 'free' },
      { template: 'action' as OGTemplate, tier: 'viral', locked: userTier === 'free' },
      { template: 'stats' as OGTemplate, tier: 'viral', locked: userTier === 'free' },
      { template: 'elite' as OGTemplate, tier: 'premium', locked: userTier !== 'premium' },
      { template: 'signature' as OGTemplate, tier: 'premium', locked: userTier !== 'premium' },
      { template: 'champion' as OGTemplate, tier: 'premium', locked: userTier !== 'premium' },
      { template: 'legacy' as OGTemplate, tier: 'premium', locked: userTier !== 'premium' },
      { template: 'future' as OGTemplate, tier: 'premium', locked: userTier !== 'premium' },
      { template: 'dynasty' as OGTemplate, tier: 'premium', locked: userTier !== 'premium' }
    ];

    return templates;
  }

  /**
   * Get maximum OG image slots for user tier
   */
  async getMaxSlots(userId: number): Promise<number> {
    const userTier = await this.getUserTier(userId);
    
    switch (userTier) {
      case 'free': return 1;
      case 'viral': return 3;
      case 'premium': return 10;
      default: return 1;
    }
  }

  isAvailable(): boolean {
    return this.canvasAvailable;
  }
}

export const ogImageService = new OGImageService(); 