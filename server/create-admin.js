/**
 * Helper script to run the TypeScript create-admin-user script
 */
const { exec } = require('child_process');
require('dotenv').config();

// Run the TS script using ts-node
const command = 'npx ts-node src/scripts/create-admin-user.ts';

console.log(`Running command: ${command}`);

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
}); 