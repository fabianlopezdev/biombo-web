import { describe, it, expect } from 'vitest'
import { headerSchema } from './headerSchema'
import { homePageSchema } from './homePageSchema'

describe('Sanity Schema Validation', () => {
  describe('headerSchema', () => {
    it('should validate header data with null pageReference.slug', () => {
      const mockHeaderData = {
        _id: 'header-123',
        _type: 'header',
        language: 'es',
        navigationPages: [
          {
            _key: 'f8b874b8f13c',
            _type: 'navigationItem',
            title: 'Proyectos',
            pageReference: {
              _type: 'projectsPage',
              language: null,
              slug: null, // Testing null slug
              title: 'Projectes',
            },
          },
        ],
      }

      // This should not throw with our updated schema
      const validationResult = headerSchema.safeParse(mockHeaderData)
      expect(validationResult.success).toBe(true)

      if (validationResult.success) {
        const data = validationResult.data
        expect(data.navigationPages?.[0].pageReference?.slug).toBeNull()
      }
    })

    it('should validate header data with valid pageReference.slug', () => {
      const mockHeaderData = {
        _id: 'header-123',
        _type: 'header',
        language: 'ca',
        navigationPages: [
          {
            _key: 'abc123',
            _type: 'navigationItem',
            title: 'Home',
            pageReference: {
              _type: 'homePage',
              language: 'ca',
              slug: { current: 'home' }, // Valid slug object
              title: 'Inici',
            },
          },
        ],
      }

      const validationResult = headerSchema.safeParse(mockHeaderData)
      expect(validationResult.success).toBe(true)

      if (validationResult.success) {
        const data = validationResult.data
        expect(data.navigationPages?.[0].pageReference?.slug?.current).toBe('home')
      }
    })
  })

  describe('homePageSchema', () => {
    it('should validate homePage data with null top-level fields', () => {
      const mockHomePageData = {
        _id: 'homePage-ca',
        _type: 'homePage',
        _createdAt: '2023-01-01T00:00:00Z',
        _updatedAt: '2023-01-02T00:00:00Z',
        hero: null, // Testing null hero
        projects: null, // Testing null projects
        about: null, // Testing null about
        services: null, // Testing null services
      }

      // This should not throw with our updated schema
      const validationResult = homePageSchema.safeParse(mockHomePageData)
      expect(validationResult.success).toBe(true)

      if (validationResult.success) {
        const data = validationResult.data
        expect(data.hero).toBeNull()
        expect(data.projects).toBeNull()
        expect(data.about).toBeNull()
        expect(data.services).toBeNull()
      }
    })

    it('should validate homePage data with valid sections', () => {
      const mockHomePageData = {
        _id: 'homePage-ca',
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
          featuredProjects: [], // Empty array of projects
        },
        // about and services are undefined (not provided)
      }

      const validationResult = homePageSchema.safeParse(mockHomePageData)
      expect(validationResult.success).toBe(true)

      if (validationResult.success) {
        const data = validationResult.data
        expect(data.hero).not.toBeNull()
        expect(data.projects).not.toBeNull()
        expect(data.about).toBeUndefined()
        expect(data.services).toBeUndefined()
      }
    })
  })
})
