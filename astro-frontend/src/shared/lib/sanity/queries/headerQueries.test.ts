import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchHeader } from './headerQueries'
import * as sanityClient from '@/shared/lib/sanity/client'

// Mock the sanity client module
vi.mock('@/shared/lib/sanity/client', () => ({
  fetchSanityQuery: vi.fn(),
}))

describe('headerQueries', () => {
  const mockHeaderData = {
    _id: 'header-123',
    _type: 'header',
    language: 'ca',
    navigationPages: [
      {
        _key: 'nav-1',
        _type: 'navigationItem',
        title: 'Home',
        order: 1,
        visible: true,
        isExternal: false,
        pageReference: {
          _type: 'page',
          _ref: 'page-home',
          title: 'Home',
          slug: { current: 'home' },
          language: 'ca',
        },
      },
      {
        _key: 'nav-2',
        _type: 'navigationItem',
        title: 'Projects',
        order: 2,
        visible: true,
        isExternal: false,
        pageReference: {
          _type: 'page',
          _ref: 'page-projects',
          title: 'Projects',
          slug: { current: 'projects' },
          language: 'ca',
        },
      },
      {
        _key: 'nav-3',
        _type: 'navigationItem',
        title: 'External Link',
        order: 3,
        visible: true,
        isExternal: true,
        externalUrl: 'https://example.com',
      },
    ],
  }

  beforeEach(() => {
    vi.resetAllMocks()
    // Reset console.log to prevent test output clutter
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchHeader', () => {
    it('should fetch and return header data for the specified locale', async () => {
      // Setup the mock to return the mock data
      vi.mocked(sanityClient.fetchSanityQuery).mockResolvedValueOnce(mockHeaderData)

      // Call the function with a specific locale
      const result = await fetchHeader('ca')

      // Assertions
      expect(sanityClient.fetchSanityQuery).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockHeaderData)

      // Verify the query format includes the order clause and slug field
      const queryCall = vi.mocked(sanityClient.fetchSanityQuery).mock.calls[0][0]
      expect(queryCall.query).toContain('navigationPages[] | order(order asc)')
      expect(queryCall.query).toContain('slug,')
    })

    it('should fall back to Catalan when specified locale is not found', async () => {
      // Setup mocks: first call returns null (no header for specified locale)
      // second call returns the Catalan header
      vi.mocked(sanityClient.fetchSanityQuery)
        .mockResolvedValueOnce(null) // No header for 'en'
        .mockResolvedValueOnce(mockHeaderData) // Found Catalan header

      // Call the function with a locale that won't be found
      const result = await fetchHeader('en')

      // Assertions
      expect(sanityClient.fetchSanityQuery).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockHeaderData)

      // Verify the fallback query
      const fallbackQueryCall = vi.mocked(sanityClient.fetchSanityQuery).mock.calls[1][0]
      expect(fallbackQueryCall.query).toContain('language == "ca"')
      expect(fallbackQueryCall.query).toContain('navigationPages[] | order(order asc)')
      expect(fallbackQueryCall.query).toContain('slug,')
    })

    it('should try any header as last resort when no locale-specific headers are found', async () => {
      // Setup mocks: first two calls return null, third call returns a header
      vi.mocked(sanityClient.fetchSanityQuery)
        .mockResolvedValueOnce(null) // No header for specified locale
        .mockResolvedValueOnce(null) // No header for Catalan
        .mockResolvedValueOnce(mockHeaderData) // Found some header

      // Call the function
      const result = await fetchHeader('en')

      // Assertions
      expect(sanityClient.fetchSanityQuery).toHaveBeenCalledTimes(3)
      expect(result).toEqual(mockHeaderData)

      // Verify the last resort query
      const lastResortQueryCall = vi.mocked(sanityClient.fetchSanityQuery).mock.calls[2][0]
      expect(lastResortQueryCall.query).toContain('*[_type == "header"][0]')
      expect(lastResortQueryCall.query).toContain('navigationPages[] | order(order asc)')
      expect(lastResortQueryCall.query).toContain('slug,')
    })

    it('should return null when no header is found at all', async () => {
      // Setup mocks: all calls return null
      vi.mocked(sanityClient.fetchSanityQuery).mockResolvedValue(null)

      // Call the function
      const result = await fetchHeader('en')

      // Assertions
      expect(sanityClient.fetchSanityQuery).toHaveBeenCalledTimes(3) // Should try all three queries
      expect(result).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      // Setup mock to throw an error
      vi.mocked(sanityClient.fetchSanityQuery).mockRejectedValueOnce(new Error('Query error'))

      // Call the function
      const result = await fetchHeader('ca')

      // Assertions
      expect(sanityClient.fetchSanityQuery).toHaveBeenCalledTimes(1)
      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalled()
    })
  })
})
