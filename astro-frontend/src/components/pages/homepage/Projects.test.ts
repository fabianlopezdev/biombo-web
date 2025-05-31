import { describe, it, expect } from 'vitest'
import { transformProject } from '@/utils/pages/homepage/projectsUtils'
import type { FeaturedProjectItem } from '@/shared/schemas/sanity/homePageSchema'
import type { Project } from '@/shared/schemas/sanity/projectSchema' // For typing the nested project in mock data

describe('transformProject utility', () => {
  it('should transform project data correctly with mainImage only', () => {
    const mockProject: Project = {
      _id: 'test-project',
      _type: 'project',
      _createdAt: '',
      _updatedAt: '',
      title: { ca: 'Test Project', en: 'Test Project EN', es: 'Test Project ES' },
      slug: {
        _type: 'localeSlug',
        ca: { current: 'test-project' },
        en: { current: 'test-project-en' },
        es: { current: 'test-project-es' },
      },
      mainImage: {
        _type: 'image',
        asset: {
          _id: 'image-123-id',
          _type: 'sanity.imageAsset',
          url: 'https://test-image.url',
        },
        alt: { ca: 'Test Alt', en: 'Test Alt EN', es: 'Test Alt ES' },
      },
    }

    const mockFeaturedItem: FeaturedProjectItem = {
      _key: 'key1',
      project: mockProject,
      hoverColor: { hex: '#112233' },
      textHoverColor: { hex: '#AABBCC' },
    }

    const result = transformProject(mockFeaturedItem, 0, 'ca', 'View Project')

    expect(result).toEqual({
      _id: 'test-project',
      index: 0,
      slug: 'test-project',
      image: 'https://test-image.url',
      alt: 'Test Alt',
      title: 'Test Project',
      viewProjectText: 'View Project',
      hoverColor: '#112233',
      textHoverColor: '#AABBCC',
    })
  })

  it('should handle null project data by creating a placeholder', () => {
    const result = transformProject(null, 1, 'ca', 'View Project')

    expect(result).toEqual({
      index: 1,
      slug: '',
      image: '',
      alt: '',
      title: '',
      viewProjectText: 'View Project',
      hoverColor: undefined,
      textHoverColor: undefined,
    })
  })

  it('should prefer thumbnailImage over mainImage when both are available', () => {
    const mockProject: Project = {
      _id: 'test-project-2',
      _type: 'project',
      _createdAt: '',
      _updatedAt: '',
      title: { ca: 'Test Project 2' },
      slug: {
        _type: 'localeSlug',
        ca: { current: 'test-project-2' },
      },
      mainImage: {
        _type: 'image',
        asset: {
          _id: 'image-main-123-id',
          _type: 'sanity.imageAsset',
          url: 'https://test-image.url/main',
        },
        alt: { ca: 'Main Image Alt' },
      },
      thumbnailImage: {
        _type: 'image',
        asset: {
          _id: 'image-thumb-123-id',
          _type: 'sanity.imageAsset',
          url: 'https://test-image.url',
        },
        alt: { ca: 'Thumbnail Alt' },
      },
    }

    const mockFeaturedItem: FeaturedProjectItem = {
      _key: 'key2',
      project: mockProject,
      hoverColor: { hex: '#445566' },
      textHoverColor: { hex: '#DDEEFF' },
    }

    const result = transformProject(mockFeaturedItem, 2, 'ca', 'View Project')

    expect(result).toEqual({
      _id: 'test-project-2',
      index: 2,
      slug: 'test-project-2',
      image: 'https://test-image.url',
      alt: 'Thumbnail Alt',
      title: 'Test Project 2',
      viewProjectText: 'View Project',
      hoverColor: '#445566',
      textHoverColor: '#DDEEFF',
    })
  })

  it('should fall back to mainImage when thumbnailImage is not available', () => {
    const mockProject: Project = {
      _id: 'test-project-3',
      _type: 'project',
      _createdAt: '',
      _updatedAt: '',
      title: { ca: 'Test Project 3' },
      slug: {
        _type: 'localeSlug',
        ca: { current: 'test-project-3' },
      },
      mainImage: {
        _type: 'image',
        asset: {
          _id: 'image-main-456-id',
          _type: 'sanity.imageAsset',
          url: 'https://test-image.url',
        },
        alt: { ca: 'Main Image Alt' },
      },
    }

    const mockFeaturedItem: FeaturedProjectItem = {
      _key: 'key3',
      project: mockProject,
      hoverColor: { hex: '#778899' },
      textHoverColor: { hex: '#001122' },
    }

    const result = transformProject(mockFeaturedItem, 3, 'ca', 'View Project')

    expect(result).toEqual({
      _id: 'test-project-3',
      index: 3,
      slug: 'test-project-3',
      image: 'https://test-image.url',
      alt: 'Main Image Alt',
      title: 'Test Project 3',
      viewProjectText: 'View Project',
      hoverColor: '#778899',
      textHoverColor: '#001122',
    })
  })
})
