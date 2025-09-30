/**
 * Utilities for handling blur hash (LQIP) from Sanity images
 */

/**
 * Sanity image asset interface
 */
interface SanityImageAsset {
  asset?: {
    metadata?: {
      lqip?: string
      dimensions?: {
        width: number
        height: number
        aspectRatio?: number
      }
    }
  }
  metadata?: {
    lqip?: string
    dimensions?: {
      width: number
      height: number
      aspectRatio?: number
    }
  }
  lqip?: string
}

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
export function getBlurHashStyles(image: SanityImageAsset): BlurHashStyles | null {
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
export function getBlurHashFromImage(image: SanityImageAsset): string | null {
  // Try multiple possible paths for LQIP
  return image?.asset?.metadata?.lqip || image?.metadata?.lqip || image?.lqip || null
}

/**
 * Check if an image has blur hash available
 * @param image - Sanity image object
 * @returns boolean indicating if blur hash is available
 */
export function hasBlurHash(image: SanityImageAsset): boolean {
  return getBlurHashFromImage(image) !== null
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
