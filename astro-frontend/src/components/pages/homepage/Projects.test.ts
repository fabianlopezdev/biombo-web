import { describe, it, expect, vi } from 'vitest'
import { transformProject } from '@/utils/pages/homepage/projectsUtils'
import type { Project } from '@/shared/schemas/sanity/projectSchema'

// Mock getSanityImageUrl to return a test URL
vi.mock('@/utils/shared/sanity', () => ({
  getSanityImageUrl: () => 'https://test-image.url',
}))

describe('Projects component utils', () => {
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
        asset: { _type: 'reference', _ref: 'image-123' },
        alt: { ca: 'Test Alt', en: 'Test Alt EN', es: 'Test Alt ES' },
      },
    }

    const result = transformProject(mockProject, 0, 'ca', 'View Project')

    expect(result).toEqual({
      _id: 'test-project',
      index: 0,
      slug: 'test-project',
      image: 'https://test-image.url',
      alt: 'Test Alt',
      title: 'Test Project',
      viewProjectText: 'View Project',
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
        asset: { _type: 'reference', _ref: 'image-main-123' },
        alt: { ca: 'Main Image Alt' },
      },
      thumbnailImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: 'image-thumb-123' },
        alt: { ca: 'Thumbnail Alt' },
      },
    }

    const result = transformProject(mockProject, 2, 'ca', 'View Project')

    // Should use thumbnailImage and its alt text
    expect(result).toEqual({
      _id: 'test-project-2',
      index: 2,
      slug: 'test-project-2',
      image: 'https://test-image.url', // Our mocked URL (same for all images)
      alt: 'Thumbnail Alt',
      title: 'Test Project 2',
      viewProjectText: 'View Project',
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
        asset: { _type: 'reference', _ref: 'image-main-456' },
        alt: { ca: 'Main Image Alt' },
      },
      // No thumbnailImage provided
    }

    const result = transformProject(mockProject, 3, 'ca', 'View Project')

    // Should use mainImage and its alt text
    expect(result).toEqual({
      _id: 'test-project-3',
      index: 3,
      slug: 'test-project-3',
      image: 'https://test-image.url', // Our mocked URL
      alt: 'Main Image Alt',
      title: 'Test Project 3',
      viewProjectText: 'View Project',
    })
  })
})
