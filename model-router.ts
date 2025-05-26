/**
 * AI Model Router - Intelligent routing for cost/performance optimization
 * Compatible with any AI model ecosystem (Claude, GPT, Gemini, etc.)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Model tiers - customize based on your available models
export enum ModelTier {
  NANO = 'nano',      // Fastest, cheapest (e.g., Haiku, GPT-3.5)
  MICRO = 'micro',    // Balanced small (e.g., Claude Instant)
  STANDARD = 'standard', // Default choice (e.g., Sonnet, GPT-4)
  POWER = 'power',    // Complex tasks (e.g., Opus, GPT-4-32k)
  ULTRA = 'ultra'     // Bleeding edge (e.g., Experimental models)
}

// Task classification
export interface TaskContext {
  prompt: string;
  fileContent?: string;
  fileName?: string;
  mode?: string; // [OPERATOR], [DEVELOPER], etc.
  history?: Message[];
  metadata?: Record<string, any>;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RoutingDecision {
  model: ModelTier;
  reasoning: string;
  confidence: number;
  estimatedTokens: number;
  estimatedCost: number;
  alternativeModels?: ModelTier[];
}

export interface RoutingLog {
  timestamp: Date;
  taskContext: TaskContext;
  decision: RoutingDecision;
  actualTokensUsed?: number;
  actualCost?: number;
  responseTime?: number;
  qualityScore?: number; // 0-1, filled by user feedback
}

// Configuration interface
export interface RoutingConfig {
  rules: RoutingRule[];
  costLimits?: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  };
  performanceTargets?: {
    maxLatency?: number;
    minQuality?: number;
  };
  learningEnabled?: boolean;
}

export interface RoutingRule {
  name: string;
  pattern?: RegExp;
  filePattern?: RegExp;
  modePattern?: string;
  model: ModelTier;
  priority?: number;
}

export class ModelRouter {
  private config: RoutingConfig;
  private logs: RoutingLog[] = [];
  private logPath: string;
  private configPath: string;
  private classifier: TaskClassifier;

  constructor(
    configPath: string = './routing-config.json',
    logPath: string = './routing-logs.json'
  ) {
    this.configPath = configPath;
    this.logPath = logPath;
    this.config = this.loadConfig();
    this.logs = this.loadLogs();
    this.classifier = new TaskClassifier();
  }

  /**
   * Main routing function - determines optimal model for task
   */
  async route(context: TaskContext): Promise<RoutingDecision> {
    // 1. Check rule-based routing first (fastest)
    const ruleBasedDecision = this.checkRules(context);
    if (ruleBasedDecision && ruleBasedDecision.confidence > 0.8) {
      this.logDecision(context, ruleBasedDecision);
      return ruleBasedDecision;
    }

    // 2. Smart routing based on analysis
    const smartDecision = await this.smartRoute(context);
    
    // 3. Learning-based override if enabled
    if (this.config.learningEnabled) {
      const learningDecision = this.applyLearning(context, smartDecision);
      if (learningDecision.confidence > smartDecision.confidence) {
        this.logDecision(context, learningDecision);
        return learningDecision;
      }
    }

    this.logDecision(context, smartDecision);
    return smartDecision;
  }

  /**
   * Rule-based routing - fastest tier
   */
  private checkRules(context: TaskContext): RoutingDecision | null {
    const sortedRules = [...this.config.rules].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );

    for (const rule of sortedRules) {
      if (this.matchesRule(context, rule)) {
        return {
          model: rule.model,
          reasoning: `Matched rule: ${rule.name}`,
          confidence: 0.9,
          estimatedTokens: this.classifier.estimateTokens(context),
          estimatedCost: this.estimateCost(rule.model, context)
        };
      }
    }

    return null;
  }

  /**
   * Smart routing based on task analysis
   */
  private async smartRoute(context: TaskContext): Promise<RoutingDecision> {
    const analysis = await this.classifier.analyze(context);
    
    let model: ModelTier;
    let reasoning: string;
    
    // Complex decision tree based on multiple factors
    if (analysis.complexity > 0.8 || analysis.estimatedTokens > 10000) {
      model = ModelTier.POWER;
      reasoning = 'High complexity or large context requires powerful model';
    } else if (analysis.complexity < 0.3 && analysis.estimatedTokens < 1000) {
      model = ModelTier.NANO;
      reasoning = 'Simple task suitable for fast/cheap model';
    } else if (analysis.domain === 'architecture' || analysis.requiresReasoning) {
      model = ModelTier.POWER;
      reasoning = `${analysis.domain} tasks benefit from advanced reasoning`;
    } else if (analysis.urgency > 0.7 && analysis.complexity < 0.5) {
      model = ModelTier.MICRO;
      reasoning = 'Urgent but simple - using fast model';
    } else {
      model = ModelTier.STANDARD;
      reasoning = 'Standard complexity - using default model';
    }

    // Check cost limits
    const projectedCost = this.estimateCost(model, context);
    if (this.wouldExceedCostLimit(projectedCost)) {
      model = this.downgradeModel(model);
      reasoning += ' (downgraded due to cost limits)';
    }

    return {
      model,
      reasoning,
      confidence: 0.7,
      estimatedTokens: analysis.estimatedTokens,
      estimatedCost: this.estimateCost(model, context),
      alternativeModels: this.getAlternatives(model)
    };
  }

  /**
   * Learning-based routing optimization
   */
  private applyLearning(
    context: TaskContext, 
    currentDecision: RoutingDecision
  ): RoutingDecision {
    // Find similar past tasks
    const similarTasks = this.findSimilarTasks(context);
    if (similarTasks.length < 5) {
      return currentDecision; // Not enough data
    }

    // Analyze performance by model
    const modelPerformance = this.analyzeModelPerformance(similarTasks);
    
    // Find optimal model based on quality/cost ratio
    let optimalModel = currentDecision.model;
    let bestScore = 0;

    for (const [model, stats] of Object.entries(modelPerformance)) {
      const qualityCostRatio = stats.avgQuality / stats.avgCost;
      if (qualityCostRatio > bestScore) {
        bestScore = qualityCostRatio;
        optimalModel = model as ModelTier;
      }
    }

    if (optimalModel !== currentDecision.model) {
      return {
        ...currentDecision,
        model: optimalModel,
        reasoning: `Learning system suggests ${optimalModel} based on ${similarTasks.length} similar tasks`,
        confidence: 0.85
      };
    }

    return currentDecision;
  }

  /**
   * Helper methods
   */
  private matchesRule(context: TaskContext, rule: RoutingRule): boolean {
    if (rule.pattern && rule.pattern.test(context.prompt)) {
      return true;
    }
    if (rule.filePattern && context.fileName && 
        rule.filePattern.test(context.fileName)) {
      return true;
    }
    if (rule.modePattern && context.mode && 
        context.mode === rule.modePattern) {
      return true;
    }
    return false;
  }

  private estimateCost(model: ModelTier, context: TaskContext): number {
    const tokens = this.classifier.estimateTokens(context);
    const costPerKToken = {
      [ModelTier.NANO]: 0.0001,
      [ModelTier.MICRO]: 0.001,
      [ModelTier.STANDARD]: 0.01,
      [ModelTier.POWER]: 0.1,
      [ModelTier.ULTRA]: 1.0
    };
    return (tokens / 1000) * costPerKToken[model];
  }

  private wouldExceedCostLimit(projectedCost: number): boolean {
    if (!this.config.costLimits) return false;
    
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const hourlyCost = this.logs
      .filter(log => log.timestamp > hourAgo)
      .reduce((sum, log) => sum + (log.actualCost || log.decision.estimatedCost), 0);
      
    if (this.config.costLimits.hourly && 
        hourlyCost + projectedCost > this.config.costLimits.hourly) {
      return true;
    }
    
    // Similar checks for daily/monthly...
    return false;
  }

  private downgradeModel(model: ModelTier): ModelTier {
    const tiers = Object.values(ModelTier);
    const currentIndex = tiers.indexOf(model);
    return currentIndex > 0 ? tiers[currentIndex - 1] : model;
  }

  private getAlternatives(model: ModelTier): ModelTier[] {
    const tiers = Object.values(ModelTier);
    const currentIndex = tiers.indexOf(model);
    return [
      ...(currentIndex > 0 ? [tiers[currentIndex - 1]] : []),
      ...(currentIndex < tiers.length - 1 ? [tiers[currentIndex + 1]] : [])
    ];
  }

  private findSimilarTasks(context: TaskContext): RoutingLog[] {
    return this.logs.filter(log => {
      const similarity = this.calculateSimilarity(
        context.prompt, 
        log.taskContext.prompt
      );
      return similarity > 0.7;
    });
  }

  private calculateSimilarity(a: string, b: string): number {
    // Simple word overlap - could be enhanced with embeddings
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
    const union = new Set([...wordsA, ...wordsB]);
    return intersection.size / union.size;
  }

  private analyzeModelPerformance(logs: RoutingLog[]): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const log of logs) {
      const model = log.decision.model;
      if (!stats[model]) {
        stats[model] = {
          count: 0,
          totalCost: 0,
          totalQuality: 0,
          avgCost: 0,
          avgQuality: 0
        };
      }
      
      stats[model].count++;
      stats[model].totalCost += log.actualCost || log.decision.estimatedCost;
      stats[model].totalQuality += log.qualityScore || 0.7;
    }
    
    // Calculate averages
    for (const model of Object.keys(stats)) {
      stats[model].avgCost = stats[model].totalCost / stats[model].count;
      stats[model].avgQuality = stats[model].totalQuality / stats[model].count;
    }
    
    return stats;
  }

  /**
   * Logging and persistence
   */
  private logDecision(context: TaskContext, decision: RoutingDecision): void {
    const log: RoutingLog = {
      timestamp: new Date(),
      taskContext: context,
      decision
    };
    
    this.logs.push(log);
    
    // Keep only last 10000 logs
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-10000);
    }
    
    this.saveLogs();
  }

  public updateLogWithActuals(
    timestamp: Date, 
    actualTokens: number, 
    actualCost: number,
    responseTime: number,
    qualityScore?: number
  ): void {
    const log = this.logs.find(l => 
      Math.abs(l.timestamp.getTime() - timestamp.getTime()) < 1000
    );
    
    if (log) {
      log.actualTokensUsed = actualTokens;
      log.actualCost = actualCost;
      log.responseTime = responseTime;
      log.qualityScore = qualityScore;
      this.saveLogs();
    }
  }

  /**
   * Reporting and analytics
   */
  public generateReport(): any {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentLogs = this.logs.filter(log => log.timestamp > dayAgo);
    
    return {
      totalRequests: recentLogs.length,
      modelUsage: this.getModelUsageStats(recentLogs),
      costAnalysis: this.getCostAnalysis(recentLogs),
      performanceMetrics: this.getPerformanceMetrics(recentLogs),
      recommendations: this.generateRecommendations(recentLogs)
    };
  }

  private getModelUsageStats(logs: RoutingLog[]): any {
    const usage: Record<string, number> = {};
    for (const log of logs) {
      usage[log.decision.model] = (usage[log.decision.model] || 0) + 1;
    }
    return usage;
  }

  private getCostAnalysis(logs: RoutingLog[]): any {
    const costs: Record<string, number> = {};
    let totalCost = 0;
    
    for (const log of logs) {
      const cost = log.actualCost || log.decision.estimatedCost;
      costs[log.decision.model] = (costs[log.decision.model] || 0) + cost;
      totalCost += cost;
    }
    
    return {
      totalCost,
      byModel: costs,
      averagePerRequest: totalCost / logs.length
    };
  }

  private getPerformanceMetrics(logs: RoutingLog[]): any {
    const metrics: Record<string, any> = {};
    
    for (const log of logs) {
      const model = log.decision.model;
      if (!metrics[model]) {
        metrics[model] = {
          avgResponseTime: 0,
          avgQuality: 0,
          count: 0
        };
      }
      
      if (log.responseTime) {
        metrics[model].avgResponseTime = 
          (metrics[model].avgResponseTime * metrics[model].count + log.responseTime) / 
          (metrics[model].count + 1);
      }
      
      if (log.qualityScore) {
        metrics[model].avgQuality = 
          (metrics[model].avgQuality * metrics[model].count + log.qualityScore) / 
          (metrics[model].count + 1);
      }
      
      metrics[model].count++;
    }
    
    return metrics;
  }

  private generateRecommendations(logs: RoutingLog[]): string[] {
    const recommendations: string[] = [];
    const costAnalysis = this.getCostAnalysis(logs);
    const performance = this.getPerformanceMetrics(logs);
    
    // Check for overuse of expensive models
    if (costAnalysis.byModel[ModelTier.POWER] > costAnalysis.totalCost * 0.7) {
      recommendations.push(
        'Consider downgrading some POWER model tasks to STANDARD - 70% of costs from highest tier'
      );
    }
    
    // Check for underutilization of cheap models
    const nanoUsage = this.getModelUsageStats(logs)[ModelTier.NANO] || 0;
    if (nanoUsage < logs.length * 0.3) {
      recommendations.push(
        'Increase usage of NANO model for simple tasks - currently under 30%'
      );
    }
    
    // Check quality vs cost
    for (const [model, perf] of Object.entries(performance)) {
      const perfData = perf as { avgQuality: number; avgResponseTime: number; count: number };
      if (perfData.avgQuality < 0.6 && model !== ModelTier.NANO) {
        recommendations.push(
          `${model} model showing low quality (${perfData.avgQuality.toFixed(2)}) - review task routing`
        );
      }
    }
    
    return recommendations;
  }

  /**
   * File I/O
   */
  private loadConfig(): RoutingConfig {
    if (existsSync(this.configPath)) {
      return JSON.parse(readFileSync(this.configPath, 'utf8'));
    }
    return { rules: [], learningEnabled: true };
  }

  private loadLogs(): RoutingLog[] {
    if (existsSync(this.logPath)) {
      const data = JSON.parse(readFileSync(this.logPath, 'utf8'));
      return data.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    }
    return [];
  }

  private saveLogs(): void {
    writeFileSync(this.logPath, JSON.stringify(this.logs, null, 2));
  }
}

