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

// Get the base projects list URL for a locale
export function getProjectsListUrl(locale: SupportedLocale): string {
  if (locale === 'ca') {
    return '/projectes'
  }
  return `/${locale}/${projectUrlSegments[locale]}`
}
