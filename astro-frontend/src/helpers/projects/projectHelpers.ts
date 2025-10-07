import type { Project, ImageWithResolvedAsset } from '@/lib/sanity/schemas/projectSchema'
import { getImageUrlFromAsset } from '@/helpers/images/imageUrlBuilder'

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
 * Get optimized image URL from Sanity image object
 * Now uses Sanity's image URL builder for automatic optimization
 * including WebP/AVIF format and quality settings
 */
export function getImageUrl(
  image: ImageWithResolvedAsset | null | undefined,
  width?: number,
  height?: number,
): string {
  if (!image?.asset) return ''
  return getImageUrlFromAsset(image, width, height)
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
