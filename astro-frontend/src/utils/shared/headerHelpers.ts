/* ---------------------------------------------------------------------------
 * Navigation helpers for Header component
 * Pure functions – no side effects, no I/O
 * ---------------------------------------------------------------------------
 */

import type { NavigationPage } from '@/shared/schemas/sanity/headerSchema'

/**
 * Mapping of page types to their localized URL paths
 * This is used for generating the correct URLs based on page references
 */
const PAGE_ROUTES = {
  // Projects page - projectes (ca) / proyectos (es) / projects (en)
  projectsPage: {
    ca: 'projectes',
    es: 'proyectos',
    en: 'projects',
  },
  // Services page - serveis (ca) / servicios (es) / services (en)
  servicesPage: {
    ca: 'serveis',
    es: 'servicios',
    en: 'services',
  },
  // About Us page - nosaltres (ca) / nosotros (es) / about-us (en)
  aboutUsPage: {
    ca: 'nosaltres',
    es: 'nosotros',
    en: 'about-us',
  },
  // Contact page - contacte (ca) / contacto (es) / contact (en)
  contactPage: {
    ca: 'contacte',
    es: 'contacto',
    en: 'contact',
  },
} as const

/**
 * Return the title for a navigation page.
 * Gets the title from the page reference or directly from the page object.
 * 'Missing Title' is returned as a fallback.
 */
export function getPageName(page: NavigationPage | null | undefined): string {
  // Early return for invalid input
  if (!page || typeof page !== 'object') {
    return 'Missing Title'
  }

  // Try to get title from page reference first
  if (
    page.pageReference &&
    typeof page.pageReference === 'object' &&
    'title' in page.pageReference
  ) {
    const refTitle = (page.pageReference as { title?: unknown }).title
    if (typeof refTitle === 'string' && refTitle.trim()) {
      return refTitle.trim()
    }
  }

  // Fall back to direct title property
  if ('title' in page && typeof page.title === 'string' && page.title.trim()) {
    return page.title.trim()
  }

  // Default fallback
  return 'Missing Title'
}

/**
 * Build a navigation path for the page according to locale rules.
 *  • External links are returned as-is.
 *  • Internal links use the locale-aware mapping to generate the correct path.
 */
export function getPagePath(page: NavigationPage | null | undefined, locale: string): string {
  // Early return for invalid input
  if (!page || typeof page !== 'object') {
    return '#'
  }

  // Validate locale
  const validLocales = ['ca', 'es', 'en'] as const
  type ValidLocale = (typeof validLocales)[number]
  const safeLocale: ValidLocale = validLocales.includes(locale as ValidLocale)
    ? (locale as ValidLocale)
    : 'ca'

  try {
    // Handle external URLs
    if (page.isExternal === true) {
      // Return the URL if it exists and is a string
      return typeof page.externalUrl === 'string' && page.externalUrl.trim()
        ? page.externalUrl.trim()
        : '#'
    }

    // Determine locale prefix: empty for Catalan, "/es" or "/en" for others
    const localePart = safeLocale === 'ca' ? '' : `/${safeLocale}`

    // Handle page references based on their type
    if (!page.pageReference || typeof page.pageReference !== 'object') {
      return '#'
    }

    const pageRef = page.pageReference as { _type?: string }
    const pageType = pageRef._type

    // Early return if no page type
    if (!pageType || typeof pageType !== 'string') {
      return '#'
    }

    // Type guard for known page types
    const isKnownPageType = (type: string): type is keyof typeof PAGE_ROUTES => {
      return type in PAGE_ROUTES
    }

    if (!isKnownPageType(pageType)) {
      return '#'
    }

    // Get localized path
    const routes = PAGE_ROUTES[pageType]
    const localizedPath = routes[safeLocale]

    if (!localizedPath) {
      return '#'
    }

    // Build the full path
    if (localePart) {
      // Non-default locale: /es/ruta or /en/path
      return `${localePart}/${localizedPath}`.replace('//', '/')
    }

    // Default locale (Catalan): /ruta
    return `/${localizedPath}`
  } catch (error) {
    console.error('[getPagePath] Error building navigation path:', error)
    return '#'
  }
}
