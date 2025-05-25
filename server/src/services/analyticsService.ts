import { db } from '../db/client';
import { 
  userInteractions, 
  profileEngagement, 
  mlPredictions, 
  analyticsInsights, 
  searchAnalytics, 
  performanceMetrics 
} from '../db/schema/analytics';
import { users, athleteProfiles } from '../db/schema';
import { eq, desc, and, gte, lte, sql, count, avg, sum } from 'drizzle-orm';

// Types for analytics data
export interface UserInteractionData {
  userId: number;
  targetUserId?: number;
  targetProfileId?: number;
  interactionType: 'view' | 'contact' | 'favorite' | 'search' | 'click';
  interactionContext?: string;
  metadata?: any;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface EngagementMetrics {
  profileId: number;
  views: number;
  uniqueViews: number;
  contacts: number;
  favorites: number;
  searchAppearances: number;
  searchClicks: number;
  engagementScore: number;
}

export interface MLPrediction {
  modelName: string;
  modelVersion: string;
  targetType: 'user' | 'profile' | 'interaction';
  targetId: number;
  predictionType: 'engagement_score' | 'match_probability' | 'risk_score' | 'profile_optimization';
  prediction: any;
  confidence: number;
  features?: any;
  expiresAt?: Date;
}

export interface AnalyticsInsight {
  insightType: 'profile_optimization' | 'recruiter_targeting' | 'market_trend' | 'performance_improvement';
  targetType: 'user' | 'profile' | 'system';
  targetId?: number;
  title: string;
  description: string;
  recommendations: any[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  dataPoints?: any;
  expiresAt?: Date;
  isRead?: boolean;
  isActioned?: boolean;
}

export class AnalyticsService {
  
  // Track user interactions for ML training data
  async trackInteraction(interactionData: UserInteractionData): Promise<void> {
    try {
      await db.insert(userInteractions).values({
        userId: interactionData.userId,
        targetUserId: interactionData.targetUserId,
        targetProfileId: interactionData.targetProfileId,
        interactionType: interactionData.interactionType,
        interactionContext: interactionData.interactionContext,
        metadata: interactionData.metadata,
        sessionId: interactionData.sessionId,
        ipAddress: interactionData.ipAddress,
        userAgent: interactionData.userAgent,
      });

      // Update engagement metrics if it's a profile interaction
      if (interactionData.targetProfileId) {
        await this.updateProfileEngagement(interactionData.targetProfileId, interactionData.interactionType);
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw error;
    }
  }

  // Update profile engagement metrics
  private async updateProfileEngagement(profileId: number, interactionType: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Get or create today's engagement record
      const existingRecord = await db
        .select()
        .from(profileEngagement)
        .where(and(
          eq(profileEngagement.profileId, profileId),
          eq(profileEngagement.date, today)
        ))
        .limit(1);

      if (existingRecord.length > 0) {
        // Update existing record
        const updates: any = { updatedAt: new Date() };
        
        switch (interactionType) {
          case 'view':
            updates.views = sql`${profileEngagement.views} + 1`;
            break;
          case 'contact':
            updates.contacts = sql`${profileEngagement.contacts} + 1`;
            break;
          case 'favorite':
            updates.favorites = sql`${profileEngagement.favorites} + 1`;
            break;
          case 'click':
            updates.searchClicks = sql`${profileEngagement.searchClicks} + 1`;
            break;
        }

        await db
          .update(profileEngagement)
          .set(updates)
          .where(eq(profileEngagement.id, existingRecord[0].id));
      } else {
        // Create new record
        const initialMetrics = {
          profileId,
          date: today,
          views: interactionType === 'view' ? 1 : 0,
          uniqueViews: 0, // Will be calculated separately
          contacts: interactionType === 'contact' ? 1 : 0,
          favorites: interactionType === 'favorite' ? 1 : 0,
          searchAppearances: 0,
          searchClicks: interactionType === 'click' ? 1 : 0,
          engagementScore: '0.00',
        };

        await db.insert(profileEngagement).values(initialMetrics);
      }

      // Recalculate engagement score
      await this.calculateEngagementScore(profileId);
    } catch (error) {
      console.error('Error updating profile engagement:', error);
      throw error;
    }
  }

