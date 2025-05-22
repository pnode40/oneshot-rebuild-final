/**
 * Archive the root-level src directory
 * 
 * This script safely archives the root-level src directory to _archive/src_legacy
 * as part of the consolidation process.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

console.log(`\n${colors.cyan}=== Archiving root-level src directory ===${colors.reset}\n`);

// Check if src directory exists
if (!fs.existsSync('./src')) {
  console.error(`${colors.red}Error: src directory does not exist${colors.reset}`);
  process.exit(1);
}

// Create _archive directory if it doesn't exist
if (!fs.existsSync('./_archive')) {
  console.log(`${colors.blue}Creating _archive directory...${colors.reset}`);
  fs.mkdirSync('./_archive');
}

// Check if target directory already exists
if (fs.existsSync('./_archive/src_legacy')) {
  console.error(`${colors.red}Error: Target directory _archive/src_legacy already exists${colors.reset}`);
  console.error(`${colors.red}Please remove or rename it first.${colors.reset}`);
  process.exit(1);
}

// Get current date for backup name
const now = new Date();
const dateStr = now.toISOString().replace(/:/g, '-').replace(/\..+/, '');

// Archive the src directory
console.log(`${colors.yellow}Archiving src directory to _archive/src_legacy...${colors.reset}`);

try {
  // Create a README file in the archive explaining what this is
  const readmeContent = `# Legacy src Directory

This directory contains the legacy root-level \`src\` directory that was archived on ${now.toLocaleString()}.

It was archived as part of the codebase consolidation process to simplify the project structure by moving all backend code to \`server/src\`.

## Original Location

This directory was originally located at the root level of the project as \`./src\`.

## Content Description

The directory contained:
- A simplified database migration system
- Basic type definitions
- Some utility functions

## Reason for Archiving

The code in this directory was deemed redundant or transitional, as the main server implementation in \`server/src\` contains more complete and up-to-date versions of this functionality.

## Reference

For more information, see the MIGRATION-PLAN.md and ARCHITECTURE.md documents in the project root.
`;

  fs.writeFileSync('_archive/src_legacy_README.md', readmeContent);

  // Move the directory
  execSync('mv src _archive/src_legacy');

  console.log(`${colors.green}Successfully archived src directory to _archive/src_legacy${colors.reset}`);
  console.log(`${colors.green}Created _archive/src_legacy_README.md with documentation${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error archiving src directory: ${error.message}${colors.reset}`);
  process.exit(1);
}

console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
console.log(`1. ${colors.blue}Verify the application still works${colors.reset}`);
console.log(`   - Run: ${colors.magenta}npm run dev${colors.reset}`);
console.log(`   - Run: ${colors.magenta}npm run migrate:direct${colors.reset}`);
console.log(`2. ${colors.blue}If everything works, you can remove the archive later${colors.reset}`);
console.log(`3. ${colors.blue}If issues occur, restore with:${colors.reset} ${colors.magenta}mv _archive/src_legacy src${colors.reset}`);

console.log(`\n${colors.cyan}=== Archive process complete ===${colors.reset}\n`); 