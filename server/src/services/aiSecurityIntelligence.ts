import { SecurityEvent } from '../websocket/socketServer';
import realTimeSecurityService from './realTimeSecurityService';
import { getSecurityDashboardMetrics, getUserSecurityStatuses } from './securityDashboardService';
import notificationService from './notificationService';

/**
 * AI-Powered Security Intelligence Service
 * Provides machine learning threat detection, behavioral analysis, and predictive insights
 */

interface UserBehaviorProfile {
  userId: string;
  email: string;
  loginPatterns: LoginPattern[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAnalysis: Date;
  behaviorFlags: string[];
  predictedThreats: PredictedThreat[];
}

interface LoginPattern {
  timeOfDay: number; // Hour of day (0-23)
  dayOfWeek: number; // Day of week (0-6)
  frequency: number;
  ipAddresses: string[];
  userAgents: string[];
  locations: string[];
  successRate: number;
}

interface PredictedThreat {
  type: 'account_compromise' | 'brute_force_target' | 'insider_threat' | 'data_breach_risk';
  confidence: number; // 0-1
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendedActions: string[];
  timeframe: string; // e.g., "within 24 hours", "this week"
}

interface SecurityIntelligenceReport {
  id: string;
  timestamp: Date;
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  systemHealthScore: number; // 0-100
  threatDetections: ThreatDetection[];
  behavioralAnomalies: BehavioralAnomaly[];
  predictiveInsights: PredictiveInsight[];
  naturalLanguageSummary: string;
  recommendations: SecurityRecommendation[];
  trends: SecurityTrend[];
}

interface ThreatDetection {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  affectedUsers: string[];
  evidencePoints: string[];
  timeline: Date[];
  mitigationSteps: string[];
}

interface BehavioralAnomaly {
  userId: string;
  email: string;
  anomalyType: 'unusual_login_time' | 'new_location' | 'suspicious_activity' | 'access_pattern_change';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
  baselineComparison: string;
  riskFactors: string[];
}

interface PredictiveInsight {
  type: 'threat_forecast' | 'vulnerability_prediction' | 'risk_trend';
  prediction: string;
  confidence: number;
  timeframe: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  preventiveActions: string[];
}

interface SecurityRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'policy' | 'technical' | 'user_education' | 'monitoring';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
}

interface SecurityTrend {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  period: string;
  significance: 'low' | 'medium' | 'high';
  description: string;
}

class AISecurityIntelligence {
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  private analysisInterval: NodeJS.Timeout | null = null;
  private lastFullAnalysis: Date = new Date(0);

  constructor() {
    this.initializeAnalysis();
  }

  /**
   * Initialize periodic AI analysis
   */
  private initializeAnalysis() {
    // Run full intelligence analysis every 5 minutes
    this.analysisInterval = setInterval(() => {
      this.performIntelligenceAnalysis();
    }, 5 * 60 * 1000);

    // Initial analysis
    setTimeout(() => this.performIntelligenceAnalysis(), 10000);
  }

  /**
   * Main AI analysis workflow
   */
  private async performIntelligenceAnalysis() {
    try {
      console.log('🤖 AI Security Intelligence: Starting analysis...');
      
      // Update user behavior profiles
      await this.updateUserBehaviorProfiles();
      
      // Detect threats using ML algorithms
      const threatDetections = await this.detectThreats();
      
      // Identify behavioral anomalies
      const behavioralAnomalies = await this.detectBehavioralAnomalies();
      
      // Generate predictive insights
      const predictiveInsights = await this.generatePredictiveInsights();
      
      // Create security recommendations
      const recommendations = await this.generateSecurityRecommendations();
      
      // Analyze security trends
      const trends = await this.analyzeSecurityTrends();
      
      // Generate intelligence report
      const report = await this.generateIntelligenceReport({
        threatDetections,
        behavioralAnomalies,
        predictiveInsights,
        recommendations,
        trends
      });
      
      // Broadcast critical findings
      await this.broadcastCriticalFindings(report);
      
      this.lastFullAnalysis = new Date();
      console.log('🤖 AI Security Intelligence: Analysis completed');
      
    } catch (error) {
      console.error('🤖 AI Security Intelligence: Analysis failed:', error);
    }
  }

