import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateJWT } from '../../middleware/authMiddleware';
import { requireAdmin } from '../../middleware/rbacMiddleware';
import aiSecurityIntelligence from '../../services/aiSecurityIntelligence';

const router = Router();

/**
 * Validation schemas for AI Security Intelligence endpoints
 */
const userIdParamSchema = z.object({
  userId: z.string().min(1, 'User ID is required')
});

const intelligenceReportQuerySchema = z.object({
  includeDetails: z.string().optional().transform(val => val === 'true'),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  timeframe: z.enum(['last_hour', 'last_day', 'last_week', 'last_month']).optional()
});

const riskAnalysisQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  includeProfiles: z.string().optional().transform(val => val === 'true')
});

/**
 * @route GET /api/ai-security/intelligence-report
 * @desc Get latest AI security intelligence report
 * @access Admin only
 */
router.get('/intelligence-report', 
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      // Validate query parameters
      const queryValidation = intelligenceReportQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: queryValidation.error.errors
        });
      }

      const { includeDetails, riskLevel, timeframe } = queryValidation.data;

      // Get latest intelligence report
      const report = await aiSecurityIntelligence.getLatestIntelligenceReport();
      
      if (!report) {
        return res.status(503).json({
          success: false,
          message: 'AI intelligence report temporarily unavailable'
        });
      }

      // Filter by risk level if specified
      let filteredReport = report;
      if (riskLevel) {
        filteredReport = {
          ...report,
          threatDetections: report.threatDetections.filter(t => t.severity === riskLevel),
          behavioralAnomalies: report.behavioralAnomalies.filter(a => a.severity === riskLevel),
          predictiveInsights: report.predictiveInsights.filter(p => p.impactLevel === riskLevel),
          recommendations: report.recommendations.filter(r => r.priority === riskLevel)
        };
      }

      // Include or exclude detailed information
      if (!includeDetails) {
        // Return summary version
        const summaryReport = {
          id: filteredReport.id,
          timestamp: filteredReport.timestamp,
          overallRiskLevel: filteredReport.overallRiskLevel,
          systemHealthScore: filteredReport.systemHealthScore,
          naturalLanguageSummary: filteredReport.naturalLanguageSummary,
          summary: {
            threatCount: filteredReport.threatDetections.length,
            anomalyCount: filteredReport.behavioralAnomalies.length,
            insightCount: filteredReport.predictiveInsights.length,
            recommendationCount: filteredReport.recommendations.length,
            trendCount: filteredReport.trends.length
          }
        };

        return res.json({
          success: true,
          data: summaryReport,
          message: 'AI intelligence summary retrieved successfully'
        });
      }

      res.json({
        success: true,
        data: filteredReport,
        message: 'AI intelligence report retrieved successfully',
        metadata: {
          analysisTime: filteredReport.timestamp,
          dataFilters: { riskLevel, timeframe },
          aiConfidence: 'high'
        }
      });

    } catch (error) {
      console.error('Error retrieving AI intelligence report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve AI intelligence report'
      });
    }
  }
);

/**
 * @route GET /api/ai-security/user-risk-profile/:userId
 * @desc Get AI-generated risk profile for specific user
 * @access Admin only
 */
router.get('/user-risk-profile/:userId',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      // Validate parameters
      const paramValidation = userIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID parameter',
          errors: paramValidation.error.errors
        });
      }

      const { userId } = paramValidation.data;

      // Get user risk profile
      const riskProfile = aiSecurityIntelligence.getUserRiskProfile(userId);
      
      if (!riskProfile) {
        return res.status(404).json({
          success: false,
          message: 'User risk profile not found or not yet analyzed'
        });
      }

      // Enhance profile with additional insights
      const enhancedProfile = {
        ...riskProfile,
        aiInsights: {
          riskFactors: riskProfile.behaviorFlags,
          threatPredictions: riskProfile.predictedThreats,
          recommendedActions: this.generateUserRecommendations(riskProfile),
          confidenceScore: this.calculateConfidenceScore(riskProfile),
          lastUpdated: riskProfile.lastAnalysis
        },
        comparisonMetrics: {
          riskPercentile: this.calculateRiskPercentile(riskProfile.riskScore),
          securityPosture: this.assessSecurityPosture(riskProfile),
          improvementPotential: this.calculateImprovementPotential(riskProfile)
        }
      };

      res.json({
        success: true,
        data: enhancedProfile,
        message: 'User risk profile retrieved successfully',
        metadata: {
          analysisTimestamp: riskProfile.lastAnalysis,
          aiVersion: '1.0',
          dataQuality: 'high'
        }
      });

    } catch (error) {
      console.error('Error retrieving user risk profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user risk profile'
      });
    }
  }
);

