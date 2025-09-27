import type { FeaturedProjectItem } from '@/shared/schemas/sanity/homePageSchema'

/**
 * Type definition for a localized slug in Sanity
 */
type LocaleSlug = {
  _type: 'localeSlug'
  ca: { current: string }
  es?: { current: string }
  en?: { current: string }
}

/**
 * Interface for standardized project data in the UI
 */
export interface TransformedProject {
  _id?: string
  index: number
  slug: string
  image?: string
  alt?: string
  title: string
  clients?: string
  viewProjectText: string
  hoverColor?: string
  textHoverColor?: string
}

/**
 * Transforms a Sanity project to a standardized format for rendering in the homepage
 */
export function transformProject(
  featuredItem: FeaturedProjectItem | null | undefined,
  index: number,
  currentLang: string,
  viewProjectTextValue: string,
): TransformedProject {
  // Early return for invalid index
  if (typeof index !== 'number' || index < 0) {
    console.warn('[transformProject] Invalid index provided:', index)
    index = 0
  }

  // Validate language
  const validLangs = ['ca', 'es', 'en'] as const
  type ValidLang = (typeof validLangs)[number]
  const safeLang: ValidLang = validLangs.includes(currentLang as ValidLang)
    ? (currentLang as ValidLang)
    : 'ca'

  // Early return for missing or invalid featured item
  if (!featuredItem || typeof featuredItem !== 'object' || !featuredItem.project) {
    return {
      index,
      slug: '', // Empty slug for placeholders
      image: '',
      alt: '',
      title: '', // No title for placeholder
      viewProjectText: viewProjectTextValue || 'View project',
      hoverColor: undefined,
      textHoverColor: undefined,
    }
  }

  const projectDoc = featuredItem.project // Extract the actual project document

  // CRITICAL FIX: Extract image URL directly from asset.url if available
  let thumbnailUrl: string | undefined
  let mainImageUrl: string | undefined
  let chosenImageSource: 'thumbnail' | 'main' | undefined

  // Extract thumbnail URL if it exists
  if (projectDoc.thumbnailImage?.asset?.url) {
    thumbnailUrl = projectDoc.thumbnailImage.asset.url
  }

  // Extract main image URL if it exists
  if (projectDoc.mainImage?.asset?.url) {
    mainImageUrl = projectDoc.mainImage.asset.url
  }

  // IMAGE SELECTION FOR CARD DISPLAYS: Always prefer thumbnail if it exists
  // Thumbnail is for cards/grids, main image is for project detail pages
  // The useSeparateThumbnail flag is ONLY for Sanity UI, not for frontend display logic
  const imageUrlToUse = thumbnailUrl || mainImageUrl
  if (thumbnailUrl) {
    chosenImageSource = 'thumbnail'
  } else if (mainImageUrl) {
    chosenImageSource = 'main'
  }

  // For alt text, handle both localized and direct string values, prioritizing the chosen image source
  let imageAltText: Record<string, string> | string | undefined

  if (chosenImageSource === 'thumbnail' && projectDoc.thumbnailImage?.alt) {
    imageAltText = projectDoc.thumbnailImage.alt
  } else if (chosenImageSource === 'main' && projectDoc.mainImage?.alt) {
    imageAltText = projectDoc.mainImage.alt
  } else if (projectDoc.mainImage?.alt) {
    // Fallback to mainImage alt if thumbnail alt is missing but thumbnail URL was used
    imageAltText = projectDoc.mainImage.alt
  }

  // Helper: Handle both localized and direct string values
  const getLocalizedValue = (
    field: Record<string, string> | string | null | undefined,
    fallback = '',
  ): string => {
    // Early returns for edge cases
    if (!field) return fallback
    if (typeof field === 'string') return field
    if (typeof field !== 'object') return fallback

    // Try to get localized value
    const localizedValue = field[safeLang] || field.ca || Object.values(field)[0]
    return typeof localizedValue === 'string' ? localizedValue : fallback
  }

  // Helper: Handle both localized slug and simple slug structures
  const getSlug = (): string => {
    try {
      // Early return if no slug
      if (!projectDoc.slug) {
        return `project-${index}`
      }

      // Case 1: Direct slug with current property (simple structure from logs)
      if (typeof projectDoc.slug === 'object' && 'current' in projectDoc.slug) {
        const simpleSlug = projectDoc.slug as { current?: string }
        return simpleSlug.current || `project-${index}`
      }

      // Case 2: Localized slug structure as defined in our schema
      if (typeof projectDoc.slug === 'object' && '_type' in projectDoc.slug) {
        const typeField = projectDoc.slug as { _type?: string }
        if (typeField._type === 'localeSlug') {
          const slugObj = projectDoc.slug as LocaleSlug
          const langSlug =
            safeLang === 'ca'
              ? slugObj.ca
              : safeLang === 'es'
                ? slugObj.es
                : safeLang === 'en'
                  ? slugObj.en
                  : undefined

          if (langSlug?.current) return langSlug.current
          if (slugObj.ca?.current) return slugObj.ca.current
          if (slugObj.es?.current) return slugObj.es.current
          if (slugObj.en?.current) return slugObj.en.current
          // No valid slug found in LocaleSlug
        }
      }

      return `project-${index}`
    } catch (error) {
      console.error('[transformProject] Error getting slug:', error)
      return `project-${index}`
    }
  }

  // Helper: Get image URL
  const getImage = (): string | undefined => {
    // Direct URL is already resolved above
    return imageUrlToUse || undefined
  }

  // Helper: Extract title based on its actual structure
  const getTitle = (): string => {
    // Early return for missing title
    if (!projectDoc.title) return ''

    // Handle string title
    if (typeof projectDoc.title === 'string') {
      return projectDoc.title.trim()
    }

    // Handle localized title
    return getLocalizedValue(projectDoc.title, '')
  }

  // Create the transformed project with detailed logging
  const title = getTitle()
  const slug = getSlug()
  const image = getImage()
  const alt = imageAltText ? getLocalizedValue(imageAltText) : title // Use title as fallback for alt text

  // Extract client names safely
  const getClients = (): string | undefined => {
    if (!Array.isArray(projectDoc.clients) || projectDoc.clients.length === 0) {
      return undefined
    }

    try {
      const clientNames = projectDoc.clients
        .filter((client): client is { name: string } => {
          return client && typeof client === 'object' && typeof client.name === 'string'
        })
        .map((client) => client.name.trim())
        .filter(Boolean)

      return clientNames.length > 0 ? clientNames.join(', ') : undefined
    } catch (error) {
      console.error('[transformProject] Error extracting clients:', error)
      return undefined
    }
  }

  const clients = getClients()

  return {
    _id: projectDoc._id,
    index,
    slug,
    image,
    alt,
    title,
    clients,
    viewProjectText: viewProjectTextValue || 'View project',
    hoverColor: projectDoc.hoverColor?.hex,
    textHoverColor: projectDoc.textHoverColor?.hex,
  }
}