/**
 * Task Classifier - Analyzes tasks to determine complexity and characteristics
 */
export class TaskClassifier {
  async analyze(context: TaskContext): Promise<any> {
    const tokens = this.estimateTokens(context);
    const complexity = this.calculateComplexity(context);
    const domain = this.detectDomain(context);
    const urgency = this.detectUrgency(context);
    const requiresReasoning = this.requiresDeepReasoning(context);
    
    return {
      estimatedTokens: tokens,
      complexity,
      domain,
      urgency,
      requiresReasoning,
      characteristics: this.extractCharacteristics(context)
    };
  }

  estimateTokens(context: TaskContext): number {
    let tokens = 0;
    
    // Rough estimation: 1 token ≈ 4 characters
    tokens += (context.prompt?.length || 0) / 4;
    tokens += (context.fileContent?.length || 0) / 4;
    
    // Add for conversation history
    if (context.history) {
      for (const msg of context.history) {
        tokens += msg.content.length / 4;
      }
    }
    
    // Add buffer for response
    tokens += 500; // Minimum response buffer
    
    return Math.ceil(tokens);
  }

  private calculateComplexity(context: TaskContext): number {
    let score = 0;
    
    const complexIndicators = [
      /architect|design|scale|optimize|refactor/i,
      /security|vulnerability|penetration/i,
      /performance|bottleneck|profil/i,
      /algorithm|data structure|complexity/i,
      /distributed|microservice|concurrent/i
    ];
    
    const simpleIndicators = [
      /fix|typo|rename|format/i,
      /add comment|document/i,
      /simple|basic|trivial/i,
      /copy|paste|move/i
    ];
    
    // Check prompt
    for (const pattern of complexIndicators) {
      if (pattern.test(context.prompt)) score += 0.2;
    }
    
    for (const pattern of simpleIndicators) {
      if (pattern.test(context.prompt)) score -= 0.2;
    }
    
    // Check file type
    if (context.fileName) {
      if (/\.(test|spec)\./i.test(context.fileName)) score -= 0.1;
      if (/\.(config|json|yaml|md)/i.test(context.fileName)) score -= 0.1;
      if (/architecture|design|schema/i.test(context.fileName)) score += 0.2;
    }
    
    // Check content length
    const contentLength = (context.fileContent?.length || 0) + context.prompt.length;
    if (contentLength > 10000) score += 0.2;
    if (contentLength < 500) score -= 0.1;
    
    return Math.max(0, Math.min(1, score + 0.5));
  }

