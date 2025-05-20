console.log(
  '[Diagnostic] astro-i18n.config.ts: File is executing (Restored with showPrimaryLocale)',
)
import { defineAstroI18nConfig } from 'astro-i18n'

const config = defineAstroI18nConfig({
  primaryLocale: 'ca',
  secondaryLocales: ['es', 'en'],
  fallbackLocale: 'ca',
  trailingSlash: 'never',
  run: 'client+server',
  showPrimaryLocale: false, // IMPORTANT for desired URL structure
  translationLoadingRules: [
    {
      routes: ['.*'], // Apply to all routes (regex)
      groups: ['shared'], // Load the "shared" translation group (assuming you have translations/shared.{locale}.json)
    },
  ],
  // translations: {}, // For embedding translations directly
  // routes: {}, // For translating URL slugs, keep simple for now
})

console.log(
  '[Diagnostic] astro-i18n.config.ts: Restored Config object created:',
  config ? `Type: ${typeof config}, Keys: ${Object.keys(config).join(', ')}` : 'undefined',
)
export default config
