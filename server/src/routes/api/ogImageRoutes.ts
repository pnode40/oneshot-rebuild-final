import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middleware/validationMiddleware';
import { authenticate } from '../../middleware/authMiddleware';
import { ogImageService } from '../../services/ogImageService';
import { db } from '../../db/client';
import { athleteProfiles } from '../../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Validation schemas
const generateOGImageSchema = z.object({
  template: z.enum(['minimal', 'bold', 'action', 'stats', 'elite', 'signature', 'champion', 'legacy', 'future', 'dynasty']).default('minimal'),
  regenerate: z.boolean().default(false),
  slot: z.number().min(1).max(10).default(1)
});

const selectOGPhotoSchema = z.object({
  photoId: z.string().min(1, 'Photo ID is required')
});

/**
 * POST /api/v1/og-image/generate
 * Generate OG image for authenticated user's profile
 */
router.post('/generate',
  authenticate,
  validateRequest({ body: generateOGImageSchema }),
  async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { template, regenerate, slot } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Check if canvas is available
      if (!ogImageService.isAvailable()) {
        return res.status(503).json({
          success: false,
          message: 'OG image generation service is not available'
        });
      }

      // Check if user has access to this template
      const hasAccess = await ogImageService.checkTemplateAccess(userId, template);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Template not available for your current tier. Upgrade or share more profiles to unlock!',
          upgradeRequired: true
        });
      }

      // Check if user has access to this slot
      const maxSlots = await ogImageService.getMaxSlots(userId);
      if (slot > maxSlots) {
        return res.status(403).json({
          success: false,
          message: `Slot ${slot} not available. Your tier allows ${maxSlots} OG image${maxSlots > 1 ? 's' : ''}.`,
          upgradeRequired: true
        });
      }

      // Check if user has an athlete profile
      const profile = await db.query.athleteProfiles.findFirst({
        where: eq(athleteProfiles.userId, userId)
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Athlete profile not found'
        });
      }

      // Check if OG image already exists for this slot and regenerate is false
      const currentOgImages = (profile.generatedOgImageUrl as any) || {};
      if (currentOgImages[`slot${slot}`] && !regenerate) {
        return res.json({
          success: true,
          message: 'OG image already exists for this slot',
          data: {
            ogImageUrl: currentOgImages[`slot${slot}`].url,
            template: currentOgImages[`slot${slot}`].template,
            slot,
            lastGenerated: currentOgImages[`slot${slot}`].generatedAt
          }
        });
      }

      // Generate OG image
      const ogImageUrl = await ogImageService.generateAndSaveOGImage(userId, template, slot);

      if (!ogImageUrl) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate OG image'
        });
      }

      res.json({
        success: true,
        message: 'OG image generated successfully',
        data: {
          ogImageUrl,
          template,
          slot,
          lastGenerated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error generating OG image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate OG image'
      });
    }
  }
);

/**
 * GET /api/v1/og-image/templates
 * Get available templates for authenticated user
 */
router.get('/templates',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Get available templates for user
      const templates = await ogImageService.getAvailableTemplates(userId);
      const maxSlots = await ogImageService.getMaxSlots(userId);
      const userTier = await ogImageService.getUserTier(userId);

      res.json({
        success: true,
        data: {
          templates,
          maxSlots,
          userTier,
          tiers: {
            free: { slots: 1, templates: 1, price: 'Free' },
            viral: { slots: 3, templates: 4, price: 'Share 25 profiles' },
            premium: { slots: 10, templates: 10, price: '$9.99/mo' }
          }
        }
      });
    } catch (error) {
      console.error('Error getting templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available templates'
      });
    }
  }
);

/**
 * POST /api/v1/og-image/generate-all
 * Generate OG images for all available slots (premium feature)
 */
