// Claude Model Router Concept for OneShot
// This would run BEFORE sending requests to Claude

const CLAUDE_MODELS = {
  HAIKU: 'claude-3-haiku-20240307',    // Fast, cheap, good for simple tasks
  SONNET: 'claude-3-5-sonnet-20241022', // Balanced (current model)
  OPUS: 'claude-3-opus-20240229'        // Most capable, expensive
};

// Task complexity analyzer
function analyzeTaskComplexity(task) {
  const indicators = {
    simple: [
      /format/i,
      /fix typo/i,
      /add comment/i,
      /rename/i,
      /simple test/i,
      /basic CRUD/i
    ],
    complex: [
      /architect/i,
      /design system/i,
      /security review/i,
      /performance optimization/i,
      /scale to/i,
      /refactor entire/i
    ]
  };

  // Check file size (if applicable)
  const tokenEstimate = task.content ? task.content.length / 4 : 0;
  
  // Check for complexity indicators
  let complexityScore = 0;
  
  // Simple task indicators
  for (const pattern of indicators.simple) {
    if (pattern.test(task.description || task.content || '')) {
      complexityScore -= 1;
    }
  }
  
  // Complex task indicators
  for (const pattern of indicators.complex) {
    if (pattern.test(task.description || task.content || '')) {
      complexityScore += 2;
    }
  }
  
  // Token-based scoring
  if (tokenEstimate < 1000) complexityScore -= 1;
  if (tokenEstimate > 5000) complexityScore += 1;
  if (tokenEstimate > 10000) complexityScore += 2;
  
  return {
    score: complexityScore,
    tokenEstimate,
    recommendedModel: getRecommendedModel(complexityScore, tokenEstimate)
  };
}

function getRecommendedModel(score, tokens) {
  // High complexity or large context
  if (score >= 3 || tokens > 10000) {
    return CLAUDE_MODELS.OPUS;
  }
  
  // Simple tasks
  if (score <= -2 && tokens < 2000) {
    return CLAUDE_MODELS.HAIKU;
  }
  
  // Default to Sonnet for balanced tasks
  return CLAUDE_MODELS.SONNET;
}

// Usage tracking for optimization
class ClaudeUsageTracker {
  constructor() {
    this.history = [];
  }
  
  logRequest(task, model, response) {
    this.history.push({
      timestamp: Date.now(),
      task: task.description,
      model,
      inputTokens: estimateTokens(task.content),
      outputTokens: estimateTokens(response),
      responseTime: response.latency,
      quality: null // To be filled by user feedback
    });
  }
  
  getModelStats() {
    const stats = {};
    
    for (const model of Object.values(CLAUDE_MODELS)) {
      const modelRequests = this.history.filter(h => h.model === model);
      stats[model] = {
        totalRequests: modelRequests.length,
        avgResponseTime: avg(modelRequests.map(r => r.responseTime)),
        avgInputTokens: avg(modelRequests.map(r => r.inputTokens)),
        avgOutputTokens: avg(modelRequests.map(r => r.outputTokens)),
        estimatedCost: calculateCost(modelRequests, model)
      };
    }
    
    return stats;
  }
}

// Configuration-based routing
const ROUTING_RULES = {
  patterns: [
    { match: /\[OPERATOR\]/i, model: CLAUDE_MODELS.SONNET },
    { match: /\[DEVELOPER\]/i, model: CLAUDE_MODELS.SONNET },
    { match: /\[ARCHITECT\]/i, model: CLAUDE_MODELS.OPUS },
    { match: /\[PM\]/i, model: CLAUDE_MODELS.HAIKU },
    { match: /fix typo|format code/i, model: CLAUDE_MODELS.HAIKU },
    { match: /security audit|scale analysis/i, model: CLAUDE_MODELS.OPUS }
  ],
  
  fileTypes: [
    { extension: '.test.md', model: CLAUDE_MODELS.HAIKU },
    { extension: '.architecture.md', model: CLAUDE_MODELS.OPUS },
    { extension: '.todo.md', model: CLAUDE_MODELS.HAIKU }
  ]
};

// Main routing function
function routeToClaudeModel(request) {
  // Check explicit routing rules first
  for (const rule of ROUTING_RULES.patterns) {
    if (rule.match.test(request.content || request.prompt)) {
      return rule.model;
    }
  }
  
  // Check file type rules
  if (request.filename) {
    for (const rule of ROUTING_RULES.fileTypes) {
      if (request.filename.endsWith(rule.extension)) {
        return rule.model;
      }
    }
  }
  
  // Fall back to complexity analysis
  const analysis = analyzeTaskComplexity(request);
  return analysis.recommendedModel;
}

// Example usage
const exampleTasks = [
  { prompt: "[ARCHITECT] Design video storage system", expected: CLAUDE_MODELS.OPUS },
  { prompt: "Fix typo in README", expected: CLAUDE_MODELS.HAIKU },
  { prompt: "[DEVELOPER] Implement user authentication", expected: CLAUDE_MODELS.SONNET },
  { prompt: "Format this JSON file", content: "{small json}", expected: CLAUDE_MODELS.HAIKU },
  { prompt: "Refactor entire codebase for microservices", expected: CLAUDE_MODELS.OPUS }
];

// Cost optimization report
function generateCostReport(tracker) {
  const stats = tracker.getModelStats();
  const report = {
    totalCost: 0,
    modelBreakdown: {},
    recommendations: []
  };
  
  // Calculate costs and identify optimization opportunities
  for (const [model, data] of Object.entries(stats)) {
    const cost = data.estimatedCost;
    report.totalCost += cost;
    report.modelBreakdown[model] = {
      cost,
      usage: data.totalRequests,
      avgTokens: data.avgInputTokens + data.avgOutputTokens
    };
  }
  
  // Add recommendations
  if (stats[CLAUDE_MODELS.OPUS].totalRequests > 0) {
    const opusTasks = tracker.history.filter(h => h.model === CLAUDE_MODELS.OPUS);
    const potentialDowngrades = opusTasks.filter(t => t.inputTokens < 2000);
    if (potentialDowngrades.length > 0) {
      report.recommendations.push({
        action: "Consider using Sonnet for simple Opus tasks",
        potentialSavings: calculateSavings(potentialDowngrades)
      });
    }
  }
  
  return report;
}

module.exports = {
  routeToClaudeModel,
  analyzeTaskComplexity,
  ClaudeUsageTracker,
  CLAUDE_MODELS,
  ROUTING_RULES
}; 