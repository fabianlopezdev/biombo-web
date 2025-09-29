/**
 * Converts a Sanity image reference to a fully qualified URL
 * @param imageRef The Sanity image reference (_ref value from asset field)
 * @returns URL to the image or a placeholder if no image is available
 */
export function getSanityImageUrl(imageRef: string | null | undefined): string {
  // Early return for falsy values
  if (!imageRef || typeof imageRef !== 'string') {
    return '/images/placeholder-project.png'
  }

  // Validate environment variable
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string | undefined
  if (!projectId || typeof projectId !== 'string') {
    console.error('[getSanityImageUrl] Missing PUBLIC_SANITY_PROJECT_ID environment variable')
    return '/images/placeholder-project.png'
  }

  try {
    // Extract file extension and format properly
    const cleanRef = imageRef.replace('image-', '')

    // Handle different image formats with a more robust approach
    let formattedRef = cleanRef
    const formats = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

    // Check if extension is already present
    const hasExtension = formats.some((ext) => cleanRef.endsWith(ext))

    if (!hasExtension) {
      // Add extension based on the format indicator in the ref
      if (cleanRef.includes('-jpg')) formattedRef = cleanRef.replace('-jpg', '.jpg')
      else if (cleanRef.includes('-jpeg')) formattedRef = cleanRef.replace('-jpeg', '.jpeg')
      else if (cleanRef.includes('-png')) formattedRef = cleanRef.replace('-png', '.png')
      else if (cleanRef.includes('-webp')) formattedRef = cleanRef.replace('-webp', '.webp')
      else if (cleanRef.includes('-gif')) formattedRef = cleanRef.replace('-gif', '.gif')
      else if (cleanRef.includes('-svg')) formattedRef = cleanRef.replace('-svg', '.svg')
      else {
        // Default to jpg if no format indicator found
        console.warn(`[getSanityImageUrl] Unknown image format for ref: ${imageRef}`)
        formattedRef = `${cleanRef}.jpg`
      }
    }

    return `https://cdn.sanity.io/images/${projectId}/production/${formattedRef}`
  } catch (error) {
    console.error('[getSanityImageUrl] Error processing image reference:', error)
    return '/images/placeholder-project.png'
  }
}
