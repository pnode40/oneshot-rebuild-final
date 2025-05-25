#!/usr/bin/env node

/**
 * OneShot Context Engine - Phase 1.0 Foundation
 * 
 * This script simulates the Context Engine functionality that will eventually
 * become the full coordination system for autonomous AI development.
 * 
 * Phase 1 Capabilities:
 * - Session state tracking
 * - Decision logging and conflict detection
 * - Escalation trigger management
 * - Documentation synchronization
 * - Autonomy metrics tracking
 */

const fs = require('fs');
const path = require('path');

class ContextEngine {
  constructor() {
    this.contextFile = 'docs/context-state.json';
    this.metricsFile = 'docs/autonomy-metrics.json';
    this.decisionLogFile = 'docs/decision-log.md';
    this.escalationThresholds = {
      security_changes: 'IMMEDIATE',
      architecture_changes: 'HIGH', 
      performance_impact: 20, // percentage
      test_coverage_drop: 70, // percentage
      agent_conflicts: 2 // max rounds before escalation
    };
  }

  /**
   * Initialize context state for new session
   */
  initializeSession(sessionId, trigger = 'manual') {
    const contextState = {
      last_updated: new Date().toISOString(),
      system_phase: '1.0-foundation',
      active_agents: {
        claude: 'development-ready',
        gpt4o: 'planning-available',
        gemini: 'consultation-available',
        eric: 'oversight-active'
      },
      current_session: {
        session_id: sessionId,
        trigger: trigger,
        start_time: new Date().toISOString(),
        quality_gates_status: 'initialized',
        escalations: []
      },
      coordination_state: {
        parallel_execution: false,
        conflict_detection: 'basic',
        escalation_triggers: Object.keys(this.escalationThresholds),
        documentation_automation: 'enabled'
      },
      memory: {
        recent_decisions: [],
        pattern_recognition: {},
        successful_approaches: [],
        failed_approaches: []
      }
    };

    this.saveContextState(contextState);
    console.log(`🧠 Context Engine initialized for session: ${sessionId}`);
    return contextState;
  }

