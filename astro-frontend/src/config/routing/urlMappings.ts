/**
 * URL Mapping System for Multilingual Site
 * Maintains relationships between equivalent pages across languages
 */

export type SupportedLanguage = 'ca' | 'en' | 'es'

interface UrlTranslations {
  ca: string
  en: string
  es: string
}

/**
 * Static page URL mappings
 * Maps each page to its equivalent in all languages
 */
export const staticUrlMappings: Record<string, UrlTranslations> = {
  // Homepage
  '/': {
    ca: '/',
    en: '/en/',
    es: '/es/',
  },
  // Projects list
  '/projectes': {
    ca: '/projectes',
    en: '/en/projects',
    es: '/es/proyectos',
  },
  // Services
  '/serveis': {
    ca: '/serveis',
    en: '/en/services',
    es: '/es/servicios',
  },
  // About us
  '/nosaltres': {
    ca: '/nosaltres',
    en: '/en/about-us',
    es: '/es/nosotros',
  },
  // Contact
  '/contacte': {
    ca: '/contacte',
    en: '/en/contact',
    es: '/es/contacto',
  },
  // Legal
  '/avis-legal': {
    ca: '/avis-legal',
    en: '/en/legal-notice',
    es: '/es/aviso-legal',
  },
}

/**
 * Get the equivalent URL in a target language for the current path
 * @param currentPath - The current URL path
 * @param targetLang - The target language code
 * @returns The equivalent URL in the target language
 */
export function getEquivalentUrl(currentPath: string, targetLang: SupportedLanguage): string {
  // Remove trailing slash for consistency
  const normalizedPath = currentPath.replace(/\/$/, '') || '/'

  // Check if it's a project detail page
  const projectPatterns = ['/projectes/', '/projects/', '/proyectos/']
  const isProjectPage = projectPatterns.some((pattern) => normalizedPath.includes(pattern))

  if (isProjectPage) {
    // Extract the slug from the current path
    const segments = normalizedPath.split('/')
    const slug = segments[segments.length - 1]

    // Return the project URL in the target language
    const projectUrls = {
      ca: `/projectes/${slug}`,
      en: `/en/projects/${slug}`,
      es: `/es/proyectos/${slug}`,
    }
    return projectUrls[targetLang]
  }

  // Check static mappings
  for (const [, translations] of Object.entries(staticUrlMappings)) {
    // Check if current path matches any translation
    if (
      translations.ca === normalizedPath ||
      translations.en === normalizedPath ||
      translations.es === normalizedPath
    ) {
      return translations[targetLang]
    }
  }

  // Handle root language pages (e.g., /en, /es without trailing slash)
  if (normalizedPath === '/en' || normalizedPath === '/es') {
    return targetLang === 'ca' ? '/' : `/${targetLang}/`
  }

  // Fallback to homepage for the target language
  return targetLang === 'ca' ? '/' : `/${targetLang}/`
}

/**
 * Get all language versions of the current URL
 * @param currentPath - The current URL path
 * @returns Object with URLs for all languages
 */
export function getAllLanguageUrls(currentPath: string): UrlTranslations {
  return {
    ca: getEquivalentUrl(currentPath, 'ca'),
    en: getEquivalentUrl(currentPath, 'en'),
    es: getEquivalentUrl(currentPath, 'es'),
  }
}

/**
 * Detect the current language from a URL path
 * @param path - The URL path to analyze
 * @returns The detected language code
 */
export function detectLanguageFromPath(path: string): SupportedLanguage {
  // Check if path starts with a language code
  if (path.startsWith('/en/') || path === '/en') {
    return 'en'
  }
  if (path.startsWith('/es/') || path === '/es') {
    return 'es'
  }
  // Default to Catalan for root paths
  return 'ca'
}

/**
 * Get the base path without language prefix
 * @param path - The URL path
 * @returns The path without language prefix
 */
export function getBasePathWithoutLanguage(path: string): string {
  // Remove language prefixes
  const withoutLang = path
    .replace(/^\/en\//, '/')
    .replace(/^\/es\//, '/')
    .replace(/^\/en$/, '/')
    .replace(/^\/es$/, '/')

  return withoutLang || '/'
}