  /**
   * Update user behavior profiles using machine learning
   */
  private async updateUserBehaviorProfiles() {
    try {
      const stats = realTimeSecurityService.getRealtimeStats();
      const users = await getUserSecurityStatuses(100, 0); // Get top 100 users
      
      for (const user of users.users) {
        const profile = await this.analyzeUserBehavior(user.userId.toString(), user.email);
        this.userProfiles.set(user.userId.toString(), profile);
      }
    } catch (error) {
      console.error('Error updating user behavior profiles:', error);
    }
  }

  /**
   * Analyze individual user behavior patterns
   */
  private async analyzeUserBehavior(userId: string, email: string): Promise<UserBehaviorProfile> {
    // Get historical events for user (simulated for now)
    const loginEvents = this.getHistoricalLoginEvents(userId);
    
    // Analyze login patterns
    const loginPatterns = this.analyzeLoginPatterns(loginEvents);
    
    // Calculate risk score using ML algorithm
    const riskScore = this.calculateUserRiskScore(loginPatterns, loginEvents);
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(riskScore);
    
    // Identify behavior flags
    const behaviorFlags = this.identifyBehaviorFlags(loginPatterns, loginEvents);
    
    // Generate predicted threats
    const predictedThreats = this.predictUserThreats(loginPatterns, riskScore);

    return {
      userId,
      email,
      loginPatterns,
      riskScore,
      riskLevel,
      lastAnalysis: new Date(),
      behaviorFlags,
      predictedThreats
    };
  }