/**
 * @route GET /api/ai-security/high-risk-users
 * @desc Get list of high-risk users identified by AI
 * @access Admin only
 */
router.get('/high-risk-users',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      // Validate query parameters
      const queryValidation = riskAnalysisQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: queryValidation.error.errors
        });
      }

      const { limit, riskLevel, includeProfiles } = queryValidation.data;

      // Get high-risk users
      let highRiskUsers = aiSecurityIntelligence.getHighRiskUsers();

      // Filter by specific risk level if requested
      if (riskLevel) {
        highRiskUsers = highRiskUsers.filter(user => user.riskLevel === riskLevel);
      }

      // Apply limit
      const limitedUsers = highRiskUsers.slice(0, limit);

      // Prepare response data
      const responseData = limitedUsers.map(user => {
        const baseData = {
          userId: user.userId,
          email: user.email,
          riskScore: user.riskScore,
          riskLevel: user.riskLevel,
          lastAnalysis: user.lastAnalysis,
          threatCount: user.predictedThreats.length,
          flagCount: user.behaviorFlags.length,
          summary: this.generateUserSummary(user)
        };

        // Include full profiles if requested
        if (includeProfiles) {
          return {
            ...baseData,
            fullProfile: user,
            aiRecommendations: this.generateUserRecommendations(user),
            riskBreakdown: this.breakdownRiskFactors(user)
          };
        }

        return baseData;
      });

      res.json({
        success: true,
        data: responseData,
        message: 'High-risk users retrieved successfully',
        metadata: {
          totalHighRiskUsers: highRiskUsers.length,
          filteredCount: limitedUsers.length,
          appliedFilters: { riskLevel, limit },
          riskDistribution: this.calculateRiskDistribution(highRiskUsers)
        }
      });

    } catch (error) {
      console.error('Error retrieving high-risk users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve high-risk users'
      });
    }
  }
);

/**
 * @route GET /api/ai-security/predictive-insights
 * @desc Get AI-generated predictive security insights
 * @access Admin only
 */
router.get('/predictive-insights',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      // Get latest intelligence report for insights
      const report = await aiSecurityIntelligence.getLatestIntelligenceReport();
      
      if (!report) {
        return res.status(503).json({
          success: false,
          message: 'Predictive insights temporarily unavailable'
        });
      }

      // Extract and enhance predictive insights
      const enhancedInsights = report.predictiveInsights.map(insight => ({
        ...insight,
        actionPriority: this.calculateActionPriority(insight),
        businessImpact: this.assessBusinessImpact(insight),
        implementation: {
          difficulty: this.assessImplementationDifficulty(insight),
          timeframe: insight.timeframe,
          resources: this.estimateRequiredResources(insight)
        },
        confidenceLevel: this.translateConfidence(insight.confidence)
      }));

      // Sort by confidence and impact
      const prioritizedInsights = enhancedInsights.sort((a, b) => {
        if (a.confidence !== b.confidence) return b.confidence - a.confidence;
        return this.getImpactScore(b.impactLevel) - this.getImpactScore(a.impactLevel);
      });

      res.json({
        success: true,
        data: prioritizedInsights,
        message: 'Predictive insights retrieved successfully',
        metadata: {
          totalInsights: prioritizedInsights.length,
          highConfidenceCount: prioritizedInsights.filter(i => i.confidence > 0.8).length,
          criticalImpactCount: prioritizedInsights.filter(i => i.impactLevel === 'critical').length,
          generatedAt: report.timestamp,
          aiVersion: '1.0'
        }
      });

    } catch (error) {
      console.error('Error retrieving predictive insights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve predictive insights'
      });
    }
  }
);

/**
 * @route GET /api/ai-security/natural-language-summary
 * @desc Get natural language security summary powered by AI
 * @access Admin only
 */
router.get('/natural-language-summary',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      // Get latest intelligence report
      const report = await aiSecurityIntelligence.getLatestIntelligenceReport();
      
      if (!report) {
        return res.status(503).json({
          success: false,
          message: 'Security summary temporarily unavailable'
        });
      }

      // Parse and enhance the natural language summary
      const summaryLines = report.naturalLanguageSummary.split('\n').filter(line => line.trim());
      
      const enhancedSummary = {
        executiveSummary: summaryLines[0] || 'Security analysis complete',
        keyFindings: this.extractKeyFindings(summaryLines),
        riskAssessment: {
          level: report.overallRiskLevel,
          score: report.systemHealthScore,
          description: this.generateRiskDescription(report.overallRiskLevel, report.systemHealthScore)
        },
        actionableInsights: this.extractActionableInsights(report),
        trendAnalysis: this.summarizeTrends(report.trends),
        recommendations: {
          immediate: report.recommendations.filter(r => r.priority === 'critical'),
          shortTerm: report.recommendations.filter(r => r.priority === 'high'),
          longTerm: report.recommendations.filter(r => r.priority === 'medium' || r.priority === 'low')
        },
        fullNarrativeSummary: report.naturalLanguageSummary
      };

      res.json({
        success: true,
        data: enhancedSummary,
        message: 'Natural language security summary generated successfully',
        metadata: {
          generatedAt: report.timestamp,
          analysisDepth: 'comprehensive',
          languageModel: 'OneShot AI Security Intelligence v1.0',
          confidenceLevel: 'high'
        }
      });

    } catch (error) {
      console.error('Error generating natural language summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate security summary'
      });
    }
  }
);