  private detectDomain(context: TaskContext): string {
    const domains = {
      infrastructure: /docker|kubernetes|deploy|server|devops|ci\/cd/i,
      database: /sql|query|schema|migration|index|postgres|mongo/i,
      security: /auth|jwt|encrypt|vulnerabil|pentest|xss|csrf/i,
      frontend: /react|vue|css|tailwind|component|ui|ux/i,
      backend: /api|endpoint|route|controller|service|rest/i,
      architecture: /design|pattern|structure|architect|scale/i,
      testing: /test|spec|mock|coverage|unit|integration/i,
      documentation: /document|readme|guide|tutorial|explain/i
    };
    
    for (const [domain, pattern] of Object.entries(domains)) {
      if (pattern.test(context.prompt) || 
          (context.fileContent && pattern.test(context.fileContent))) {
        return domain;
      }
    }
    
    return 'general';
  }

  private detectUrgency(context: TaskContext): number {
    const urgentPatterns = [
      /urgent|asap|immediately|critical|emergency/i,
      /bug|broken|fix|error|crash/i,
      /production|live|customer/i
    ];
    
    let urgency = 0.5;
    for (const pattern of urgentPatterns) {
      if (pattern.test(context.prompt)) {
        urgency += 0.2;
      }
    }
    
    return Math.min(1, urgency);
  }

  private requiresDeepReasoning(context: TaskContext): boolean {
    const reasoningPatterns = [
      /why|how|explain|compare|analyze/i,
      /should we|what if|pros and cons/i,
      /best practice|recommend|suggest/i,
      /trade-?off|decision|choose/i
    ];
    
    return reasoningPatterns.some(pattern => pattern.test(context.prompt));
  }

  private extractCharacteristics(context: TaskContext): string[] {
    const characteristics: string[] = [];
    
    if (/create|build|implement|add/i.test(context.prompt)) {
      characteristics.push('creation');
    }
    if (/fix|repair|debug|solve/i.test(context.prompt)) {
      characteristics.push('debugging');
    }
    if (/review|audit|check|analyze/i.test(context.prompt)) {
      characteristics.push('analysis');
    }
    if (/format|style|clean|refactor/i.test(context.prompt)) {
      characteristics.push('refactoring');
    }
    
    return characteristics;
  }
}

// Export for use in Cursor/other environments
export default ModelRouter; 