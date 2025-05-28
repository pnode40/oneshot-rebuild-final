/**
 * Cursor Integration Hook for AI Model Router
 * 
 * This file provides integration between Cursor IDE and the model router system.
 * It intercepts AI requests from Cursor and routes them to the appropriate model.
 */

const { routeAIRequest } = require('./router-integration');

/**
 * Cursor Hook - Entry point for Cursor IDE
 * 
 * This function intercepts requests from Cursor and enriches them with:
 * 1. Role detection
 * 2. Context enhancement
 * 3. Model selection via the router
 */
async function cursorHook(params) {
  try {
    // Extract parameters from Cursor
    const { 
      prompt, 
      currentFile,
      currentFileContent,
      selection,
      cursorPosition
    } = params;
    
    console.log(`[Router] Processing request: ${prompt.substring(0, 50)}...`);
    
    // Get file name from current file path
    const fileName = currentFile ? currentFile.split('/').pop() : undefined;
    
    // Route the request through our integration layer
    const routed = await routeAIRequest(prompt, fileName, currentFileContent);
    
    console.log(`[Router] Selected model: ${routed.model}, Role: ${routed.role}`);
    console.log(`[Router] Reasoning: ${routed.reasoning}`);
    console.log(`[Router] Estimated cost: $${routed.estimatedCost.toFixed(6)}`);
    
    // Return the enhanced prompt for the selected model
    return {
      enhancedPrompt: routed.enrichedPrompt,
      modelOverride: mapModelTierToCursor(routed.model),
      metadata: {
        routerDecision: {
          role: routed.role,
          model: routed.model,
          reasoning: routed.reasoning,
          estimatedCost: routed.estimatedCost
        }
      }
    };
  } catch (error) {
    console.error('[Router] Error in Cursor hook:', error);
    
    // On error, pass through the original prompt to avoid blocking the user
    return {
      enhancedPrompt: params.prompt,
      metadata: {
        routerError: error.message
      }
    };
  }
}

/**
 * Maps our model tiers to actual Cursor model identifiers
 */
function mapModelTierToCursor(modelTier) {
  // This mapping would need to be updated based on Cursor's available models
  const modelMapping = {
    'nano': 'gpt-3.5-turbo',
    'micro': 'claude-instant',
    'standard': 'claude-3-sonnet',
    'power': 'claude-3-opus',
    'ultra': 'claude-3-opus' // Fallback to highest available model
  };
  
  return modelMapping[modelTier] || 'claude-3-sonnet'; // Default to standard
}

/**
 * Expose the hook for Cursor
 */
module.exports = {
  processRequest: cursorHook
};

// Log that the hook is loaded
console.log('[Router] Cursor hook loaded and ready for AI request routing'); 