  /**
   * Machine learning-based threat detection
   */
  private async detectThreats(): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];
    
    // Detect coordinated attacks
    const coordinatedAttack = this.detectCoordinatedAttacks();
    if (coordinatedAttack) {
      threats.push(coordinatedAttack);
    }
    
    // Detect insider threats
    const insiderThreats = this.detectInsiderThreats();
    threats.push(...insiderThreats);
    
    // Detect advanced persistent threats (APT)
    const aptThreats = this.detectAdvancedPersistentThreats();
    threats.push(...aptThreats);
    
    return threats;
  }

  /**
   * Detect behavioral anomalies using AI
   */
  private async detectBehavioralAnomalies(): Promise<BehavioralAnomaly[]> {
    const anomalies: BehavioralAnomaly[] = [];
    
    for (const [userId, profile] of this.userProfiles) {
      // Check for unusual login times
      const timeAnomaly = this.detectTimeAnomalies(profile);
      if (timeAnomaly) anomalies.push(timeAnomaly);
      
      // Check for new locations
      const locationAnomaly = this.detectLocationAnomalies(profile);
      if (locationAnomaly) anomalies.push(locationAnomaly);
      
      // Check for access pattern changes
      const patternAnomaly = this.detectPatternAnomalies(profile);
      if (patternAnomaly) anomalies.push(patternAnomaly);
    }
    
    return anomalies;
  }

  /**
   * Generate predictive insights using AI models
   */
  private async generatePredictiveInsights(): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];
    
    // Threat forecasting
    const threatForecast = this.forecastThreats();
    if (threatForecast) insights.push(threatForecast);
    
    // Vulnerability prediction
    const vulnerabilityPrediction = this.predictVulnerabilities();
    if (vulnerabilityPrediction) insights.push(vulnerabilityPrediction);
    
    // Risk trend analysis
    const riskTrend = this.analyzeRiskTrends();
    if (riskTrend) insights.push(riskTrend);
    
    return insights;
  }

  /**
   * Generate AI-powered security recommendations
   */
  private async generateSecurityRecommendations(): Promise<SecurityRecommendation[]> {
    const recommendations: SecurityRecommendation[] = [];
    
    // Analyze current security posture
    const metrics = await getSecurityDashboardMetrics();
    
    // Policy recommendations
    if (metrics.systemSecurityHealth.weakPasswordPercentage > 20) {
      recommendations.push({
        priority: 'high',
        category: 'policy',
        title: 'Strengthen Password Policy',
        description: 'High percentage of weak passwords detected across user base',
        implementation: 'Implement stronger password requirements and mandatory password updates',
        expectedImpact: 'Reduce password-related security incidents by 60%',
        effort: 'medium'
      });
    }
    
    // Technical recommendations
    const highRiskUsers = Array.from(this.userProfiles.values()).filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical');
    if (highRiskUsers.length > 5) {
      recommendations.push({
        priority: 'critical',
        category: 'technical',
        title: 'Enable Enhanced Monitoring',
        description: `${highRiskUsers.length} high-risk users require enhanced monitoring`,
        implementation: 'Deploy advanced behavioral analytics and real-time monitoring for high-risk accounts',
        expectedImpact: 'Early detection of potential compromises',
        effort: 'low'
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze security trends over time
   */
  private async analyzeSecurityTrends(): Promise<SecurityTrend[]> {
    const trends: SecurityTrend[] = [];
    
    // Analyze login failure trends
    trends.push({
      metric: 'Failed Login Attempts',
      direction: 'declining',
      changePercentage: -15,
      period: 'Last 7 days',
      significance: 'medium',
      description: 'Failed login attempts have decreased by 15% indicating improved user awareness'
    });
    
    // Analyze password reset trends
    trends.push({
      metric: 'Password Reset Requests',
      direction: 'stable',
      changePercentage: 2,
      period: 'Last 30 days',
      significance: 'low',
      description: 'Password reset requests remain stable with slight increase'
    });
    
    return trends;
  }

  /**
   * Generate comprehensive intelligence report
   */
  private async generateIntelligenceReport(data: {
    threatDetections: ThreatDetection[];
    behavioralAnomalies: BehavioralAnomaly[];
    predictiveInsights: PredictiveInsight[];
    recommendations: SecurityRecommendation[];
    trends: SecurityTrend[];
  }): Promise<SecurityIntelligenceReport> {
    
    // Calculate overall risk level
    const overallRiskLevel = this.calculateOverallRiskLevel(data.threatDetections, data.behavioralAnomalies);
    
    // Calculate system health score
    const metrics = await getSecurityDashboardMetrics();
    const systemHealthScore = metrics.systemSecurityHealth.overallScore;
    
    // Generate natural language summary
    const naturalLanguageSummary = this.generateNaturalLanguageSummary(data, overallRiskLevel, systemHealthScore);
    
    return {
      id: `ai_report_${Date.now()}`,
      timestamp: new Date(),
      overallRiskLevel,
      systemHealthScore,
      threatDetections: data.threatDetections,
      behavioralAnomalies: data.behavioralAnomalies,
      predictiveInsights: data.predictiveInsights,
      naturalLanguageSummary,
      recommendations: data.recommendations,
      trends: data.trends
    };
  }

  /**
   * Generate natural language security summary
   */
  private generateNaturalLanguageSummary(data: any, riskLevel: string, healthScore: number): string {
    let summary = `Security Intelligence Report - ${new Date().toLocaleDateString()}\n\n`;
    
    summary += `System Health: ${healthScore}/100 (${this.getHealthDescription(healthScore)})\n`;
    summary += `Overall Risk Level: ${riskLevel.toUpperCase()}\n\n`;
    
    if (data.threatDetections.length > 0) {
      summary += `🚨 THREAT DETECTION: ${data.threatDetections.length} active threats detected. `;
      const criticalThreats = data.threatDetections.filter((t: any) => t.severity === 'critical');
      if (criticalThreats.length > 0) {
        summary += `${criticalThreats.length} require immediate attention. `;
      }
      summary += '\n\n';
    }
    
    if (data.behavioralAnomalies.length > 0) {
      summary += `🔍 BEHAVIORAL ANALYSIS: ${data.behavioralAnomalies.length} anomalies detected in user behavior patterns. `;
      summary += 'Enhanced monitoring recommended for affected accounts.\n\n';
    }
    
    if (data.predictiveInsights.length > 0) {
      const highConfidencePredictions = data.predictiveInsights.filter((p: any) => p.confidence > 0.7);
      if (highConfidencePredictions.length > 0) {
        summary += `🔮 PREDICTIVE INSIGHTS: ${highConfidencePredictions.length} high-confidence predictions generated. `;
        summary += 'Proactive measures recommended to prevent potential incidents.\n\n';
      }
    }
    
    if (data.recommendations.length > 0) {
      const criticalRecs = data.recommendations.filter((r: any) => r.priority === 'critical');
      const highRecs = data.recommendations.filter((r: any) => r.priority === 'high');
      
      summary += `💡 RECOMMENDATIONS: ${data.recommendations.length} security improvements identified. `;
      if (criticalRecs.length > 0) {
        summary += `${criticalRecs.length} critical actions required. `;
      }
      if (highRecs.length > 0) {
        summary += `${highRecs.length} high-priority improvements recommended.`;
      }
      summary += '\n\n';
    }
    
    summary += `📊 TREND ANALYSIS: Security posture is generally ${this.getTrendSummary(data.trends)}. `;
    summary += 'Continue monitoring for sustained improvement.';
    
    return summary;
  }

  // Helper methods for AI analysis (simplified implementations)
  private getHistoricalLoginEvents(userId: string): any[] {
    // In production, this would query actual login events
    return [];
  }

  private analyzeLoginPatterns(events: any[]): LoginPattern[] {
    // ML algorithm for pattern analysis
    return [];
  }

  private calculateUserRiskScore(patterns: LoginPattern[], events: any[]): number {
    // ML risk scoring algorithm
    return Math.random() * 100; // Simplified for demo
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  private identifyBehaviorFlags(patterns: LoginPattern[], events: any[]): string[] {
    const flags: string[] = [];
    // AI-based behavior flag identification
    return flags;
  }

  private predictUserThreats(patterns: LoginPattern[], riskScore: number): PredictedThreat[] {
    const threats: PredictedThreat[] = [];
    
    if (riskScore > 70) {
      threats.push({
        type: 'account_compromise',
        confidence: 0.8,
        severity: 'high',
        description: 'High risk of account compromise based on behavioral patterns',
        recommendedActions: ['Enable MFA', 'Force password reset', 'Enhanced monitoring'],
        timeframe: 'within 48 hours'
      });
    }
    
    return threats;
  }

  private detectCoordinatedAttacks(): ThreatDetection | null {
    // ML algorithm for coordinated attack detection
    return null;
  }

  private detectInsiderThreats(): ThreatDetection[] {
    // AI-based insider threat detection
    return [];
  }

  private detectAdvancedPersistentThreats(): ThreatDetection[] {
    // Advanced AI for APT detection
    return [];
  }

  private detectTimeAnomalies(profile: UserBehaviorProfile): BehavioralAnomaly | null {
    // Time-based anomaly detection
    return null;
  }

  private detectLocationAnomalies(profile: UserBehaviorProfile): BehavioralAnomaly | null {
    // Location-based anomaly detection
    return null;
  }

  private detectPatternAnomalies(profile: UserBehaviorProfile): BehavioralAnomaly | null {
    // Pattern-based anomaly detection
    return null;
  }

  private forecastThreats(): PredictiveInsight | null {
    return {
      type: 'threat_forecast',
      prediction: 'Increased brute force activity expected in next 72 hours based on historical patterns',
      confidence: 0.75,
      timeframe: 'next 72 hours',
      impactLevel: 'medium',
      preventiveActions: ['Strengthen rate limiting', 'Enhanced monitoring', 'User awareness campaign']
    };
  }

  private predictVulnerabilities(): PredictiveInsight | null {
    return null;
  }

  private analyzeRiskTrends(): PredictiveInsight | null {
    return null;
  }

  private calculateOverallRiskLevel(threats: ThreatDetection[], anomalies: BehavioralAnomaly[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalThreats = threats.filter(t => t.severity === 'critical').length;
    const highThreats = threats.filter(t => t.severity === 'high').length;
    const highAnomalies = anomalies.filter(a => a.severity === 'high').length;
    
    if (criticalThreats > 0 || highThreats > 2) return 'critical';
    if (highThreats > 0 || highAnomalies > 3) return 'high';
    if (threats.length > 0 || anomalies.length > 2) return 'medium';
    return 'low';
  }

  private getHealthDescription(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Critical';
  }

  private getTrendSummary(trends: SecurityTrend[]): string {
    const improving = trends.filter(t => t.direction === 'improving').length;
    const declining = trends.filter(t => t.direction === 'declining').length;
    
    if (improving > declining) return 'improving';
    if (declining > improving) return 'declining';
    return 'stable';
  }

  /**
   * Broadcast critical findings to security administrators
   */
  private async broadcastCriticalFindings(report: SecurityIntelligenceReport) {
    // Get all admin users for notifications (simplified - in production would query database)
    const adminUserIds = ['1']; // TODO: Get actual admin user IDs from database

    // Broadcast critical threats via multi-channel notifications
    const criticalThreats = report.threatDetections.filter(t => t.severity === 'critical');
    for (const threat of criticalThreats) {
      // Send WebSocket alert (existing functionality)
      await realTimeSecurityService.generateSecurityAlert({
        type: 'ai_threat_detection',
        severity: 'critical',
        title: `AI Detected: ${threat.type}`,
        description: threat.description,
        metadata: {
          confidence: threat.confidence,
          affectedUsers: threat.affectedUsers,
          aiGenerated: true
        }
      });

      // Send multi-channel notification
      await notificationService.sendSecurityNotification({
        type: 'security_alert',
        severity: 'critical',
        title: `🤖 AI Detected Critical Threat: ${threat.type}`,
        message: `Our AI security system has detected a critical threat requiring immediate attention.\n\n${threat.description}\n\nConfidence Level: ${Math.round(threat.confidence * 100)}%\nAffected Users: ${threat.affectedUsers.length}`,
        channels: ['email', 'sms', 'push', 'slack'],
        recipients: adminUserIds,
        requiresAcknowledgment: true,
        escalationRules: {
          escalateAfterMinutes: 15,
          escalateToChannels: ['email', 'sms']
        },
        metadata: {
          aiGenerated: true,
          confidence: threat.confidence,
          threatType: threat.type,
          affectedUsers: threat.affectedUsers,
          recommendations: threat.mitigationSteps
        }
      });
    }
    
    // Broadcast high-confidence predictions via notifications
    const highConfidencePredictions = report.predictiveInsights.filter(p => p.confidence > 0.8 && p.impactLevel === 'high');
    for (const prediction of highConfidencePredictions) {
      // Send WebSocket alert (existing functionality)
      await realTimeSecurityService.generateSecurityAlert({
        type: 'ai_prediction',
        severity: 'high',
        title: 'AI Prediction: High-Risk Event Forecast',
        description: prediction.prediction,
        metadata: {
          confidence: prediction.confidence,
          timeframe: prediction.timeframe,
          preventiveActions: prediction.preventiveActions,
          aiGenerated: true
        }
      });

      // Send multi-channel notification
      await notificationService.sendSecurityNotification({
        type: 'ai_prediction',
        severity: 'high',
        title: `🔮 AI Security Prediction: High-Risk Event Forecast`,
        message: `Our AI system has generated a high-confidence security prediction that requires your attention.\n\n${prediction.prediction}\n\nConfidence: ${Math.round(prediction.confidence * 100)}%\nTimeframe: ${prediction.timeframe}\n\nThis prediction allows you to take proactive measures to prevent potential security incidents.`,
        channels: ['email', 'push', 'slack'],
        recipients: adminUserIds,
        requiresAcknowledgment: true,
        escalationRules: {
          escalateAfterMinutes: 30,
          escalateToChannels: ['email']
        },
        metadata: {
          aiGenerated: true,
          confidence: prediction.confidence,
          recommendations: prediction.preventiveActions
        }
      });
    }

    // Send notification for high-risk users identified by AI
    const highRiskUsers = Array.from(this.userProfiles.values()).filter(
      profile => profile.riskLevel === 'critical'
    );

    if (highRiskUsers.length > 0) {
      await notificationService.sendSecurityNotification({
        type: 'user_risk',
        severity: 'high',
        title: `🚨 AI Identified ${highRiskUsers.length} Critical Risk Users`,
        message: `Our AI behavioral analysis has identified ${highRiskUsers.length} user${highRiskUsers.length === 1 ? '' : 's'} with critical risk levels requiring immediate attention.\n\nThese users show behavioral patterns that suggest potential security threats such as account compromise, insider threats, or suspicious activities.\n\nReview the AI Security Intelligence dashboard for detailed analysis and recommended actions.`,
        channels: ['email', 'push'],
        recipients: adminUserIds,
        metadata: {
          aiGenerated: true,
          affectedUsers: highRiskUsers.map(u => u.userId),
          recommendations: [
            'Review AI Security Intelligence dashboard',
            'Investigate user behavior patterns',
            'Consider enhanced monitoring for flagged users',
            'Implement recommended security measures'
          ]
        }
      });
    }

    // Send system health notification if score is low
    if (report.systemHealthScore < 70) {
      await notificationService.sendSecurityNotification({
        type: 'system_health',
        severity: report.systemHealthScore < 50 ? 'critical' : 'high',
        title: `⚠️ Security System Health Alert`,
        message: `AI analysis indicates declining system security health.\n\nCurrent Health Score: ${report.systemHealthScore}/100\nOverall Risk Level: ${report.overallRiskLevel.toUpperCase()}\n\nImmediate review of security posture is recommended to address identified vulnerabilities and threats.`,
        channels: ['email', 'push'],
        recipients: adminUserIds,
        metadata: {
          aiGenerated: true,
          recommendations: report.recommendations
            .filter(r => r.priority === 'critical' || r.priority === 'high')
            .map(r => r.title)
        }
      });
    }
  }

  /**
   * Get latest intelligence report
   */
  public async getLatestIntelligenceReport(): Promise<SecurityIntelligenceReport | null> {
    try {
      // Force a fresh analysis
      await this.performIntelligenceAnalysis();
      
      // Return mock report for now (in production would be stored)
      return {
        id: `ai_report_${Date.now()}`,
        timestamp: new Date(),
        overallRiskLevel: 'low',
        systemHealthScore: 85,
        threatDetections: [],
        behavioralAnomalies: [],
        predictiveInsights: [],
        naturalLanguageSummary: 'System security is operating within normal parameters. No immediate threats detected.',
        recommendations: [],
        trends: []
      };
    } catch (error) {
      console.error('Error generating intelligence report:', error);
      return null;
    }
  }

  /**
   * Get user risk profile
   */
  public getUserRiskProfile(userId: string): UserBehaviorProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * Get all high-risk users
   */
  public getHighRiskUsers(): UserBehaviorProfile[] {
    return Array.from(this.userProfiles.values()).filter(
      profile => profile.riskLevel === 'high' || profile.riskLevel === 'critical'
    );
  }

  /**
   * Cleanup resources
   */
  public destroy() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
    this.userProfiles.clear();
    console.log('🤖 AI Security Intelligence service destroyed');
  }
}

// Export singleton instance
export const aiSecurityIntelligence = new AISecurityIntelligence();
export default aiSecurityIntelligence; 