router.post('/generate-all',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Check if canvas is available
      if (!ogImageService.isAvailable()) {
        return res.status(503).json({
          success: false,
          message: 'OG image generation service is not available'
        });
      }

      // Check if user has premium access
      const userTier = await ogImageService.getUserTier(userId);
      if (userTier !== 'premium') {
        return res.status(403).json({
          success: false,
          message: 'Generate-all feature requires premium subscription',
          upgradeRequired: true
        });
      }

      // Check if user has an athlete profile
      const profile = await db.query.athleteProfiles.findFirst({
        where: eq(athleteProfiles.userId, userId)
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Athlete profile not found'
        });
      }

      // Generate multiple templates across different slots
      const templates = await ogImageService.getAvailableTemplates(userId);
      const availableTemplates = templates.filter(t => !t.locked).map(t => t.template);
      const maxSlots = await ogImageService.getMaxSlots(userId);
      
      const results: { [key: string]: string } = {};
      
      for (let i = 0; i < Math.min(availableTemplates.length, maxSlots); i++) {
        const template = availableTemplates[i];
        const slot = i + 1;
        
        try {
          const ogImageUrl = await ogImageService.generateAndSaveOGImage(userId, template, slot);
          if (ogImageUrl) {
            results[`slot${slot}_${template}`] = ogImageUrl;
          }
        } catch (error) {
          console.error(`Failed to generate ${template} for slot ${slot}:`, error);
        }
      }

      res.json({
        success: true,
        message: 'OG images generated successfully',
        data: {
          results,
          count: Object.keys(results).length,
          lastGenerated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error generating OG image templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate OG image templates'
      });
    }
  }
);

/**
 * POST /api/v1/og-image/select-photo
 * Select action photo for OG image generation
 */
router.post('/select-photo',
  authenticate,
  validateRequest({ body: selectOGPhotoSchema }),
  async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { photoId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Update profile with selected OG photo
      const result = await db.update(athleteProfiles)
        .set({
          selectedOgPhotoId: photoId,
          // Clear existing OG images to force regeneration
          generatedOgImageUrl: null,
          ogImageLastGenerated: null
        })
        .where(eq(athleteProfiles.userId, userId))
        .returning({ slug: athleteProfiles.slug });

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Athlete profile not found'
        });
      }

      res.json({
        success: true,
        message: 'OG photo selected successfully',
        data: {
          selectedPhotoId: photoId,
          message: 'Generate new OG images to see changes'
        }
      });
    } catch (error) {
      console.error('Error selecting OG photo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to select OG photo'
      });
    }
  }
);

/**
 * GET /api/v1/og-image/status
 * Get OG image generation status for authenticated user
 */
router.get('/status',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Get profile OG image status
      const profile = await db.query.athleteProfiles.findFirst({
        where: eq(athleteProfiles.userId, userId),
        columns: {
          generatedOgImageUrl: true,
          ogImageLastGenerated: true,
          selectedOgPhotoId: true,
          actionPhotos: true
        }
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Athlete profile not found'
        });
      }

      const actionPhotos = (profile.actionPhotos as any[]) || [];
      const selectedPhoto = actionPhotos.find(photo => photo.id === profile.selectedOgPhotoId);
      const ogImages = (profile.generatedOgImageUrl as any) || {};
      const maxSlots = await ogImageService.getMaxSlots(userId);
      const userTier = await ogImageService.getUserTier(userId);

      res.json({
        success: true,
        data: {
          hasOgImages: Object.keys(ogImages).length > 0,
          ogImages,
          lastGenerated: profile.ogImageLastGenerated,
          selectedPhotoId: profile.selectedOgPhotoId,
          selectedPhoto: selectedPhoto || null,
          actionPhotosCount: actionPhotos.length,
          canGenerate: ogImageService.isAvailable(),
          serviceStatus: ogImageService.isAvailable() ? 'available' : 'unavailable',
          maxSlots,
          userTier,
          slotsUsed: Object.keys(ogImages).length
        }
      });
    } catch (error) {
      console.error('Error getting OG image status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get OG image status'
      });
    }
  }
);

/**
 * GET /api/v1/og-image/:slug
 * Get OG image for public profile (used by meta tags)
 */
router.get('/:slug',
  async (req, res) => {
    try {
      const { slug } = req.params;

      // Get profile by slug
      const profile = await db.query.athleteProfiles.findFirst({
        where: eq(athleteProfiles.slug, slug),
        columns: {
          generatedOgImageUrl: true,
          profileImageUrl: true,
          firstName: true,
          lastName: true
        }
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      // Get the primary OG image (slot1) or fallback to profile image
      const ogImages = (profile.generatedOgImageUrl as any) || {};
      const primaryOgImage = ogImages.slot1?.url;
      const ogImageUrl = primaryOgImage || profile.profileImageUrl;

      if (!ogImageUrl) {
        return res.status(404).json({
          success: false,
          message: 'No OG image available'
        });
      }

      res.json({
        success: true,
        data: {
          ogImageUrl,
          isGenerated: !!primaryOgImage,
          profileName: `${profile.firstName} ${profile.lastName}`,
          availableSlots: Object.keys(ogImages).length
        }
      });
    } catch (error) {
      console.error('Error getting public OG image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get OG image'
      });
    }
  }
);

export default router; 