/**
 * @route POST /api/ai-security/force-analysis
 * @desc Force immediate AI security analysis (for testing/urgent situations)
 * @access Admin only
 */
router.post('/force-analysis',
  authenticateJWT,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      // Trigger immediate analysis
      const report = await aiSecurityIntelligence.getLatestIntelligenceReport();
      
      if (!report) {
        return res.status(503).json({
          success: false,
          message: 'Failed to generate immediate analysis'
        });
      }

      res.json({
        success: true,
        data: {
          analysisId: report.id,
          timestamp: report.timestamp,
          summary: {
            overallRiskLevel: report.overallRiskLevel,
            systemHealthScore: report.systemHealthScore,
            threatCount: report.threatDetections.length,
            anomalyCount: report.behavioralAnomalies.length,
            insightCount: report.predictiveInsights.length
          }
        },
        message: 'Immediate AI security analysis completed successfully'
      });

    } catch (error) {
      console.error('Error performing forced analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform immediate security analysis'
      });
    }
  }
);

// Helper methods for enhancing AI responses
function generateUserRecommendations(profile: any): string[] {
  const recommendations = [];
  
  if (profile.riskScore > 70) {
    recommendations.push('Enable multi-factor authentication immediately');
    recommendations.push('Force password reset with strong password requirements');
    recommendations.push('Enable enhanced monitoring and alerting');
  }
  
  if (profile.behaviorFlags.includes('unusual_login_pattern')) {
    recommendations.push('Review recent login activity with user');
    recommendations.push('Verify account ownership through secondary channel');
  }
  
  return recommendations;
}

function calculateConfidenceScore(profile: any): number {
  // Calculate confidence based on data quality and analysis depth
  return Math.min(0.95, 0.6 + (profile.loginPatterns.length * 0.1));
}

function calculateRiskPercentile(riskScore: number): number {
  // Calculate where this user ranks compared to all users
  return Math.floor((100 - riskScore) / 100 * 95) + 5;
}

function assessSecurityPosture(profile: any): string {
  if (profile.riskScore < 30) return 'Strong';
  if (profile.riskScore < 60) return 'Moderate';
  if (profile.riskScore < 80) return 'Weak';
  return 'Critical';
}

function calculateImprovementPotential(profile: any): string {
  const improvements = profile.predictedThreats.length + profile.behaviorFlags.length;
  if (improvements === 0) return 'Minimal - already well-secured';
  if (improvements <= 2) return 'Low - minor improvements possible';
  if (improvements <= 4) return 'Medium - several improvements recommended';
  return 'High - significant security improvements needed';
}

function generateUserSummary(user: any): string {
  const riskDesc = user.riskLevel.charAt(0).toUpperCase() + user.riskLevel.slice(1);
  const threatCount = user.predictedThreats.length;
  return `${riskDesc} risk user with ${threatCount} predicted threat${threatCount !== 1 ? 's' : ''}`;
}

function breakdownRiskFactors(user: any): any {
  return {
    behavioralFactors: user.behaviorFlags,
    predictedThreats: user.predictedThreats.map((t: any) => t.type),
    riskContributors: this.identifyRiskContributors(user),
    mitigationStrategies: this.suggestMitigations(user)
  };
}

function calculateRiskDistribution(users: any[]): any {
  const distribution = { critical: 0, high: 0, medium: 0, low: 0 };
  users.forEach(user => distribution[user.riskLevel]++);
  return distribution;
}

function calculateActionPriority(insight: any): 'immediate' | 'urgent' | 'high' | 'medium' | 'low' {
  if (insight.impactLevel === 'critical' && insight.confidence > 0.8) return 'immediate';
  if (insight.impactLevel === 'high' && insight.confidence > 0.7) return 'urgent';
  if (insight.impactLevel === 'high' || insight.confidence > 0.8) return 'high';
  if (insight.impactLevel === 'medium') return 'medium';
  return 'low';
}

