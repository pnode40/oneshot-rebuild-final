/**
 * Router Integration Layer
 * 
 * Connects AI team workflows to the model router system.
 * Provides middleware, role detection, and Cursor integration.
 */

import { ModelRouter, ModelTier, TaskContext } from './model-router';
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

// Define the different AI roles in our team
export enum AIRole {
  DEVELOPER = 'DEVELOPER',
  OPERATOR = 'OPERATOR',
  ARCHITECT = 'ARCHITECT',
  PM = 'PM',
  DEFAULT = 'DEFAULT'
}

// Interface for a processed AI request
export interface ProcessedRequest {
  originalPrompt: string;
  enrichedPrompt: string;
  detectedRole: AIRole;
  routingDecision: any;
  contextAdded: boolean;
  timestamp: Date;
}

export class RouterIntegration {
  private router: ModelRouter;
  private sessionLogs: ProcessedRequest[] = [];
  private logDir: string = './logs';
  private rolePatterns: Map<RegExp, AIRole> = new Map();
  
  constructor() {
    // Initialize the model router
    this.router = new ModelRouter();
    
    // Set up role detection patterns
    this.setupRolePatterns();
    
    // Ensure log directory exists
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }
  
  /**
   * Set up regex patterns for role detection
   */
  private setupRolePatterns(): void {
    this.rolePatterns.set(/\[DEVELOPER\]/i, AIRole.DEVELOPER);
    this.rolePatterns.set(/\[OPERATOR\]/i, AIRole.OPERATOR);
    this.rolePatterns.set(/\[ARCHITECT\]/i, AIRole.ARCHITECT);
    this.rolePatterns.set(/\[PM\]/i, AIRole.PM);
  }
  
  /**
   * Detect AI role from the prompt
   */
  public detectRole(prompt: string): AIRole {
    for (const [pattern, role] of this.rolePatterns.entries()) {
      if (pattern.test(prompt)) {
        return role;
      }
    }
    
    // Infer role from content if not explicitly marked
    if (/infra|deploy|environment|script|pipeline|docker/i.test(prompt)) {
      return AIRole.OPERATOR;
    } else if (/design|architect|scale|system|structure/i.test(prompt)) {
      return AIRole.ARCHITECT;
    } else if (/task|plan|schedule|timeline|priorit|roadmap/i.test(prompt)) {
      return AIRole.PM;
    }
    
    // Default to developer for most tasks
    return AIRole.DEVELOPER;
  }
  
  /**
   * Add role-specific context to the prompt
   */
  private addRoleContext(prompt: string, role: AIRole): string {
    let contextAddition = '';
    
    switch (role) {
      case AIRole.OPERATOR:
        contextAddition = `
# OPERATOR CONTEXT
- Working in Windows PowerShell environment
- Cross-platform compatibility required
- Infrastructure as code principles
- Focus on reliability and reproducibility
`;
        break;
      case AIRole.DEVELOPER:
        contextAddition = `
# DEVELOPER CONTEXT
- TypeScript/React frontend, Express backend
- Drizzle ORM for database
- Jest for testing
- Following OneShot coding standards
`;
        break;
      case AIRole.ARCHITECT:
        contextAddition = `
# ARCHITECT CONTEXT
- Scalable microservices architecture
- Security and performance focused
- Consider cloud deployment (Vercel/Railway)
- Long-term maintainability
`;
        break;
      case AIRole.PM:
        contextAddition = `
# PM CONTEXT
- Breaking tasks into implementable units
- Planning for next sprint
- Coordinating dependencies
- Tracking progress metrics
`;
        break;
    }
    
    return `${contextAddition}\n\n${prompt}`;
  }
  
  /**
   * Process an AI request - core integration function
   */
  public async processRequest(prompt: string, fileName?: string, fileContent?: string): Promise<ProcessedRequest> {
    // Detect the role
    const detectedRole = this.detectRole(prompt);
    
    // Add role-specific context
    const enrichedPrompt = this.addRoleContext(prompt, detectedRole);
    
    // Create task context for the router
    const taskContext: TaskContext = {
      prompt: enrichedPrompt,
      fileName,
      fileContent,
      mode: `[${detectedRole}]`
    };
    
    // Get routing decision
    const routingDecision = await this.router.route(taskContext);
    
    // Create processed request record
    const processed: ProcessedRequest = {
      originalPrompt: prompt,
      enrichedPrompt,
      detectedRole,
      routingDecision,
      contextAdded: enrichedPrompt !== prompt,
      timestamp: new Date()
    };
    
    // Log the processed request
    this.sessionLogs.push(processed);
    this.logToFile(processed);
    
    return processed;
  }
  
  /**
   * Log processed request to file
   */
  private logToFile(processed: ProcessedRequest): void {
    const logFile = join(this.logDir, `router-${new Date().toISOString().split('T')[0]}.log`);
    const logEntry = JSON.stringify({
      timestamp: processed.timestamp,
      role: processed.detectedRole,
      model: processed.routingDecision.model,
      confidence: processed.routingDecision.confidence,
      estimatedCost: processed.routingDecision.estimatedCost,
      prompt: processed.originalPrompt.substring(0, 100) + (processed.originalPrompt.length > 100 ? '...' : '')
    }, null, 2);
    
    appendFileSync(logFile, logEntry + '\n');
  }
  
  /**
   * Get session analytics
   */
  public getSessionAnalytics(): any {
    if (this.sessionLogs.length === 0) {
      return { message: 'No requests processed yet' };
    }
    
    // Calculate model usage distribution
    const modelDistribution: Record<string, number> = {};
    let totalEstimatedCost = 0;
    
    this.sessionLogs.forEach(log => {
      const model = log.routingDecision.model;
      modelDistribution[model] = (modelDistribution[model] || 0) + 1;
      totalEstimatedCost += log.routingDecision.estimatedCost || 0;
    });
    
    // Calculate role distribution
    const roleDistribution: Record<string, number> = {};
    this.sessionLogs.forEach(log => {
      const role = log.detectedRole;
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });
    
    return {
      totalRequests: this.sessionLogs.length,
      modelDistribution,
      roleDistribution,
      totalEstimatedCost,
      averageCostPerRequest: totalEstimatedCost / this.sessionLogs.length
    };
  }
  
  /**
   * Clear session logs
   */
  public clearSessionLogs(): void {
    this.sessionLogs = [];
  }
}

// Export a singleton instance for easy use
export const routerIntegration = new RouterIntegration();

// Helper function for Cursor or other tools to use
export async function routeAIRequest(prompt: string, fileName?: string, fileContent?: string): Promise<any> {
  const processed = await routerIntegration.processRequest(prompt, fileName, fileContent);
  
  return {
    role: processed.detectedRole,
    model: processed.routingDecision.model,
    reasoning: processed.routingDecision.reasoning,
    estimatedCost: processed.routingDecision.estimatedCost,
    enrichedPrompt: processed.enrichedPrompt
  };
} 