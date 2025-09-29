/**
 * Utilities for handling blur hash (LQIP) from Sanity images
 */

export interface BlurHashStyles {
  backgroundImage: string
  backgroundSize: string
  backgroundPosition: string
  filter?: string
}

/**
 * Extract blur hash styles from a Sanity image object
 * @param image - Sanity image object with asset metadata
 * @returns Blur hash background styles or null if no LQIP available
 */
export function getBlurHashStyles(image: any): BlurHashStyles | null {
  // Check for LQIP in the asset metadata
  const lqip = image?.asset?.metadata?.lqip || image?.metadata?.lqip

  if (!lqip) {
    return null
  }

  return {
    backgroundImage: `url(${lqip})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(5px) brightness(1.05)', // Slight blur and brightness for better effect
  }
}

/**
 * Generate inline style string from blur hash styles
 * @param styles - Blur hash styles object
 * @returns CSS inline style string
 */
export function getBlurHashStyleString(styles: BlurHashStyles | null): string {
  if (!styles) return ''

  return Object.entries(styles)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case for CSS
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}: ${value}`
    })
    .join('; ')
}

/**
 * Get blur hash from various image object structures
 * @param image - Image object from Sanity
 * @returns LQIP string or null
 */
export function getBlurHashFromImage(image: any): string | null {
  // Try multiple possible paths for LQIP
  return (
    image?.asset?.metadata?.lqip ||
    image?.metadata?.lqip ||
    image?.lqip ||
    null
  )
}

/**
 * Check if an image has blur hash available
 * @param image - Sanity image object
 * @returns boolean indicating if blur hash is available
 */
export function hasBlurHash(image: any): boolean {
  return getBlurHashFromImage(image) !== null
}

/**
 * Get image dimensions from Sanity image object
 * @param image - Sanity image object
 * @returns Object with width, height, and aspectRatio or null
 */
export function getImageDimensions(image: any): {
  width: number
  height: number
  aspectRatio: number
} | null {
  const dimensions =
    image?.asset?.metadata?.dimensions ||
    image?.metadata?.dimensions ||
    null

  if (!dimensions || !dimensions.width || !dimensions.height) {
    return null
  }

  return {
    width: dimensions.width,
    height: dimensions.height,
    aspectRatio: dimensions.aspectRatio || dimensions.width / dimensions.height,
  }
}

/**
 * Create a wrapper div style for blur placeholder
 * @param aspectRatio - Optional aspect ratio for the container
 * @returns Style object for the wrapper
 */
export function getBlurWrapperStyles(aspectRatio?: number): Record<string, string> {
  const styles: Record<string, string> = {
    position: 'relative',
    overflow: 'hidden',
  }

  if (aspectRatio) {
    styles.aspectRatio = aspectRatio.toString()
  }

  return styles
}