  /**
   * Load current context state
   */
  loadContextState() {
    try {
      if (fs.existsSync(this.contextFile)) {
        const data = fs.readFileSync(this.contextFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load context state, initializing new:', error.message);
    }
    return this.initializeSession(`ctx-${Date.now()}`, 'system-recovery');
  }

  /**
   * Save context state to file
   */
  saveContextState(state) {
    try {
      fs.writeFileSync(this.contextFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Failed to save context state:', error.message);
    }
  }

  /**
   * Track decision and check for conflicts
   */
  trackDecision(decision) {
    const context = this.loadContextState();
    const timestamp = new Date().toISOString();

    const decisionRecord = {
      id: `decision-${Date.now()}`,
      timestamp,
      type: decision.type,
      agent: decision.agent || 'claude',
      description: decision.description,
      impact_level: decision.impact_level || 'LOW',
      files_affected: decision.files_affected || [],
      confidence: decision.confidence || 'medium',
      requires_approval: this.requiresApproval(decision)
    };

    // Add to memory
    context.memory.recent_decisions.unshift(decisionRecord);
    
    // Keep only last 50 decisions in memory
    if (context.memory.recent_decisions.length > 50) {
      context.memory.recent_decisions = context.memory.recent_decisions.slice(0, 50);
    }

    // Check for conflicts
    const conflicts = this.detectConflicts(decisionRecord, context.memory.recent_decisions);
    if (conflicts.length > 0) {
      console.warn('🚨 Conflicts detected:', conflicts);
      this.triggerEscalation('conflict-detection', conflicts);
    }

    // Update context state
    context.last_updated = timestamp;
    this.saveContextState(context);

    // Log decision to markdown file
    this.logDecisionToFile(decisionRecord);

    return decisionRecord;
  }

  /**
   * Determine if decision requires Eric approval
   */
  requiresApproval(decision) {
    const highImpactTypes = ['security', 'architecture', 'database-schema'];
    const highConfidenceRequired = ['database-migration', 'authentication-change'];
    
    return (
      highImpactTypes.includes(decision.type) ||
      highConfidenceRequired.includes(decision.type) ||
      decision.impact_level === 'HIGH' ||
      decision.confidence === 'low'
    );
  }

  /**
   * Detect conflicts between decisions
   */
  detectConflicts(newDecision, recentDecisions) {
    const conflicts = [];
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const decision of recentDecisions.slice(0, 10)) { // Check last 10 decisions
      if (new Date(decision.timestamp) < last24Hours) continue;

      // Check file conflicts
      const fileOverlap = newDecision.files_affected.some(file =>
        decision.files_affected.includes(file)
      );

      if (fileOverlap && decision.type !== newDecision.type) {
        conflicts.push({
          type: 'file-overlap',
          conflicting_decision: decision.id,
          description: `File modification conflict with ${decision.type} decision`,
          files: newDecision.files_affected.filter(f => decision.files_affected.includes(f))
        });
      }

      // Check contradictory decisions
      const contradictoryTypes = {
        'add-dependency': 'remove-dependency',
        'increase-security': 'decrease-security',
        'optimize-performance': 'add-logging'
      };

      if (contradictoryTypes[newDecision.type] === decision.type) {
        conflicts.push({
          type: 'contradictory-approach',
          conflicting_decision: decision.id,
          description: `Contradictory approach to ${decision.type}`
        });
      }
    }

    return conflicts;
  }

  /**
   * Trigger escalation based on issue type
   */
  triggerEscalation(trigger, details) {
    const context = this.loadContextState();
    const escalation = {
      id: `escalation-${Date.now()}`,
      timestamp: new Date().toISOString(),
      trigger,
      details,
      priority: this.escalationThresholds[trigger] || 'MEDIUM',
      status: 'open',
      assigned_to: 'eric'
    };

    context.current_session.escalations.push(escalation);
    this.saveContextState(context);

    console.error(`🚨 ESCALATION TRIGGERED: ${trigger}`);
    console.error(`Priority: ${escalation.priority}`);
    console.error(`Details:`, details);

    // In production, this would send notification to Eric
    // For now, just log to console
    return escalation;
  }

  /**
   * Log decision to markdown decision log
   */
  logDecisionToFile(decision) {
    try {
      const logEntry = `
## Decision ${decision.id} - ${new Date(decision.timestamp).toLocaleDateString()}
**Type**: ${decision.type}  
**Agent**: ${decision.agent}  
**Impact**: ${decision.impact_level}  
**Context**: ${decision.description}  
**Files**: ${decision.files_affected.join(', ') || 'None'}  
**Approval Required**: ${decision.requires_approval ? 'Yes' : 'No'}  
**Confidence**: ${decision.confidence}  

`;

      fs.appendFileSync(this.decisionLogFile, logEntry);
    } catch (error) {
      console.warn('Failed to log decision to file:', error.message);
    }
  }

  /**
   * Update autonomy metrics
   */
  updateAutonomyMetrics(outcome) {
    let metrics;
    try {
      if (fs.existsSync(this.metricsFile)) {
        metrics = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
      } else {
        metrics = this.initializeMetrics();
      }
    } catch (error) {
      metrics = this.initializeMetrics();
    }

    // Update metrics based on outcome
    if (outcome.success) {
      metrics.metrics.implementation_success_rate = 
        (metrics.metrics.implementation_success_rate * 0.9) + (100 * 0.1);
    } else {
      metrics.metrics.implementation_success_rate = 
        (metrics.metrics.implementation_success_rate * 0.9) + (0 * 0.1);
    }

    if (outcome.escalated) {
      metrics.metrics.escalation_rate = 
        (metrics.metrics.escalation_rate * 0.9) + (100 * 0.1);
    } else {
      metrics.metrics.escalation_rate = 
        (metrics.metrics.escalation_rate * 0.9) + (0 * 0.1);
    }

    if (outcome.security_incident) {
      metrics.metrics.security_incidents += 1;
    }

    // Check for autonomy level advancement
    this.checkAutonomyAdvancement(metrics);

    // Save updated metrics
    metrics.last_updated = new Date().toISOString();
    fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));

    return metrics;
  }

