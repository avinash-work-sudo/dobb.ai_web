import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
      // Error prevention
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-duplicate-imports': 'error',

      // Code quality
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',

      // Async/await
      'no-async-promise-executor': 'error',
      'require-await': 'error',

      // Import/export (duplicate imports already handled above)

      // Node.js specific
      'no-process-exit': 'error',
      'no-path-concat': 'error',

      // Possible errors that could break functionality
      'no-await-in-loop': 'warn',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',

      // Best practices
      eqeqeq: 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // Style consistency (helps catch issues)
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'never'],
      indent: ['error', 2],
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],

      // Potential breaking changes
      'no-delete-var': 'error',
      'no-global-assign': 'error',
      'no-implicit-globals': 'error',
      'no-redeclare': 'error',
      'no-shadow': 'error',
      'no-shadow-restricted-names': 'error'
    }
  },
  {
    files: ['src/services/**/*.js'],
    rules: {
      // More strict rules for service files
      'no-console': ['error', { allow: ['warn', 'error'] }]
    }
  },
  {
    files: ['src/routes/**/*.js'],
    rules: {
      // API routes should handle errors properly
      'consistent-return': 'error'
    }
  },
  {
    ignores: ['node_modules/**', 'artifacts/**', 'midscene_run/**', 'database/**']
  }
];