  // Calculate engagement score using ML-inspired algorithm
  private async calculateEngagementScore(profileId: number): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get 30-day engagement metrics
      const metrics = await db
        .select({
          totalViews: sum(profileEngagement.views),
          totalContacts: sum(profileEngagement.contacts),
          totalFavorites: sum(profileEngagement.favorites),
          totalClicks: sum(profileEngagement.searchClicks),
        })
        .from(profileEngagement)
        .where(and(
          eq(profileEngagement.profileId, profileId),
          gte(profileEngagement.date, thirtyDaysAgo)
        ));

      if (metrics.length > 0) {
        const { totalViews, totalContacts, totalFavorites, totalClicks } = metrics[0];
        
        // Weighted engagement score calculation
        const viewWeight = 1;
        const contactWeight = 5;
        const favoriteWeight = 3;
        const clickWeight = 2;

        const rawScore = 
          (Number(totalViews) || 0) * viewWeight +
          (Number(totalContacts) || 0) * contactWeight +
          (Number(totalFavorites) || 0) * favoriteWeight +
          (Number(totalClicks) || 0) * clickWeight;

        // Normalize to 0-100 scale (logarithmic scaling for better distribution)
        const engagementScore = Math.min(100, Math.log10(rawScore + 1) * 25);

        // Update today's record with calculated score
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await db
          .update(profileEngagement)
          .set({ 
            engagementScore: engagementScore.toFixed(2),
            updatedAt: new Date()
          })
          .where(and(
            eq(profileEngagement.profileId, profileId),
            eq(profileEngagement.date, today)
          ));
      }
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      throw error;
    }
  }

