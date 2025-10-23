import type {
  Project,
  ImageWithResolvedAsset,
  FileWithResolvedAsset,
} from '@/lib/sanity/schemas/projectSchema'
import { getImageUrlFromAsset } from '@/helpers/images/imageUrlBuilder'

export interface MediaLayoutInfo {
  totalMedia: number
  hasFeatured: boolean
  otherMedia: FileWithResolvedAsset[]
  // Legacy support
  otherImages: ImageWithResolvedAsset[]
}

interface MediaSection {
  _type: 'imageSection'
  _key: string
  // New media format (file type - can be image or video)
  // Note: featuredMedia is an array with max 1 item (Sanity hybrid type pattern)
  featuredMedia?: FileWithResolvedAsset[] | FileWithResolvedAsset | null
  otherMedia?: FileWithResolvedAsset[] | null
  // Legacy image format
  featuredImage?: ImageWithResolvedAsset | null
  otherImages?: ImageWithResolvedAsset[] | null
}

// Type alias for backward compatibility
export type ImageLayoutInfo = MediaLayoutInfo
export type ImageSection = MediaSection

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
 * Get media URL from Sanity file object (works for both images and videos)
 */
export function getMediaUrl(media: FileWithResolvedAsset | null | undefined): string {
  if (!media?.asset?.url) return ''
  return media.asset.url
}

/**
 * Type guard to check if a file is an image (based on asset._type or mimeType)
 */
export function isImageFile(file: FileWithResolvedAsset | null | undefined): boolean {
  // Check for image asset type (legacy or new image uploads)
  if (file?.asset?._type === 'sanity.imageAsset') {
    return true
  }
  // Check for file asset with image mimeType
  if (file?.asset?._type === 'sanity.fileAsset' && file?.asset?.mimeType?.startsWith('image/')) {
    return true
  }
  return false
}

/**
 * Type guard to check if a file is a video (based on asset._type and mimeType)
 */
export function isVideoFile(file: FileWithResolvedAsset | null | undefined): boolean {
  // Only file assets with video mimeType are videos
  return file?.asset?._type === 'sanity.fileAsset' && file?.asset?.mimeType?.startsWith('video/')
}

/**
 * Type guard to check if a file is an image (based on mimeType)
 */
export function isImageMimeType(file: FileWithResolvedAsset | null | undefined): boolean {
  return file?.asset?.mimeType?.startsWith('image/') ?? false
}

/**
 * Type guard to check if a file is a video (based on mimeType)
 */
export function isVideoMimeType(file: FileWithResolvedAsset | null | undefined): boolean {
  return file?.asset?.mimeType?.startsWith('video/') ?? false
}

/**
 * Determine media section layout for rendering (supports both new file format and legacy image format)
 */
export function getImageSectionLayout(section: MediaSection): MediaLayoutInfo {
  // Check for new media format first (file type)
  if (section.featuredMedia || section.otherMedia) {
    // FeaturedMedia is now an array with max 1 item
    let hasFeatured = false
    if (Array.isArray(section.featuredMedia)) {
      hasFeatured = section.featuredMedia.length > 0 && !!section.featuredMedia[0]?.asset
    } else {
      // Handle legacy single field format
      const legacyMedia = section.featuredMedia as
        | FileWithResolvedAsset
        | ImageWithResolvedAsset
        | undefined
      hasFeatured = !!legacyMedia?.asset
    }

    const otherCount = section.otherMedia?.length || 0
    const totalMedia = (hasFeatured ? 1 : 0) + otherCount

    return {
      totalMedia,
      hasFeatured,
      otherMedia: section.otherMedia || [],
      otherImages: [], // Empty for new format
    }
  }

  // Fall back to legacy image format
  const hasFeatured = !!section.featuredImage?.asset
  const otherCount = section.otherImages?.length || 0
  const totalMedia = (hasFeatured ? 1 : 0) + otherCount

  return {
    totalMedia,
    hasFeatured,
    otherMedia: [], // Empty for legacy format
    otherImages: section.otherImages || [],
  }
}

