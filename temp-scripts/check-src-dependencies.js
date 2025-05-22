/**
 * Check for dependencies on the root-level src directory
 * 
 * This script searches the codebase for imports or requires from the root-level
 * src directory to identify code that might break if we remove that directory.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Check if we're in the root directory
if (!fs.existsSync('./package.json')) {
  console.error(`${colors.red}Error: Must run this script from the project root directory${colors.reset}`);
  process.exit(1);
}

console.log(`\n${colors.cyan}=== Checking for dependencies on root-level src directory ===${colors.reset}\n`);

// Patterns to search for
const patterns = [
  // Import statements
  'from\\s+[\'"]src/',           // from 'src/...'
  'from\\s+[\'"]\\.\\.?/src/',   // from '../src/...' or './src/...'
  'import\\s+[\'"]src/',         // import 'src/...'
  'import\\s+[\'"]\\.\\.?/src/', // import '../src/...' or './src/...'
  
  // Require statements
  'require\\s*\\([\'"]src/',           // require('src/...')
  'require\\s*\\([\'"]\\.\\.?/src/',   // require('../src/...') or require('./src/...')
  
  // File paths in scripts or config
  '"src/\\S+"',                  // "src/something" in JSON
  '\'src/\\S+\'',                // 'src/something' in JS strings
];

// Directories and files to exclude
const excludes = [
  'node_modules',
  '.git',
  '_archive',
  'dist',
  'build',
  '.cursor',
  '.vscode',
  'package-lock.json',
  'temp-scripts/check-src-dependencies.js' // Exclude this script itself
];

// Search for each pattern
let foundDependencies = false;
let results = [];

patterns.forEach(pattern => {
  try {
    // Build grep command with exclusions
    let grepCmd = `grep -r "${pattern}" --include="*.{js,jsx,ts,tsx,json}" .`;
    
    // Add exclusions
    excludes.forEach(exclude => {
      grepCmd += ` --exclude-dir="${exclude}"`;
    });

    // Execute grep
    const output = execSync(grepCmd, { encoding: 'utf8' });
    
    if (output.trim()) {
      foundDependencies = true;
      
      // Process and store results
      const lines = output.trim().split('\n');
      lines.forEach(line => {
        // Don't include lines from this script or the migration documents
        if (!line.includes('check-src-dependencies.js') && 
            !line.includes('MIGRATION-PLAN.md') &&
            !line.includes('ARCHITECTURE.md')) {
          results.push(line);
        }
      });
    }
  } catch (error) {
    // grep returns non-zero exit code when no matches found, which throws an error
    // We can ignore this specific error
    if (error.status !== 1) {
      console.error(`${colors.red}Error executing search for pattern "${pattern}": ${error.message}${colors.reset}`);
    }
  }
});

// Deduplicate and sort results
results = [...new Set(results)].sort();

// Display results
if (foundDependencies) {
  console.log(`${colors.yellow}Found ${results.length} potential dependencies on root-level src directory:${colors.reset}\n`);
  
  results.forEach(result => {
    console.log(`  ${colors.red}${result}${colors.reset}`);
  });
  
  console.log(`\n${colors.yellow}These files need to be updated before removing the root-level src directory.${colors.reset}`);
  console.log(`${colors.yellow}Update the imports to use server/src instead.${colors.reset}`);
} else {
  console.log(`${colors.green}No dependencies on root-level src directory found.${colors.reset}`);
  console.log(`${colors.green}It should be safe to archive or remove the directory.${colors.reset}`);
}

console.log(`\n${colors.cyan}=== Check complete ===${colors.reset}\n`); 