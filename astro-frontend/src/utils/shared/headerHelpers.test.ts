// Tests for headerHelpers getPagePath
import { describe, it, expect } from 'vitest'
import { getPagePath } from './headerHelpers'
import type { NavigationPage } from '@/shared/schemas/sanity/headerSchema'

function makeInternalNav(type: 'projectsPage' | 'aboutUsPage' | 'contactPage'): NavigationPage {
  return {
    _key: 'nav',
    _type: 'navigationItem',
    title: 'dummy',
    isExternal: false,
    pageReference: {
      _type: type,
      title: 'ignored',
    },
  } as unknown as NavigationPage
}

function makeExternalNav(): NavigationPage {
  return {
    _key: 'ext',
    _type: 'navigationItem',
    title: 'External',
    isExternal: true,
    externalUrl: 'https://example.com',
  } as unknown as NavigationPage
}

describe('getPagePath', () => {
  it('returns Catalan routes without locale prefix', () => {
    expect(getPagePath(makeInternalNav('projectsPage'), 'ca')).toBe('/projectes')
    expect(getPagePath(makeInternalNav('aboutUsPage'), 'ca')).toBe('/nosaltres')
    expect(getPagePath(makeInternalNav('contactPage'), 'ca')).toBe('/contacte')
  })

  it('returns Spanish routes with /es prefix', () => {
    expect(getPagePath(makeInternalNav('projectsPage'), 'es')).toBe('/es/proyectos')
    expect(getPagePath(makeInternalNav('aboutUsPage'), 'es')).toBe('/es/nosotros')
    expect(getPagePath(makeInternalNav('contactPage'), 'es')).toBe('/es/contacto')
  })

  it('returns English routes with /en prefix', () => {
    expect(getPagePath(makeInternalNav('projectsPage'), 'en')).toBe('/en/projects')
    expect(getPagePath(makeInternalNav('aboutUsPage'), 'en')).toBe('/en/about-us')
    expect(getPagePath(makeInternalNav('contactPage'), 'en')).toBe('/en/contact')
  })

  it('passes through external URLs', () => {
    expect(getPagePath(makeExternalNav(), 'es')).toBe('https://example.com')
  })
})
