/**
 * i18n Helper Functions
 * Utilities for internationalization support
 */

import {
  type SupportedLanguage,
  detectLanguageFromPath,
  getAllLanguageUrls,
  getEquivalentUrl,
} from '@/shared/config/urlMappings'

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
 * Get Open Graph locale format
 * @param lang - The language code
 * @returns The Open Graph locale string
 */
export function getOpenGraphLocale(lang: SupportedLanguage): string {
  const config = getLanguageConfig(lang)
  return config?.locale || 'ca_ES'
}
