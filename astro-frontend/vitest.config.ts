// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  envDir: './', // Load .env files from the project root
  test: {
    // Enable global test APIs (describe, test, expect, etc.)
    globals: true,
    // Set the test environment
    // 'node' is good for testing logic that doesn't interact with the DOM
    // 'jsdom' or 'happy-dom' can be used for component testing
    environment: 'node',
    // You can add more Vitest options here as needed
    // For example, to define where your test files are located:
    // include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  // If you have other Vite-specific configurations, they can go here at the top level
})
