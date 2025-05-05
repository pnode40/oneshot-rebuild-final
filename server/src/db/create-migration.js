#!/usr/bin/env node

/**
 * Migration Generator
 * 
 * This script creates a new migration file and updates the journal.
 * 
 * Usage:
 *   node create-migration.js <migration_name> ["<description>"]
 * 
 * Example:
 *   node create-migration.js add_user_table "Create users table with authentication fields"
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Get migration name from command line args
const migrationName = process.argv[2];
const description = process.argv[3] || migrationName;

if (!migrationName) {
  console.error('Error: Migration name is required');
  console.error('Usage: node create-migration.js <migration_name> ["<description>"]');
  process.exit(1);
}

// Generate random animal name as suffix if not provided
const randomAnimal = () => {
  const animals = [
    'aardvark', 'albatross', 'alligator', 'alpaca', 'ant', 'anteater', 'antelope', 'ape',
    'badger', 'barracuda', 'bat', 'bear', 'beaver', 'bee', 'bison', 'boar', 'buffalo',
    'camel', 'canary', 'capybara', 'cardinal', 'caribou', 'cassowary', 'cat', 'catfish',
    'deer', 'dolphin', 'donkey', 'dragon', 'duck', 'eagle', 'eel', 'elephant', 'emu', 'falcon',
    'giraffe', 'goat', 'gorilla', 'grasshopper', 'hawk', 'hedgehog', 'hippopotamus', 'horse',
    'jaguar', 'jellyfish', 'kangaroo', 'koala', 'lemur', 'leopard', 'lion', 'llama', 'lobster',
    'meerkat', 'mongoose', 'monkey', 'moose', 'mouse', 'octopus', 'ostrich', 'otter', 'owl',
    'panda', 'panther', 'parrot', 'penguin', 'puma', 'rabbit', 'raccoon', 'rattlesnake',
    'tiger', 'turtle', 'walrus', 'weasel', 'whale', 'wolf', 'wolverine', 'zebra'
  ];
  return animals[Math.floor(Math.random() * animals.length)];
};

// Paths
const migrationsDir = path.resolve(process.cwd(), './migrations');
const metaDir = path.join(migrationsDir, 'meta');
const journalPath = path.join(metaDir, '_journal.json');

// Ensure directories exist
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}
if (!fs.existsSync(metaDir)) {
  fs.mkdirSync(metaDir, { recursive: true });
}

// Read existing journal or create new one
let journal;
if (fs.existsSync(journalPath)) {
  journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
} else {
  journal = {
    version: '5',
    dialect: 'pg',
    entries: []
  };
}

// Get latest index
const lastIdx = journal.entries.length > 0 
  ? Math.max(...journal.entries.map(e => e.idx))
  : -1;
const nextIdx = lastIdx + 1;

// Generate hash (filename without extension)
const paddedIdx = String(nextIdx).padStart(4, '0');
const randomSuffix = randomAnimal();
const hash = `${paddedIdx}_${migrationName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${randomSuffix}`;

// Add entry to journal
const now = new Date().toISOString();
journal.entries.push({
  idx: nextIdx,
  comment: description,
  when: now,
  hash: hash,
  checksum: crypto.createHash('sha256').update('').digest('hex')
});

// Write journal
fs.writeFileSync(journalPath, JSON.stringify(journal, null, 2));

// Create migration file
const migrationContent = `-- Migration: ${description}
-- Created at: ${now}

-- Write your SQL migration here
`;

const migrationPath = path.join(migrationsDir, `${hash}.sql`);
fs.writeFileSync(migrationPath, migrationContent);

console.log(`Migration created successfully!`);
console.log(`- File: ${migrationPath}`);
console.log(`- Hash: ${hash}`);
console.log(`- Description: ${description}`);
console.log(`\nJournal updated at: ${journalPath}`);
console.log(`\nTo apply this migration, run: npm run migrate:direct`); 