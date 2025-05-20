import { defineAstroI18nConfig } from 'astro-i18n'

export default defineAstroI18nConfig({
  primaryLocale: 'ca', // Primary language: Catalan
  secondaryLocales: ['es', 'en'], // Secondary languages: Spanish, English
  fallbackLocale: 'ca', // Fallback to Catalan if a translation is missing
  trailingSlash: 'never', // Options: "never" or "always"
  run: 'client+server', // Options: "client+server" or "server"
  showPrimaryLocale: false, // Determines if the primary locale is shown in the URL (e.g., /ca/about vs /about)
  translationLoadingRules: [
    {
      routes: ['.*'], // Apply to all routes (regex)
      groups: ['shared'], // Load the "shared" translation group
    },
  ], // Rules for loading translation groups per page
  translationDirectory: {}, // Custom names for translation directories
  translations: {}, // Inline translations: { [group]: { [locale]: { [key]: value } } }
  routes: {}, // For translating URL slugs: { [secondary_locale]: { [original_slug]: "translated_slug" } }
})
