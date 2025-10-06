/**
 * Sanity Image URL Builder
 * Uses @sanity/image-url to generate optimized image URLs from Sanity CDN
 * with automatic format optimization (WebP/AVIF) and responsive sizing
 */

import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from 'sanity:client'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

// Type definitions for Sanity image metadata
interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
}

interface ImageMetadata {
  dimensions: ImageDimensions
  lqip?: string
  palette?: unknown
  hasAlpha?: boolean
  isOpaque?: boolean
}

interface ImageAsset {
  _ref?: string
  _type?: string
  metadata?: ImageMetadata
}

interface SanityImageWithMetadata {
  asset: ImageAsset
  hotspot?: unknown
  crop?: unknown
}

// Initialize the builder with Sanity client
const builder = imageUrlBuilder(sanityClient)

/**
 * Generate an optimized image URL from a Sanity image source
 * @param source - Sanity image object or asset reference
 * @returns Image URL builder instance
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

/**
 * Get an optimized image URL with default settings
 * Automatically applies format optimization and quality settings
 * @param source - Sanity image object
 * @param options - Optional width, height, and quality settings
 * @returns Optimized image URL string
 */
export function getOptimizedImageUrl(
  source: SanityImageSource,
  options?: {
    width?: number
    height?: number
    quality?: number
    fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min'
  },
): string {
  let imageBuilder = urlFor(source).auto('format')

  if (options?.width) {
    imageBuilder = imageBuilder.width(options.width)
  }

  if (options?.height) {
    imageBuilder = imageBuilder.height(options.height)
  }

  if (options?.quality) {
    imageBuilder = imageBuilder.quality(options.quality)
  } else {
    // Default quality for good balance between size and visual quality
    imageBuilder = imageBuilder.quality(80)
  }

  if (options?.fit) {
    imageBuilder = imageBuilder.fit(options.fit)
  }

  return imageBuilder.url()
}

/**
 * Generate responsive image URLs for srcset
 * Uses fit=max to prevent upscaling images smaller than requested size
 * @param source - Sanity image object
 * @param widths - Array of widths for responsive images
 * @param quality - Image quality (default: 80)
 * @returns Array of URL and width pairs
 */
export function getResponsiveImageUrls(
  source: SanityImageSource,
  widths: number[] = [640, 1024, 1536, 2048, 2560],
  quality: number = 80,
): Array<{ url: string; width: number }> {
  return widths.map((width) => ({
    url: urlFor(source).auto('format').width(width).fit('max').quality(quality).url(),
    width,
  }))
}

/**
 * Generate srcset string from responsive URLs
 * Automatically filters out widths larger than the original image to prevent
 * browser from selecting unnecessarily large sizes when Sanity returns the same file
 * @param source - Sanity image object
 * @param widths - Array of widths for responsive images
 * @param quality - Image quality (default: 80)
 * @returns srcset attribute string
 */
export function getSrcSetString(
  source: SanityImageSource,
  widths: number[] = [640, 1024, 1536, 2048, 2560],
  quality: number = 80,
): string {
  // Get original image width from metadata
  let originalWidth: number | null = null

  // Type guard to check if source has metadata structure
  if (
    typeof source === 'object' &&
    source !== null &&
    'asset' in source &&
    source.asset &&
    typeof source.asset === 'object' &&
    'metadata' in source.asset
  ) {
    // Now we can safely cast to our interface
    const imageWithMetadata = source as SanityImageWithMetadata
    originalWidth = imageWithMetadata.asset.metadata?.dimensions?.width ?? null
  }

  // Filter out widths larger than original image
  // This prevents browser from selecting larger sizes when Sanity returns the same file
  const filteredWidths = originalWidth ? widths.filter((w) => w <= originalWidth) : widths

  // Always include at least one width option
  const finalWidths = filteredWidths.length > 0 ? filteredWidths : [widths[widths.length - 1]]

  const urls = getResponsiveImageUrls(source, finalWidths, quality)
  return urls.map(({ url, width }) => `${url} ${width}w`).join(', ')
}

/**
 * Get a thumbnail image URL with optimized settings
 * @param source - Sanity image object
 * @param size - Thumbnail size (default: 300)
 * @returns Optimized thumbnail URL
 */
export function getThumbnailUrl(source: SanityImageSource, size: number = 300): string {
  return urlFor(source).auto('format').width(size).height(size).fit('crop').quality(80).url()
}

/**
 * Get optimized image URL from Sanity image object (including hotspot/crop)
 * This respects the editor's crop and hotspot settings
 * @param image - Full Sanity image object with asset reference
 * @param width - Optional width
 * @param height - Optional height
 * @returns Optimized image URL or empty string if no image
 */
export function getImageUrlFromAsset(
  image: SanityImageSource | null | undefined,
  width?: number,
  height?: number,
): string {
  if (!image || typeof image !== 'object' || !('asset' in image)) return ''

  return getOptimizedImageUrl(image, { width, height })
}

/**
 * Predefined responsive widths for different image contexts
 */
export const RESPONSIVE_WIDTHS = {
  hero: [1024, 1536, 2048, 2560, 3840], // Large hero images
  fullWidth: [1024, 1536, 2048, 2560], // Full-width content images
  card: [400, 640, 800, 1024, 1280], // Project cards, thumbnails
  thumbnail: [200, 300, 400], // Small thumbnails
  default: [640, 1024, 1536, 2048, 2560], // General purpose
} as const

/**
 * Predefined sizes attributes for different image contexts
 */
export const SIZES_ATTRIBUTES = {
  hero: '100vw', // Full viewport width
  fullWidth: '100vw', // Full viewport width
  card: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw', // Responsive grid
  thumbnail: '(max-width: 768px) 25vw, 15vw', // Small thumbnails
  default: '100vw', // Default to full viewport
} as const
