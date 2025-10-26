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
  // Media format (file type - can be image or video)
  // Note: featuredMedia is an array with max 1 item (Sanity hybrid type pattern)
  featuredMedia?: FileWithResolvedAsset[] | FileWithResolvedAsset | null
  otherMedia?: FileWithResolvedAsset[] | null
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
 * For images in file format, use the image URL builder for optimization
 */
export function getMediaUrl(media: FileWithResolvedAsset | null | undefined): string {
  if (!media?.asset) return ''

  // If it's an image file, use the image URL builder for optimization
  if (isImageFile(media)) {
    // Convert to image format and use image URL builder
    const imageData = {
      _type: 'image' as const,
      asset: media.asset,
    }
    return getImageUrlFromAsset(imageData)
  }

  // For videos, return direct URL
  return media.asset.url || ''
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
 * Handles both legacy 'file' type and new 'videoWithBackground' type
 */
export function isVideoFile(file: FileWithResolvedAsset | null | undefined): boolean {
  // Check if it's a videoWithBackground type or a file asset with video mimeType
  if (file?._type === 'videoWithBackground') return true
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
 * Determine media section layout for rendering
 */
export function getImageSectionLayout(section: MediaSection): MediaLayoutInfo {
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
    otherImages: [], // Empty - legacy format no longer supported
  }
}

/**
 * Alias for backward compatibility
 */
export const getMediaSectionLayout = getImageSectionLayout

/**
 * Get main media for the project hero
 */
export function getMainMedia(
  project: Project,
): FileWithResolvedAsset | ImageWithResolvedAsset | null {
  // Check mainMedia field (now an array with max 1 item)
  if (
    Array.isArray(project.mainMedia) &&
    project.mainMedia.length > 0 &&
    project.mainMedia[0]?.asset
  ) {
    return project.mainMedia[0]
  }
  // Handle legacy single field format
  if (project.mainMedia && !Array.isArray(project.mainMedia)) {
    const legacyMedia = project.mainMedia
    if (legacyMedia.asset) {
      return legacyMedia
    }
  }
  return null
}

/**
 * Get thumbnail media for project cards and listings
 */
export function getThumbnailMedia(
  project: Project,
): FileWithResolvedAsset | ImageWithResolvedAsset | null {
  // If using separate thumbnail
  if (project.useSeparateThumbnail) {
    // Check thumbnailMedia (now an array with max 1 item)
    if (
      Array.isArray(project.thumbnailMedia) &&
      project.thumbnailMedia.length > 0 &&
      project.thumbnailMedia[0]?.asset
    ) {
      return project.thumbnailMedia[0]
    }
    // Handle legacy single field format
    if (project.thumbnailMedia && !Array.isArray(project.thumbnailMedia)) {
      const legacyMedia = project.thumbnailMedia
      if (legacyMedia.asset) {
        return legacyMedia
      }
    }
  }
  // Fall back to main media
  return getMainMedia(project)
}

/**
 * Check if main media is a video
 */
export function isMainMediaVideo(project: Project): boolean {
  const mainMedia = getMainMedia(project)
  if (!mainMedia) return false

  // Check if it's a file type (new format) or videoWithBackground type
  if (
    '_type' in mainMedia &&
    (mainMedia._type === 'file' || mainMedia._type === 'videoWithBackground')
  ) {
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

  // Check if it's a file type (new format) or videoWithBackground type
  if (
    '_type' in thumbnailMedia &&
    (thumbnailMedia._type === 'file' || thumbnailMedia._type === 'videoWithBackground')
  ) {
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
