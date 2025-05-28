/* ---------------------------------------------------------------------------
 * Navigation helpers for Header component
 * Pure functions – no side effects, no I/O
 * ---------------------------------------------------------------------------
 */

import type { NavigationPage } from '@/shared/schemas/sanity/headerSchema'

/**
 * Return the best-match title for the given locale.
 * Fallback order:
 *   1. Exact locale key (e.g. 'es')
 *   2. Catalan ('ca') – your default page
 *   3. First non-empty string in the title object
 *   4. 'Missing Title' placeholder
 */
export function getPageName(page: NavigationPage, locale: string): string {
  // Handle string title (non-internationalized)
  if (typeof page.title === 'string') {
    return page.title.trim() || 'Missing Title'
  }

  // Handle object title (internationalized)
  if (page.title && typeof page.title === 'object') {
    // 1. Exact locale
    // Use type-safe property access with hasOwnProperty check
    if (Object.prototype.hasOwnProperty.call(page.title, locale)) {
      const exactPageName = page.title[locale as keyof typeof page.title]
      if (typeof exactPageName === 'string' && exactPageName.trim()) return exactPageName.trim()
    }

    // 2. Catalan fallback
    if (Object.prototype.hasOwnProperty.call(page.title, 'ca')) {
      const ca = page.title.ca
      if (typeof ca === 'string' && ca.trim()) return ca.trim()
    }

    // 3. First non-empty entry
    // Skip the _type property and only consider actual language values
    for (const [key, value] of Object.entries(page.title)) {
      // Skip the _type property
      if (key === '_type') continue
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
  }

  // 4. Default
  return 'Missing Title'
}

/**
 * Build a navigation path for the page according to locale rules.
 *  • External links are returned as-is.
 *  • Internal links honour the 'home' slug special-case and omit redundant
 *    slashes (e.g. '' or '/es' or '/blog').
 */
export function getPagePath(page: NavigationPage, locale: string): string {
  try {
    // External URL – open in new tab
    if (page.isExternal) {
      if (page.externalUrl && typeof page.externalUrl === 'string') return page.externalUrl
      return '#'
    }

    // Internal route construction
    const localePart = locale === 'ca' ? '' : `/${locale}`

    // Get slug for current locale, fallback to default locale (ca)
    let slugValue = ''

    // Handle non-internationalized slug (simple structure)
    if (page.slug && '_type' in page.slug && page.slug._type === 'slug' && 'current' in page.slug) {
      // Simple slug structure: { _type: 'slug', current: string }
      slugValue = page.slug.current || ''
    }
    // Handle internationalized slug structure
    else {
      // Access the localized slug structure that matches our schema
      // This has a specific shape with _type and language codes
      const slugObj = page.slug as
        | {
            _type: string
            ca?: { current: string }
            en?: { current: string }
            es?: { current: string }
          }
        | undefined

      if (slugObj && typeof slugObj === 'object') {
        // First try to get slug for the specific locale
        const localeKey = locale as 'ca' | 'en' | 'es'
        if (slugObj[localeKey]?.current) {
          slugValue = slugObj[localeKey]?.current || ''
        }
        // Fallback to Catalan slug if available
        else if (slugObj.ca?.current) {
          slugValue = slugObj.ca.current
        }
        // Try other languages if needed
        else if (slugObj.en?.current) {
          slugValue = slugObj.en.current
        } else if (slugObj.es?.current) {
          slugValue = slugObj.es.current
        }
      }
    }

    const slugPart = !slugValue || slugValue === 'home' ? '' : `/${slugValue}`

    // Handle root path collapsing (avoid double slash)
    const path = `${localePart}${slugPart}` || '/'
    return path.replace(/\/{2,}/g, '/')
  } catch {
    // Fallback on any unexpected shape
    return '#'
  }
}