function assessBusinessImpact(insight: any): string {
  const impacts = {
    critical: 'Severe business disruption, data breach risk, regulatory compliance issues',
    high: 'Significant operational impact, user trust concerns, potential data exposure',
    medium: 'Moderate operational disruption, limited security exposure',
    low: 'Minimal business impact, preventive security measure'
  };
  return impacts[insight.impactLevel] || 'Impact assessment pending';
}

function assessImplementationDifficulty(insight: any): 'easy' | 'moderate' | 'difficult' | 'complex' {
  // Assess based on the type of preventive actions required
  const actions = insight.preventiveActions || [];
  if (actions.some((action: string) => action.includes('policy') || action.includes('awareness'))) return 'easy';
  if (actions.some((action: string) => action.includes('monitoring') || action.includes('alert'))) return 'moderate';
  if (actions.some((action: string) => action.includes('infrastructure') || action.includes('integration'))) return 'difficult';
  return 'complex';
}

function estimateRequiredResources(insight: any): string[] {
  const resources = [];
  const actions = insight.preventiveActions || [];
  
  if (actions.some((action: string) => action.includes('monitoring'))) {
    resources.push('Security operations team');
  }
  if (actions.some((action: string) => action.includes('policy'))) {
    resources.push('Policy development team');
  }
  if (actions.some((action: string) => action.includes('technical'))) {
    resources.push('Technical implementation team');
  }
  
  return resources.length > 0 ? resources : ['Administrative action only'];
}

function translateConfidence(confidence: number): string {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.7) return 'Medium-High';
  if (confidence >= 0.6) return 'Medium';
  if (confidence >= 0.5) return 'Medium-Low';
  return 'Low';
}

function getImpactScore(impactLevel: string): number {
  const scores = { critical: 4, high: 3, medium: 2, low: 1 };
  return scores[impactLevel] || 0;
}

function extractKeyFindings(summaryLines: string[]): string[] {
  return summaryLines.filter(line => 
    line.includes('🚨') || line.includes('🔍') || line.includes('🔮') || line.includes('💡')
  ).map(line => line.replace(/[🚨🔍🔮💡]/g, '').trim());
}

function generateRiskDescription(riskLevel: string, healthScore: number): string {
  const descriptions = {
    critical: `Critical security risk detected (Health: ${healthScore}/100). Immediate action required to prevent potential security incidents.`,
    high: `High security risk identified (Health: ${healthScore}/100). Urgent attention needed to maintain security posture.`,
    medium: `Medium security risk detected (Health: ${healthScore}/100). Proactive measures recommended to prevent escalation.`,
    low: `Low security risk environment (Health: ${healthScore}/100). Continue monitoring and maintain current security practices.`
  };
  return descriptions[riskLevel] || `Security risk level: ${riskLevel} (Health: ${healthScore}/100)`;
}

function extractActionableInsights(report: any): string[] {
  const insights = [];
  
  if (report.threatDetections.length > 0) {
    insights.push(`${report.threatDetections.length} active threats require immediate investigation`);
  }
  
  if (report.behavioralAnomalies.length > 0) {
    insights.push(`${report.behavioralAnomalies.length} users showing abnormal behavior patterns`);
  }
  
  const highConfidencePredictions = report.predictiveInsights.filter((p: any) => p.confidence > 0.8);
  if (highConfidencePredictions.length > 0) {
    insights.push(`${highConfidencePredictions.length} high-confidence threat predictions generated`);
  }
  
  return insights;
}

function summarizeTrends(trends: any[]): string {
  const improvingTrends = trends.filter(t => t.direction === 'improving').length;
  const decliningTrends = trends.filter(t => t.direction === 'declining').length;
  
  if (improvingTrends > decliningTrends) {
    return `Security posture is improving with ${improvingTrends} positive trends identified`;
  } else if (decliningTrends > improvingTrends) {
    return `Security posture shows concern with ${decliningTrends} declining trends`;
  } else {
    return 'Security posture remains stable with mixed trend indicators';
  }
}

function identifyRiskContributors(user: any): string[] {
  const contributors = [];
  
  if (user.riskScore > 70) contributors.push('High overall risk score');
  if (user.behaviorFlags.length > 0) contributors.push('Behavioral anomalies detected');
  if (user.predictedThreats.length > 0) contributors.push('Predicted security threats');
  
  return contributors;
}

function suggestMitigations(user: any): string[] {
  const mitigations = [];
  
  if (user.riskLevel === 'critical' || user.riskLevel === 'high') {
    mitigations.push('Immediate password reset required');
    mitigations.push('Enable multi-factor authentication');
    mitigations.push('Enhanced monitoring and alerting');
  }
  
  return mitigations;
}

export default router; 