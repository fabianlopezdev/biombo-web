export default {
  // Run tests on changes to relevant files in astro-frontend
  'astro-frontend/**/*.{js,ts,jsx,tsx,astro,vue}': async (files) => {
    // pnpm test will execute `vitest run` from astro-frontend/package.json
    const testCommand = 'pnpm --filter astro-frontend test'
    return [testCommand]
  },
  // Then, run ESLint and Prettier on relevant staged files in astro-frontend
  'astro-frontend/**/*.{js,ts,astro,json}': [
    // These will use the eslint and prettier from the root, but operate on astro-frontend files
    // and should pick up astro-frontend's local configs if not overridden at root.
    // Alternatively, ensure astro-frontend has its own eslint/prettier accessible via pnpm exec
    'pnpm --filter astro-frontend exec eslint --fix',
    'pnpm --filter astro-frontend exec prettier --write',
  ],
}
