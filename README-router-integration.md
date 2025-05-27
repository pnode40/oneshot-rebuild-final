# OneShot AI Router Integration Layer

This integration layer connects the AI model router to our development workflow, enabling intelligent role-based model selection and cost optimization.

## Overview

The Router Integration Layer provides:

1. **Automatic role detection** based on prompt content
2. **Context enhancement** for each AI role
3. **Model selection** based on task complexity
4. **Cursor IDE integration** via hooks
5. **Analytics dashboard** for monitoring usage and costs

## Components

### 1. Router Integration (`router-integration.ts`)

Core middleware that processes AI requests:

- Detects AI roles from prompt content
- Adds role-specific context
- Routes to appropriate model via the model router
- Logs decisions and performance metrics

### 2. Cursor Hook (`cursor-hook.js`)

Integrates with Cursor IDE:

- Intercepts AI requests
- Enriches prompts with context
- Overrides model selection
- Tracks usage and costs

### 3. Analytics Dashboard (`router-dashboard.html`)

Visualizes router performance:

- Model usage distribution
- Role distribution
- Cost savings
- Request trends
- Detailed logs

## Usage

### Basic Usage

```javascript
const { routeAIRequest } = require('./router-integration');

// Process an AI request
const result = await routeAIRequest(
  '[DEVELOPER] Implement login form validation',
  'login-form.tsx',
  '// Current file content...'
);

console.log(`Selected model: ${result.model}`);
console.log(`Role detected: ${result.role}`);
console.log(`Estimated cost: $${result.estimatedCost}`);
```

### Role Prefixes

Add role prefixes to your prompts for explicit role assignment:

- `[DEVELOPER]` - Code implementation
- `[OPERATOR]` - Infrastructure and DevOps
- `[ARCHITECT]` - System design
- `[PM]` - Task planning and coordination

### Cursor Integration

1. Add cursor-hook.js to your Cursor plugins directory
2. Enable the plugin in Cursor settings
3. Start using role prefixes in your prompts

## Analytics

To view router analytics:

1. Start the dashboard: `npx serve .` 
2. Open `http://localhost:3000/router-dashboard.html`
3. View real-time statistics and logs

## Expected Benefits

- **Cost Reduction**: 70-80% savings by routing simple tasks to cheaper models
- **Performance**: Faster responses for simple tasks
- **Quality**: Better context for each AI role
- **Accountability**: Clear tracking of AI usage and costs

## Configuration

The integration layer uses the model router's configuration file (`routing-config.mdc`) for its rules.

## Future Enhancements

1. **Learning System**: Automatic adjustment based on quality feedback
2. **API Integration**: Connect to LLM providers via their APIs
3. **Collaborative Filtering**: Use team-wide patterns to improve routing
4. **Session Context**: Maintain context between requests 