  /**
   * Initialize autonomy metrics
   */
  initializeMetrics() {
    return {
      version: '1.0',
      current_level: 1,
      level_start_date: new Date().toISOString(),
      metrics: {
        implementation_success_rate: 0,
        escalation_rate: 0,
        security_incidents: 0,
        test_coverage_maintained: true,
        documentation_accuracy: 100
      },
      level_requirements: {
        1: { success_rate: 90, escalation_rate: 10, security_incidents: 0 },
        2: { success_rate: 95, escalation_rate: 5, security_incidents: 0 },
        3: { success_rate: 97, escalation_rate: 3, security_incidents: 0 },
        4: { success_rate: 99, escalation_rate: 1, security_incidents: 0 }
      },
      history: []
    };
  }

  /**
   * Check if autonomy level can be advanced
   */
  checkAutonomyAdvancement(metrics) {
    const currentLevel = metrics.current_level;
    const nextLevel = currentLevel + 1;
    
    if (!metrics.level_requirements[nextLevel]) {
      return; // Max level reached
    }

    const requirements = metrics.level_requirements[nextLevel];
    const current = metrics.metrics;

    const canAdvance = (
      current.implementation_success_rate >= requirements.success_rate &&
      current.escalation_rate <= requirements.escalation_rate &&
      current.security_incidents <= requirements.security_incidents &&
      current.test_coverage_maintained
    );

    if (canAdvance) {
      console.log(`🎉 Autonomy level advancement: ${currentLevel} → ${nextLevel}`);
      
      // Archive current level performance
      metrics.history.push({
        level: currentLevel,
        start_date: metrics.level_start_date,
        end_date: new Date().toISOString(),
        final_metrics: { ...current }
      });

      // Advance to next level
      metrics.current_level = nextLevel;
      metrics.level_start_date = new Date().toISOString();
      
      this.triggerEscalation('autonomy-advancement', {
        from_level: currentLevel,
        to_level: nextLevel,
        performance_metrics: current
      });
    }
  }

  /**
   * Get current system status
   */
  getSystemStatus() {
    const context = this.loadContextState();
    let metrics;
    
    try {
      metrics = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
    } catch (error) {
      metrics = this.initializeMetrics();
    }

    return {
      phase: context.system_phase,
      autonomy_level: metrics.current_level,
      active_agents: context.active_agents,
      recent_escalations: context.current_session.escalations.slice(-5),
      performance_metrics: metrics.metrics,
      session_info: context.current_session
    };
  }
}

// CLI Interface
if (require.main === module) {
  const engine = new ContextEngine();
  const command = process.argv[2];

  switch (command) {
    case 'init':
      const sessionId = process.argv[3] || `session-${Date.now()}`;
      engine.initializeSession(sessionId);
      break;

    case 'status':
      console.log(JSON.stringify(engine.getSystemStatus(), null, 2));
      break;

    case 'track-decision':
      const decision = {
        type: process.argv[3] || 'implementation',
        description: process.argv[4] || 'Decision tracked via CLI',
        agent: 'claude',
        impact_level: 'LOW'
      };
      engine.trackDecision(decision);
      break;

    case 'update-metrics':
      const outcome = {
        success: process.argv[3] !== 'false',
        escalated: process.argv[4] === 'true',
        security_incident: process.argv[5] === 'true'
      };
      engine.updateAutonomyMetrics(outcome);
      break;

    default:
      console.log(`
OneShot Context Engine v1.0

Usage:
  node scripts/context-engine.js <command> [args]

Commands:
  init [sessionId]              Initialize new session
  status                        Show current system status
  track-decision <type> <desc>  Track a decision
  update-metrics <success> <escalated> <security>  Update metrics

Examples:
  node scripts/context-engine.js init feature-001
  node scripts/context-engine.js status
  node scripts/context-engine.js track-decision implementation "Added new route"
  node scripts/context-engine.js update-metrics true false false
      `);
  }
}

module.exports = ContextEngine; 