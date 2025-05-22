import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      'check-db.js', // Ignore problematic JS file
      'db-check.js',   // Ignore problematic JS file
      'manual-test.js', // Ignore problematic JS file
      // Add other global ignores if needed, e.g., 'dist/', 'coverage/'
    ]
  },
  {
    // Config for root-level .ts config files (e.g., drizzle.config.ts, this file itself if named *.config.ts)
    files: ['*.config.ts', 'drizzle.config.ts', 'eslint.config.js'], // Adjusted to be more specific and include eslint.config.js
    plugins: { '@typescript-eslint': typescriptEslintPlugin },
    languageOptions: {
      parser: typescriptEslintParser,
      // No parserOptions.project for these config files
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    // Configuration for TypeScript source files in src/
    files: ['src/**/*.ts'],
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
    },
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: './',
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  // Basic config for JS files at the root to potentially address parsing errors
  // This assumes they are standard JS. If they have flow or other syntax, they might need specific parser.
  {
    files: ['*.js'], // For .js files directly in server/ (now excluding the problematic ones via global ignores)
    // ESLint will use its default parser for JS. 
    // If these files have specific syntax (Flow, etc.) or are causing "Unexpected character" errors,
    // they might need a specific parser or to be ignored.
    rules: {
        // Add basic JS rules if desired, e.g.:
        // 'no-unused-vars': 'warn',
    }
  }
]; 