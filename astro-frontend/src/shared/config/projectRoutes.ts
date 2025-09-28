// Maps language codes to their localized URL segments
export const projectUrlSegments = {
  ca: 'projectes',
  en: 'projects',
  es: 'proyectos',
} as const

export type SupportedLocale = keyof typeof projectUrlSegments

// Helper to construct project URLs
export function getProjectUrl(locale: SupportedLocale, slug: string): string {
  // Catalan is at root level
  if (locale === 'ca') {
    return `/projectes/${slug}`
  }
  // Other languages have locale prefix
  return `/${locale}/${projectUrlSegments[locale]}/${slug}`
}

// Parse the dynamic route parameters to determine locale
export function parseProjectRoute(lang: string): SupportedLocale | null {
  // Check if it's the Catalan root route
  if (lang === 'projectes') return 'ca'
  // Check if it's a valid language code
  if (lang in projectUrlSegments) return lang as SupportedLocale
  return null
}

// Get the base projects list URL for a locale
export function getProjectsListUrl(locale: SupportedLocale): string {
  if (locale === 'ca') {
    return '/projectes'
  }
  return `/${locale}/${projectUrlSegments[locale]}`
}
