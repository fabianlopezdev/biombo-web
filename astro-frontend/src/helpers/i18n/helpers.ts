/**
 * i18n Helper Functions
 * Utilities for internationalization support
 */

import {
  type SupportedLanguage,
  detectLanguageFromPath,
  getAllLanguageUrls,
  getEquivalentUrl,
} from '@/config/routing/urlMappings'

// Re-export from urlMappings for convenience
export { detectLanguageFromPath, getAllLanguageUrls, getEquivalentUrl }

/**
 * Supported languages configuration
 */
export const languages = {
  ca: {
    code: 'ca' as const,
    name: 'Català',
    shortName: 'Cat',
    locale: 'ca-ES',
    hreflang: 'ca',
  },
  en: {
    code: 'en' as const,
    name: 'English',
    shortName: 'Eng',
    locale: 'en-US',
    hreflang: 'en',
  },
  es: {
    code: 'es' as const,
    name: 'Español',
    shortName: 'Esp',
    locale: 'es-ES',
    hreflang: 'es',
  },
} as const

/**
 * Get the full URL with domain
 * @param path - The relative path
 * @param siteUrl - The site base URL (e.g., https://biombostudio.com)
 * @returns The full URL
 */
export function getAbsoluteUrl(path: string, siteUrl: string): string {
  // Ensure siteUrl doesn't end with slash and path starts with slash
  const cleanSiteUrl = siteUrl.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${cleanSiteUrl}${cleanPath}`
}

/**
 * Generate hreflang entries for a given path
 * @param currentPath - The current page path
 * @param siteUrl - The site base URL
 * @returns Array of hreflang data for link tags
 */
export function generateHreflangData(currentPath: string, siteUrl: string) {
  const allUrls = getAllLanguageUrls(currentPath)

  return [
    // Language-specific versions
    {
      hreflang: 'ca',
      href: getAbsoluteUrl(allUrls.ca, siteUrl),
    },
    {
      hreflang: 'en',
      href: getAbsoluteUrl(allUrls.en, siteUrl),
    },
    {
      hreflang: 'es',
      href: getAbsoluteUrl(allUrls.es, siteUrl),
    },
    // x-default points to Catalan (default language)
    {
      hreflang: 'x-default',
      href: getAbsoluteUrl(allUrls.ca, siteUrl),
    },
  ]
}

/**
 * Get canonical URL for the current page
 * @param currentPath - The current page path
 * @param currentLang - The current language
 * @param siteUrl - The site base URL
 * @returns The canonical URL
 */
export function getCanonicalUrl(
  currentPath: string,
  currentLang: SupportedLanguage,
  siteUrl: string,
): string {
  // For canonical, we use the current language version
  const equivalentUrl = getEquivalentUrl(currentPath, currentLang)
  return getAbsoluteUrl(equivalentUrl, siteUrl)
}

/**
 * Check if a language code is supported
 * @param lang - The language code to check
 * @returns True if the language is supported
 */
export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return lang === 'ca' || lang === 'en' || lang === 'es'
}

/**
 * Get language configuration by code
 * @param code - The language code
 * @returns The language configuration or null
 */
export function getLanguageConfig(code: SupportedLanguage) {
  return languages[code] || null
}

/**
 * Format language data for the language switcher
 * @param currentPath - The current page path
 * @param currentLang - The current language
 * @returns Array of language switcher data
 */
export function getLanguageSwitcherData(currentPath: string, currentLang: SupportedLanguage) {
  const allUrls = getAllLanguageUrls(currentPath)

  return Object.entries(languages).map(([code, config]) => ({
    code: config.code,
    short: config.shortName,
    fullName: config.name,
    path: allUrls[code as SupportedLanguage],
    srSuffix: `(${config.name})`,
    isCurrent: config.code === currentLang,
  }))
}

/**
 * Get visible languages based on site settings
 * Filters language switcher data to only show languages marked as ready in Sanity
 * Always includes the current language to prevent users from being trapped
 * @param currentPath - The current page path
 * @param currentLang - The current language
 * @param siteSettings - The site settings with language visibility toggles
 * @returns Array of visible language switcher data
 */
export function getVisibleLanguages(
  currentPath: string,
  currentLang: SupportedLanguage,
  siteSettings?: {
    catalaVisible?: boolean
    spanishVisible?: boolean
    englishVisible?: boolean
  } | null,
) {
  const allLanguages = getLanguageSwitcherData(currentPath, currentLang)

  // If no site settings, show all languages (backward compatible)
  if (!siteSettings) {
    return allLanguages
  }

  return allLanguages.filter((lang) => {
    // Always show the current language (prevents users from being trapped)
    if (lang.code === currentLang) return true

    // Filter based on visibility settings (default to true for backward compatibility)
    if (lang.code === 'ca') return siteSettings.catalaVisible !== false
    if (lang.code === 'es') return siteSettings.spanishVisible !== false
    if (lang.code === 'en') return siteSettings.englishVisible !== false

    return true
  })
}

/**
 * Get Open Graph locale format
 * @param lang - The language code
 * @returns The Open Graph locale string
 */
export function getOpenGraphLocale(lang: SupportedLanguage): string {
  const config = getLanguageConfig(lang)
  return config?.locale || 'ca_ES'
}

/**
 * Type for localized string object (alt text, etc.)
 */
export interface LocalizedString {
  ca?: string
  es?: string
  en?: string
}

/**
 * Get localized text from a multilingual object
 * Falls back to other languages if the requested language is not available
 * @param localizedObj - Object with ca, es, en properties
 * @param lang - The target language code
 * @param fallback - Default fallback string if no translation found
 * @returns The localized string or fallback
 */
export function getLocalizedText(
  localizedObj: LocalizedString | null | undefined,
  lang: SupportedLanguage,
  fallback: string = '',
): string {
  if (!localizedObj) return fallback

  // Try the requested language first
  if (localizedObj[lang]) return localizedObj[lang]

  // Fall back to Catalan (default language)
  if (localizedObj.ca) return localizedObj.ca

  // Fall back to any available language
  if (localizedObj.es) return localizedObj.es
  if (localizedObj.en) return localizedObj.en

  return fallback
}

/**
 * Get localized alt text from an image object
 * Convenience wrapper around getLocalizedText for image alt fields
 * @param image - Image object with optional alt field
 * @param lang - The target language code
 * @param fallback - Default fallback string if no alt text found
 * @returns The localized alt text or fallback
 */
export function getLocalizedAlt(
  image: { alt?: LocalizedString | null } | null | undefined,
  lang: SupportedLanguage,
  fallback: string = '',
): string {
  return getLocalizedText(image?.alt, lang, fallback)
}