  // Generate ML predictions for profiles
  async generateProfilePredictions(profileId: number): Promise<MLPrediction[]> {
    try {
      const predictions: MLPrediction[] = [];

      // Get profile data for feature extraction
      const profile = await db
        .select()
        .from(athleteProfiles)
        .where(eq(athleteProfiles.userId, profileId))
        .limit(1);

      if (profile.length === 0) {
        throw new Error('Profile not found');
      }

      const profileData = profile[0];

      // Get engagement history for ML features
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const engagementHistory = await db
        .select()
        .from(profileEngagement)
        .where(and(
          eq(profileEngagement.profileId, profileId),
          gte(profileEngagement.date, thirtyDaysAgo)
        ))
        .orderBy(desc(profileEngagement.date));

      // Feature extraction for ML models
      const features = this.extractProfileFeatures(profileData, engagementHistory);

      // Engagement Score Prediction
      const engagementPrediction = this.predictEngagementScore(features);
      predictions.push({
        modelName: 'engagement_predictor',
        modelVersion: '1.0',
        targetType: 'profile',
        targetId: profileId,
        predictionType: 'engagement_score',
        prediction: { 
          predictedScore: engagementPrediction.score,
          trend: engagementPrediction.trend,
          factors: engagementPrediction.factors
        },
        confidence: engagementPrediction.confidence,
        features,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Profile Optimization Prediction
      const optimizationPrediction = this.predictProfileOptimization(features);
      predictions.push({
        modelName: 'profile_optimizer',
        modelVersion: '1.0',
        targetType: 'profile',
        targetId: profileId,
        predictionType: 'profile_optimization',
        prediction: {
          completionScore: optimizationPrediction.completionScore,
          missingFields: optimizationPrediction.missingFields,
          improvementAreas: optimizationPrediction.improvementAreas
        },
        confidence: optimizationPrediction.confidence,
        features,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Store predictions in database
      for (const prediction of predictions) {
        await db.insert(mlPredictions).values({
          modelName: prediction.modelName,
          modelVersion: prediction.modelVersion,
          targetType: prediction.targetType,
          targetId: prediction.targetId,
          predictionType: prediction.predictionType,
          prediction: prediction.prediction,
          confidence: prediction.confidence.toFixed(4), // Convert to string for decimal field
          features: prediction.features,
          isActive: true,
          expiresAt: prediction.expiresAt,
        });
      }

      return predictions;
    } catch (error) {
      console.error('Error generating profile predictions:', error);
      throw error;
    }
  }

  // Extract features for ML models
  private extractProfileFeatures(profileData: any, engagementHistory: any[]): any {
    const features = {
      // Profile completeness features
      hasProfileImage: !!profileData.profileImageUrl,
      hasPhysicalMeasurements: !!(profileData.heightInches && profileData.weightLbs),
      hasPerformanceMetrics: !!(profileData.fortyYardDash || profileData.benchPressMax || profileData.verticalLeap),
      hasAcademicInfo: !!(profileData.gpa && profileData.graduationYear),
      hasContactInfo: !!profileData.phoneNumber,
      
      // Athletic features
      sport: profileData.sport,
      primaryPosition: profileData.primaryPosition,
      graduationYear: profileData.graduationYear,
      gpa: Number(profileData.gpa) || 0,
      
      // Performance features
      fortyYardDash: Number(profileData.fortyYardDash) || 0,
      benchPressMax: profileData.benchPressMax || 0,
      verticalLeap: Number(profileData.verticalLeap) || 0,
      
      // Engagement features
      totalViews: engagementHistory.reduce((sum: number, day: any) => sum + (day.views || 0), 0),
      totalContacts: engagementHistory.reduce((sum: number, day: any) => sum + (day.contacts || 0), 0),
      totalFavorites: engagementHistory.reduce((sum: number, day: any) => sum + (day.favorites || 0), 0),
      avgEngagementScore: engagementHistory.length > 0 
        ? engagementHistory.reduce((sum: number, day: any) => sum + Number(day.engagementScore || 0), 0) / engagementHistory.length 
        : 0,
      
      // Temporal features
      daysSinceCreated: Math.floor((Date.now() - new Date(profileData.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      daysSinceUpdated: Math.floor((Date.now() - new Date(profileData.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
    };

    return features;
  }

  // Simple ML model for engagement score prediction
  private predictEngagementScore(features: any): any {
    // Simplified engagement prediction algorithm
    let baseScore = 0;
    let confidence = 0.7;
    const factors = [];

    // Profile completeness impact
    const completenessScore = [
      features.hasProfileImage,
      features.hasPhysicalMeasurements,
      features.hasPerformanceMetrics,
      features.hasAcademicInfo,
      features.hasContactInfo
    ].filter(Boolean).length / 5;

    baseScore += completenessScore * 30;
    if (completenessScore > 0.8) factors.push('Complete profile information');

    // Performance metrics impact
    if (features.fortyYardDash > 0 && features.fortyYardDash < 4.5) {
      baseScore += 20;
      factors.push('Excellent 40-yard dash time');
    }
    if (features.gpa > 3.5) {
      baseScore += 15;
      factors.push('Strong academic performance');
    }

    // Historical engagement impact
    if (features.avgEngagementScore > 50) {
      baseScore += 25;
      factors.push('Strong historical engagement');
    }

    // Recency impact
    if (features.daysSinceUpdated < 7) {
      baseScore += 10;
      factors.push('Recently updated profile');
    }

    // Determine trend
    const trend = features.avgEngagementScore > 30 ? 'increasing' : 
                  features.avgEngagementScore > 10 ? 'stable' : 'decreasing';

    return {
      score: Math.min(100, Math.max(0, baseScore)),
      trend,
      factors,
      confidence
    };
  }

  // Profile optimization prediction
  private predictProfileOptimization(features: any): any {
    const missingFields = [];
    const improvementAreas = [];
    let completionScore = 0;

    // Check required fields
    if (!features.hasProfileImage) {
      missingFields.push('profile_image');
      improvementAreas.push('Add a professional profile photo');
    } else {
      completionScore += 20;
    }

    if (!features.hasPhysicalMeasurements) {
      missingFields.push('physical_measurements');
      improvementAreas.push('Add height and weight information');
    } else {
      completionScore += 20;
    }

    if (!features.hasPerformanceMetrics) {
      missingFields.push('performance_metrics');
      improvementAreas.push('Add athletic performance statistics');
    } else {
      completionScore += 25;
    }

    if (!features.hasAcademicInfo) {
      missingFields.push('academic_info');
      improvementAreas.push('Add GPA and graduation year');
    } else {
      completionScore += 20;
    }

    if (!features.hasContactInfo) {
      missingFields.push('contact_info');
      improvementAreas.push('Add phone number for recruiter contact');
    } else {
      completionScore += 15;
    }

    // Performance-based recommendations
    if (features.fortyYardDash === 0) {
      improvementAreas.push('Add 40-yard dash time to showcase speed');
    }
    if (features.gpa < 3.0 && features.gpa > 0) {
      improvementAreas.push('Consider highlighting other academic achievements');
    }

    return {
      completionScore,
      missingFields,
      improvementAreas,
      confidence: 0.9
    };
  }

  // Generate insights for users
  async generateInsights(userId: number, targetType: 'user' | 'profile' = 'user'): Promise<AnalyticsInsight[]> {
    try {
      const insights: AnalyticsInsight[] = [];

      if (targetType === 'profile') {
        // Get latest predictions for this profile
        const predictions = await db
          .select()
          .from(mlPredictions)
          .where(and(
            eq(mlPredictions.targetId, userId),
            eq(mlPredictions.targetType, 'profile'),
            eq(mlPredictions.isActive, true)
          ))
          .orderBy(desc(mlPredictions.createdAt))
          .limit(10);

        // Generate insights based on predictions
        for (const prediction of predictions) {
          if (prediction.predictionType === 'profile_optimization') {
            const optimizationData = prediction.prediction as any;
            
            if (optimizationData.completionScore < 80) {
              insights.push({
                insightType: 'profile_optimization',
                targetType: 'profile',
                targetId: userId,
                title: 'Profile Optimization Opportunity',
                description: `Your profile is ${optimizationData.completionScore}% complete. Completing your profile can significantly increase recruiter interest.`,
                recommendations: optimizationData.improvementAreas.map((area: string) => ({
                  action: area,
                  impact: 'high',
                  effort: 'low'
                })),
                priority: optimizationData.completionScore < 50 ? 'high' : 'medium',
                confidence: Number(prediction.confidence),
                dataPoints: {
                  completionScore: optimizationData.completionScore,
                  missingFields: optimizationData.missingFields
                }
              });
            }
          }

          if (prediction.predictionType === 'engagement_score') {
            const engagementData = prediction.prediction as any;
            
            if (engagementData.predictedScore > 70) {
              insights.push({
                insightType: 'performance_improvement',
                targetType: 'profile',
                targetId: userId,
                title: 'High Engagement Potential',
                description: `Your profile shows strong engagement potential with a predicted score of ${engagementData.predictedScore.toFixed(1)}.`,
                recommendations: [
                  {
                    action: 'Share your profile with target recruiters',
                    impact: 'high',
                    effort: 'medium'
                  },
                  {
                    action: 'Update your performance metrics regularly',
                    impact: 'medium',
                    effort: 'low'
                  }
                ],
                priority: 'medium',
                confidence: Number(prediction.confidence),
                dataPoints: {
                  predictedScore: engagementData.predictedScore,
                  trend: engagementData.trend,
                  factors: engagementData.factors
                }
              });
            }
          }
        }
      }

      // Store insights in database
      for (const insight of insights) {
        await db.insert(analyticsInsights).values({
          insightType: insight.insightType,
          targetType: insight.targetType,
          targetId: insight.targetId,
          title: insight.title,
          description: insight.description,
          recommendations: insight.recommendations,
          priority: insight.priority,
          confidence: insight.confidence.toFixed(4), // Convert to string for decimal field
          dataPoints: insight.dataPoints,
          isRead: false,
          isActioned: false,
          expiresAt: insight.expiresAt,
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  // Get analytics dashboard data
  async getDashboardData(userId: number, userRole: string): Promise<any> {
    try {
      const dashboardData: any = {
        overview: {},
        insights: [],
        predictions: [],
        engagement: {}
      };

      if (userRole === 'admin') {
        // Admin dashboard - system-wide metrics
        dashboardData.overview = await this.getSystemMetrics();
        dashboardData.insights = await this.getSystemInsights();
      } else {
        // User dashboard - personal metrics
        dashboardData.overview = await this.getUserMetrics(userId);
        dashboardData.insights = await this.getUserInsights(userId);
        dashboardData.predictions = await this.getUserPredictions(userId);
        dashboardData.engagement = await this.getUserEngagement(userId);
      }

      return dashboardData;
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // Get system-wide metrics for admin dashboard
  async getSystemMetrics(): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsers, totalProfiles, totalInteractions, avgEngagement] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(athleteProfiles),
      db.select({ count: count() }).from(userInteractions).where(gte(userInteractions.createdAt, thirtyDaysAgo)),
      db.select({ avg: avg(profileEngagement.engagementScore) }).from(profileEngagement).where(gte(profileEngagement.date, thirtyDaysAgo))
    ]);

    return {
      totalUsers: totalUsers[0].count,
      totalProfiles: totalProfiles[0].count,
      monthlyInteractions: totalInteractions[0].count,
      averageEngagement: Number(avgEngagement[0].avg) || 0
    };
  }

  // Get system insights for admin
  async getSystemInsights(): Promise<any[]> {
    return await db
      .select()
      .from(analyticsInsights)
      .where(eq(analyticsInsights.targetType, 'system'))
      .orderBy(desc(analyticsInsights.createdAt))
      .limit(10);
  }

  // Get user-specific metrics
  async getUserMetrics(userId: number): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [profileViews, profileContacts, engagementScore] = await Promise.all([
      db.select({ count: count() }).from(userInteractions)
        .where(and(
          eq(userInteractions.targetProfileId, userId),
          eq(userInteractions.interactionType, 'view'),
          gte(userInteractions.createdAt, thirtyDaysAgo)
        )),
      db.select({ count: count() }).from(userInteractions)
        .where(and(
          eq(userInteractions.targetProfileId, userId),
          eq(userInteractions.interactionType, 'contact'),
          gte(userInteractions.createdAt, thirtyDaysAgo)
        )),
      db.select({ avg: avg(profileEngagement.engagementScore) }).from(profileEngagement)
        .where(and(
          eq(profileEngagement.profileId, userId),
          gte(profileEngagement.date, thirtyDaysAgo)
        ))
    ]);

    return {
      monthlyViews: profileViews[0].count,
      monthlyContacts: profileContacts[0].count,
      engagementScore: Number(engagementScore[0].avg) || 0
    };
  }

  // Get user insights
  async getUserInsights(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(analyticsInsights)
      .where(and(
        eq(analyticsInsights.targetId, userId),
        eq(analyticsInsights.isRead, false)
      ))
      .orderBy(desc(analyticsInsights.priority), desc(analyticsInsights.createdAt))
      .limit(5);
  }

  // Get user predictions
  async getUserPredictions(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(mlPredictions)
      .where(and(
        eq(mlPredictions.targetId, userId),
        eq(mlPredictions.isActive, true)
      ))
      .orderBy(desc(mlPredictions.createdAt))
      .limit(5);
  }

  // Get user engagement data
  async getUserEngagement(userId: number): Promise<any> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const engagementHistory = await db
      .select()
      .from(profileEngagement)
      .where(and(
        eq(profileEngagement.profileId, userId),
        gte(profileEngagement.date, sevenDaysAgo)
      ))
      .orderBy(profileEngagement.date);

    return {
      history: engagementHistory,
      totalViews: engagementHistory.reduce((sum: number, day: any) => sum + (day.views || 0), 0),
      totalContacts: engagementHistory.reduce((sum: number, day: any) => sum + (day.contacts || 0), 0),
      totalFavorites: engagementHistory.reduce((sum: number, day: any) => sum + (day.favorites || 0), 0)
    };
  }
}

export const analyticsService = new AnalyticsService(); 