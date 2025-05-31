import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchHomePage, fetchHomePageByLocale } from './homePageQueries'
import * as sanityClient from '@/shared/lib/sanity/client'

// Mock the sanity client module
vi.mock('@/shared/lib/sanity/client', () => ({
  fetchSanityQuery: vi.fn(),
}))

describe('homePageQueries', () => {
  const mockHomePageData = {
    _id: 'homepage-123',
    _type: 'homePage',
    _createdAt: '2023-01-01T00:00:00Z',
    _updatedAt: '2023-01-02T00:00:00Z',
    hero: {
      _type: 'heroSection',
      heroText: {
        _type: 'localeString',
        ca: "Text de l'heroi",
        es: 'Texto del héroe',
        en: 'Hero text',
      },
      scrollText: {
        _type: 'localeString',
        ca: "Desplaça't",
        es: 'Desplázate',
        en: 'Scroll',
      },
    },
    projects: {
      _type: 'projectsSection',
      title: {
        _type: 'localeString',
        ca: 'Projectes',
        es: 'Proyectos',
        en: 'Projects',
      },
      subtitle: {
        _type: 'localeString',
        ca: 'Els nostres projectes',
        es: 'Nuestros proyectos',
        en: 'Our projects',
      },
      viewAllText: {
        _type: 'localeString',
        ca: 'Veure tots',
        es: 'Ver todos',
        en: 'View all',
      },
      viewProjectText: {
        _type: 'localeString',
        ca: 'Veure projecte',
        es: 'Ver proyecto',
        en: 'View project',
      },
      featuredProjects: [
        {
          _id: 'project-1',
          _type: 'project',
          _createdAt: '2023-01-01T00:00:00Z',
          _updatedAt: '2023-01-02T00:00:00Z',
          title: {
            _type: 'localeString',
            ca: 'Projecte 1',
            es: 'Proyecto 1',
            en: 'Project 1',
          },
          slug: {
            _type: 'localeSlug',
            ca: { current: 'projecte-1' },
            es: { current: 'proyecto-1' },
            en: { current: 'project-1' },
          },
          mainImage: {
            _type: 'image',
            asset: {
              _id: 'image-1234-jpg-id',
              _type: 'sanity.imageAsset',
              url: 'https://cdn.sanity.io/images/mockprojectid/production/image-1234-jpg.jpg', // Example valid URL structure
            },
            alt: {
              _type: 'localeString',
              ca: 'Imatge del Projecte 1',
              es: 'Imagen del Proyecto 1',
              en: 'Project 1 Image',
            },
          },
          client: 'Client A',
          categories: ['Art', 'Design'],
          projectDate: '2023-01-01',
        },
      ],
    },
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchHomePage', () => {
    it('should fetch and return homepage data when available', async () => {
      // Setup the mock to return the mock data for both raw and validated calls
      vi.mocked(sanityClient.fetchSanityQuery)
        .mockResolvedValueOnce(mockHomePageData) // First call for raw data
        .mockResolvedValueOnce(mockHomePageData) // Second call with schema validation

      // Call the function
      const result = await fetchHomePage()

      // Assertions
      expect(sanityClient.fetchSanityQuery).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockHomePageData)

      // Verify the query format includes the necessary fields for featured projects
      const queryCall = vi.mocked(sanityClient.fetchSanityQuery).mock.calls[0][0]
      expect(queryCall.query).toContain('featuredProjects[] {')
      expect(queryCall.query).toContain('_key')
      expect(queryCall.query).toContain('hoverColor { hex }')
      expect(queryCall.query).toContain('textHoverColor { hex }')
      expect(queryCall.query).toContain('project ->')
    })

    it('should return null when no homepage data is found', async () => {
      // Setup the mock to return null
      vi.mocked(sanityClient.fetchSanityQuery).mockResolvedValueOnce(null)

      // Call the function
      const result = await fetchHomePage()

      // Assertions
      expect(sanityClient.fetchSanityQuery).toHaveBeenCalledTimes(1)
      expect(result).toBeNull()
    })

    it('should handle schema validation failures gracefully', async () => {
      // Setup the mock for the 'validation fails, fallback to raw' scenario:
      // 1. First call to fetchSanityQuery (for rawData) must succeed.
      // 2. Second call to fetchSanityQuery (with schema for validation) must fail.
      vi.mocked(sanityClient.fetchSanityQuery)
        .mockResolvedValueOnce(mockHomePageData) // First call (rawData) succeeds
        .mockRejectedValueOnce(new Error('Simulated schema validation error')) // Second call (with schema) fails

      // Call the function
      const result = await fetchHomePage()

      // Assertions
      expect(sanityClient.fetchSanityQuery).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockHomePageData) // Should fall back to raw data
    })
  })

  describe('fetchHomePageByLocale', () => {
    it('should fetch homepage data for the specified locale', async () => {
      // Setup the mock for both raw and validated calls in fetchHomePage
      vi.mocked(sanityClient.fetchSanityQuery)
        .mockResolvedValueOnce(mockHomePageData) // First call for raw data
        .mockResolvedValueOnce(mockHomePageData) // Second call with schema validation

      // Call the function with a specific locale
      const result = await fetchHomePageByLocale('en')

      // Assertions
      expect(sanityClient.fetchSanityQuery).toHaveBeenCalledTimes(2)
      expect(result).toEqual(mockHomePageData)
    })

    it('should return null when no homepage data is found', async () => {
      // Setup the mock
      vi.mocked(sanityClient.fetchSanityQuery).mockResolvedValueOnce(null)

      // Call the function
      const result = await fetchHomePageByLocale('en')

      // Assertions
      expect(sanityClient.fetchSanityQuery).toHaveBeenCalledTimes(1)
      expect(result).toBeNull()
    })
  })
})
