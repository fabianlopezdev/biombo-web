import { describe, it, expect, vi } from 'vitest'
import { transformProject } from '@/utils/pages/homepage/projectsUtils'
import type { Project } from '@/shared/schemas/sanity/projectSchema'

// Mock getSanityImageUrl to return a test URL
vi.mock('@/utils/shared/sanity', () => ({
  getSanityImageUrl: () => 'https://test-image.url',
}))

describe('Projects component utils', () => {
  it('should transform project data correctly', () => {
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
})
