import type { Project, ImageWithResolvedAsset } from '@/shared/schemas/sanity/projectSchema'

export interface ImageLayoutInfo {
  totalImages: number
  hasFeatured: boolean
  otherImages: ImageWithResolvedAsset[]
}

interface ImageSection {
  _type: 'imageSection'
  _key: string
  featuredImage?: ImageWithResolvedAsset | null
  otherImages?: ImageWithResolvedAsset[] | null
}

/**
 * Get similar projects based on shared services
 */
export function getSimilarProjects(
  currentProject: Project,
  allProjects: Project[],
  limit: number = 4,
): Project[] {
  const currentServiceIds = new Set(currentProject.services?.map((s) => s._id) || [])

  if (currentServiceIds.size === 0) {
    return allProjects.filter((p) => p._id !== currentProject._id).slice(0, limit)
  }

  const projectsWithScore = allProjects
    .filter((p) => p._id !== currentProject._id)
    .map((project) => {
      const sharedCount =
        project.services?.filter((service) => currentServiceIds.has(service._id)).length || 0

      return { project, sharedCount }
    })
    .filter((item) => item.sharedCount > 0)

  projectsWithScore.sort((a, b) => {
    if (a.sharedCount !== b.sharedCount) {
      return b.sharedCount - a.sharedCount
    }
    return a.project.title.localeCompare(b.project.title)
  })

  return projectsWithScore.slice(0, limit).map((item) => item.project)
}

/**
 * Get image URL from Sanity image object
 */
export function getImageUrl(image: ImageWithResolvedAsset | null | undefined): string {
  if (!image?.asset) return ''
  return image.asset.url || ''
}

/**
 * Determine image section layout for rendering
 */
export function getImageSectionLayout(section: ImageSection): ImageLayoutInfo {
  const hasFeatured = !!section.featuredImage?.asset
  const otherCount = section.otherImages?.length || 0
  const totalImages = (hasFeatured ? 1 : 0) + otherCount

  return {
    totalImages,
    hasFeatured,
    otherImages: section.otherImages || [],
  }
}

/**
 * Get project URL based on slug and locale
 */
export function getProjectUrl(slug: string, locale: string): string {
  switch (locale) {
    case 'ca':
      return `/projectes/${slug}`
    case 'en':
      return `/en/projects/${slug}`
    case 'es':
      return `/es/proyectos/${slug}`
    default:
      return `/projectes/${slug}`
  }
}