/**
 * Alias for backward compatibility
 */
export const getMediaSectionLayout = getImageSectionLayout

/**
 * Get main media (new format) or fall back to main image (legacy)
 * Returns the media that should be displayed for the project hero
 */
export function getMainMedia(
  project: Project,
): FileWithResolvedAsset | ImageWithResolvedAsset | null {
  // Check new mainMedia field first (now an array with max 1 item)
  if (
    Array.isArray(project.mainMedia) &&
    project.mainMedia.length > 0 &&
    project.mainMedia[0]?.asset
  ) {
    return project.mainMedia[0]
  }
  // Handle legacy single field format
  if (project.mainMedia && !Array.isArray(project.mainMedia)) {
    const legacyMedia = project.mainMedia as FileWithResolvedAsset | ImageWithResolvedAsset
    if (legacyMedia.asset) {
      return legacyMedia
    }
  }
  // Fall back to legacy mainImage
  if (project.mainImage?.asset) {
    return project.mainImage
  }
  return null
}

/**
 * Get thumbnail media (new format) or fall back to thumbnail/main image (legacy)
 * Returns the media that should be displayed for project thumbnails
 */
export function getThumbnailMedia(
  project: Project,
): FileWithResolvedAsset | ImageWithResolvedAsset | null {
  // If using separate thumbnail
  if (project.useSeparateThumbnail) {
    // Check new thumbnailMedia first (now an array with max 1 item)
    if (
      Array.isArray(project.thumbnailMedia) &&
      project.thumbnailMedia.length > 0 &&
      project.thumbnailMedia[0]?.asset
    ) {
      return project.thumbnailMedia[0]
    }
    // Handle legacy single field format
    if (project.thumbnailMedia && !Array.isArray(project.thumbnailMedia)) {
      const legacyMedia = project.thumbnailMedia as FileWithResolvedAsset | ImageWithResolvedAsset
      if (legacyMedia.asset) {
        return legacyMedia
      }
    }
    // Fall back to legacy thumbnailImage
    if (project.thumbnailImage?.asset) {
      return project.thumbnailImage
    }
  }
  // Fall back to main media/image
  return getMainMedia(project)
}

/**
 * Check if main media is a video
 */
export function isMainMediaVideo(project: Project): boolean {
  const mainMedia = getMainMedia(project)
  if (!mainMedia) return false

  // Check if it's a file type (new format)
  if ('_type' in mainMedia && mainMedia._type === 'file') {
    return isVideoFile(mainMedia)
  }
  return false
}

/**
 * Check if thumbnail media is a video
 */
export function isThumbnailMediaVideo(project: Project): boolean {
  const thumbnailMedia = getThumbnailMedia(project)
  if (!thumbnailMedia) return false

  // Check if it's a file type (new format)
  if ('_type' in thumbnailMedia && thumbnailMedia._type === 'file') {
    return isVideoFile(thumbnailMedia)
  }
  return false
}

/**
 * Get URL for main media (works for both images and videos)
 */
export function getMainMediaUrl(project: Project): string {
  const mainMedia = getMainMedia(project)
  if (!mainMedia) return ''

  // If it's a file type, use getMediaUrl
  if ('_type' in mainMedia && mainMedia._type === 'file') {
    return getMediaUrl(mainMedia)
  }
  // If it's an image type, use getImageUrl
  return getImageUrl(mainMedia)
}

/**
 * Get URL for thumbnail media (works for both images and videos)
 */
export function getThumbnailMediaUrl(project: Project): string {
  const thumbnailMedia = getThumbnailMedia(project)
  if (!thumbnailMedia) return ''

  // If it's a file type, use getMediaUrl
  if ('_type' in thumbnailMedia && thumbnailMedia._type === 'file') {
    return getMediaUrl(thumbnailMedia)
  }
  // If it's an image type, use getImageUrl
  return getImageUrl(thumbnailMedia)
}
