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
export function getPageName(page: NavigationPage): string {
  // First check if we have a page reference and a title from it
  if (page.pageReference && typeof page.pageReference === 'object' && page.pageReference?.title) {
    const title = page.pageReference.title
    return typeof title === 'string' ? title.trim() : 'Missing Title'
  }

  // Handle string title (non-internationalized)
  if (typeof page.title === 'string') {
    return page.title.trim() || 'Missing Title'
  }

  // Since we've removed localized fields from our schema, we no longer need the object checks
  // Default fallback
  return 'Missing Title'
}

/**
 * Build a navigation path for the page according to locale rules.
 *  • External links are returned as-is.
 *  • Internal links use the locale-aware mapping to generate the correct path.
 */
export function getPagePath(page: NavigationPage, locale: string): string {
  try {
    // Handle external URLs
    if (page.isExternal) {
      // Return the URL if it exists and is a string
      return page.externalUrl && typeof page.externalUrl === 'string' ? page.externalUrl : '#' // Fallback for missing URLs
    }

    // Determine locale prefix: empty for Catalan, "/es" or "/en" for others
    const localePart = locale === 'ca' ? '' : `/${locale}`

    // Handle page references based on their type
    if (page.pageReference && typeof page.pageReference === 'object') {
      const pageType = page.pageReference._type

      // Validate we have a known page type
      if (!pageType) {
        console.warn('Missing page type in reference', { page })
        return '#'
      }

      // Check if this is one of our mapped types
      if (pageType === 'projectsPage' || pageType === 'aboutUsPage' || pageType === 'contactPage') {
        // We verified this is a valid key with our if statement
        // Use the page type to access the correct route map
        const localizedPath = PAGE_ROUTES[pageType][locale as 'ca' | 'es' | 'en'] || ''

        if (localizedPath) {
          // Build the full path properly
          if (localePart) {
            // Non-default locale: /es/ruta or /en/path
            // Avoid double slashes by checking for them directly
            const fullPath = `${localePart}/${localizedPath}`
            return fullPath.includes('//') ? fullPath.replace('//', '/') : fullPath
          } else {
            // Default locale (Catalan): /ruta
            return `/${localizedPath}`
          }
        }
      }

      // Unknown page type
      // console.log(`Unknown page reference type: ${pageType}`)
      return '#'
    }

    // No valid reference found
    // console.warn('Missing page reference', { page })
    return '#'
  } catch (error) {
    console.error('Error generating page path:', error)
    return '#'
  }
}
