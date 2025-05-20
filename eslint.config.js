// eslint.config.js
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginAstro from 'eslint-plugin-astro'
// eslint-plugin-jsx-a11y is a peer dependency of eslint-plugin-astro and used by its a11y configs
// We don't need to import it directly here if using eslint-plugin-astro's config for it.
import eslintConfigPrettier from 'eslint-config-prettier'
import jsoncEslintParser from 'jsonc-eslint-parser'
import eslintPluginJsonc from 'eslint-plugin-jsonc'

const tsJsFiles = ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.cjs']

export default tseslint.config(
  eslint.configs.recommended, // Applied broadly
  // Apply type-checked rules specifically to TS/JS files
  // We map over the recommendedTypeChecked array and add the 'files' glob to each config object
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: tsJsFiles,
  })),
  ...eslintPluginAstro.configs['flat/recommended'],
  // Use eslint-plugin-astro's recommended accessibility rules
  // This should correctly configure jsx-a11y for Astro components.
  // Ensure eslint-plugin-jsx-a11y is installed as it's a peer dependency.
  ...(eslintPluginAstro.configs['flat/jsx-a11y-recommended'] || []),

  {
    // Global ignores for ESLint
    ignores: ['dist/', '.astro/', 'node_modules/', 'public/'], // Added public/
  },
  {
    // Configuration specifically for Astro files
    files: ['**/*.astro'],
    languageOptions: {
      globals: {
        Astro: 'readonly',
        Fragment: 'readonly',
      },
      // parserOptions for Astro files handled by eslint-plugin-astro
    },
    // Rules specific to Astro files can be added here
  },
  {
    // Configuration for TypeScript files (and JS files if you wish to apply TS parsing)
    files: tsJsFiles, // Use the defined const
    languageOptions: {
      parser: tseslint.parser, // Explicitly set the parser for these files
      parserOptions: {
        project: './tsconfig.json', // Path to your tsconfig.json
        tsconfigRootDir: import.meta.dirname, // Correctly resolves path relative to eslint.config.js
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Add TypeScript-specific rule overrides here if needed
      // e.g. '@typescript-eslint/no-unused-vars': 'warn'
    },
  },
  {
    // Configuration for JSON, JSONC, and JSON5 files
    files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
    languageOptions: {
      parser: jsoncEslintParser,
    },
    plugins: {
      // Define the plugin for use in rules (optional if using 'extends' style within the object)
      jsonc: eslintPluginJsonc,
    },
    // Use the recommended rules from eslint-plugin-jsonc
    // 'recommended-with-jsonc' covers basic JSON and JSONC best practices
    // For stricter rules or JSON5, you can explore other configs like 'recommended-with-json', 'recommended-with-json5'
    rules: {
      ...eslintPluginJsonc.configs['recommended-with-jsonc'].rules,
      // You can add or override specific JSONC rules here, for example:
      // 'jsonc/array-bracket-spacing': ['error', 'never'],
      // 'jsonc/object-curly-spacing': ['error', 'always'],
      // 'jsonc/key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
      // 'jsonc/no-octal-escape': 'error',
    },
  },
  eslintConfigPrettier, // IMPORTANT: This MUST be the last configuration in the array to override other formatting rules.
  {
    // Any custom project-specific rules or overrides can go here
    // These will apply globally unless a more specific config overrides them
    rules: {
      // e.g., "no-console": "warn",
    },
  },
)
