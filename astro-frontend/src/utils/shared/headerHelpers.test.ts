import { describe, it, expect } from 'vitest'
import { getPageName, getPagePath } from './headerHelpers' // same folder
import type { NavigationPage } from '@/shared/schemas/sanity/headerSchema'

// Define a type for our test data that matches the schema structure
type LocaleString = {
  _type: 'localeString'
  ca?: string
  es?: string
  en?: string
  [key: string]: string | undefined
}
type LocaleSlug = {
  _type: 'localeSlug'
  ca: { _type: 'slug'; current: string }
  es: { _type: 'slug'; current: string }
  en: { _type: 'slug'; current: string }
}

// ---------------------------------------------------------------------------
// Sample navigation item for re-use with the updated schema structure
// ---------------------------------------------------------------------------
const sampleItem: NavigationPage = {
  _key: 'abc',
  _type: 'NavigationPage', // Updated to match the new schema
  isExternal: false,
  slug: {
    _type: 'localeSlug',
    ca: { _type: 'slug', current: 'blog' },
    en: { _type: 'slug', current: 'blog' },
    es: { _type: 'slug', current: 'blog' },
  },
  title: {
    _type: 'localeString',
    ca: 'Bloc',
    es: 'Blog ES',
    en: 'Blog EN',
  } as LocaleString,
  externalUrl: null, // Updated to match the nullable field
}

// ---------------------------------------------------------------------------
// getPageName
// ---------------------------------------------------------------------------
describe('getPageName', () => {
  it('returns the exact locale match', () => {
    expect(getPageName(sampleItem, 'es')).toBe('Blog ES')
  })

  it('falls back to Catalan ("ca") when exact match is missing', () => {
    const item = { ...sampleItem, title: { _type: 'localeString', ca: 'Bloc' } }
    expect(getPageName(item, 'fr')).toBe('Bloc')
  })

  it('falls back to the first non-empty title when no standard locale exists', () => {
    // Instead of testing with a custom locale, let's test with a more realistic scenario
    // where the standard locales are missing but we have a fallback
    const item = {
      ...sampleItem,
      title: {
        _type: 'localeString',
        // Remove standard locales
        ca: undefined,
        es: undefined,
        en: undefined,
        // Add a non-standard locale
        fr: 'Blog FR',
      } as LocaleString,
    }

    // We expect the function to find the first non-empty string value
    expect(getPageName(item, 'en')).toBe('Blog FR')
  })

  it('returns "Missing Title" placeholder on malformed input', () => {
    // deliberately using malformed data to test the function's error handling
    // The function specifically checks if title exists and is an object
    const malformedItem = { _key: 'test', _type: 'NavigationPage' } as NavigationPage
    expect(getPageName(malformedItem, 'en')).toBe('Missing Title')
  })
})

// ---------------------------------------------------------------------------
// getPagePath
// ---------------------------------------------------------------------------
describe('getPagePath', () => {
  it('builds an internal path that includes the locale (non-default)', () => {
    expect(getPagePath(sampleItem, 'es')).toBe('/es/blog')
  })

  it('omits locale prefix for the default Catalan locale', () => {
    expect(getPagePath(sampleItem, 'ca')).toBe('/blog')
  })

  it('returns / when slug is "home" or empty', () => {
    const item = {
      ...sampleItem,
      slug: {
        _type: 'localeSlug' as const,
        ca: { _type: 'slug' as const, current: 'home' },
        en: { _type: 'slug' as const, current: 'home' },
        es: { _type: 'slug' as const, current: 'home' },
      } as LocaleSlug,
    }
    expect(getPagePath(item, 'ca')).toBe('/')
  })

  it('passes through external URLs unchanged', () => {
    const extItem = {
      ...sampleItem,
      isExternal: true,
      externalUrl: 'https://example.com',
    }
    expect(getPagePath(extItem, 'en')).toBe('https://example.com')
  })
})
