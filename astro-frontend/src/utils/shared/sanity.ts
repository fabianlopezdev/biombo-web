/**
 * Converts a Sanity image reference to a fully qualified URL
 * @param imageRef The Sanity image reference (_ref value from asset field)
 * @returns URL to the image or a placeholder if no image is available
 */
export function getSanityImageUrl(imageRef: string): string {
  if (!imageRef) return '/images/placeholder-project.png' // Return placeholder if no image
  return `https://cdn.sanity.io/images/${import.meta.env.PUBLIC_SANITY_PROJECT_ID}/production/${imageRef.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`
}
