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
  viewProjectText: string
  hoverColor?: string
  textHoverColor?: string
}

/**
 * Transforms a Sanity project to a standardized format for rendering in the homepage
 * @param project The Sanity project data or null for placeholder
 * @param index The index position of the project
 * @param currentLang The current language code
 * @param viewProjectTextValue The text to show for viewing projects
 * @returns Transformed project data ready for UI rendering
 */
export function transformProject(
  featuredItem: FeaturedProjectItem | null,
  index: number,
  currentLang: string,
  viewProjectTextValue: string,
): TransformedProject {
  // If we don't have a featured item (or not enough projects), use placeholder data
  if (!featuredItem || !featuredItem.project) {
    console.log(`Creating placeholder for project at index ${index}`)
    return {
      index,
      slug: ``, // Simple string slug for placeholders
      image: '',
      alt: ``,
      title: ``, // No title for placeholder
      viewProjectText: viewProjectTextValue || 'View project',
      hoverColor: undefined, // No specific hover color for placeholder
      textHoverColor: undefined, // No specific text hover color for placeholder
    }
  }

  const projectDoc = featuredItem.project // Extract the actual project document

  console.log(`Processing project at index ${index}:`, projectDoc._id)

  // Enhanced debugging for key project fields
  console.log(`DEBUG data structure - Project ${index} with ID: ${projectDoc._id}:`)
  console.log(
    `  Title:`,
    typeof projectDoc.title === 'string' ? projectDoc.title : JSON.stringify(projectDoc.title),
  )
  console.log(`  Slug:`, projectDoc.slug ? JSON.stringify(projectDoc.slug) : 'undefined')
  console.log(
    `  MainImage:`,
    projectDoc.mainImage ? JSON.stringify(projectDoc.mainImage) : 'undefined',
  )
  console.log(
    `  ThumbnailImage:`,
    projectDoc.thumbnailImage ? JSON.stringify(projectDoc.thumbnailImage) : 'undefined',
  )

  // CRITICAL FIX: Extract image URL directly from asset.url if available
  let thumbnailUrl: string | undefined
  let mainImageUrl: string | undefined
  let chosenImageSource: 'thumbnail' | 'main' | undefined

  if (projectDoc.thumbnailImage?.asset?.url) {
    thumbnailUrl = projectDoc.thumbnailImage.asset.url
    console.log(`DEBUG: Found thumbnailUrl for project ${index}: ${thumbnailUrl}`)
  } else {
    console.log(
      `DEBUG: thumbnailUrl not found or asset.url missing for project ${index}. ThumbnailData:`,
      projectDoc.thumbnailImage,
    )
  }

  if (projectDoc.mainImage?.asset?.url) {
    mainImageUrl = projectDoc.mainImage.asset.url
    console.log(`DEBUG: Found mainImageUrl for project ${index}: ${mainImageUrl}`)
  } else {
    console.log(
      `DEBUG: mainImageUrl not found or asset.url missing for project ${index}. MainImageData:`,
      projectDoc.mainImage,
    )
  }

  // Use thumbnailImage if available, otherwise use mainImage
  const imageUrlToUse = thumbnailUrl || mainImageUrl
  if (thumbnailUrl) {
    chosenImageSource = 'thumbnail'
  } else if (mainImageUrl) {
    chosenImageSource = 'main'
  }
  console.log(
    `DEBUG: Final imageUrlToUse for project ${index}:`,
    imageUrlToUse || 'undefined',
    `(Source: ${chosenImageSource || 'none'})`,
  )

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

  // ENHANCE: Handle both localized and direct string values for alt text and title
  const getLocalizedValue = (
    field: Record<string, string> | string | undefined,
    fallback: string = '',
  ) => {
    if (!field) return fallback
    if (typeof field === 'string') return field
    return field[currentLang] || field.ca || Object.values(field)[0] || fallback
  }

  // ENHANCE: Handle both localized slug and simple slug structures
  const getSlug = (): string => {
    try {
      if (!projectDoc.slug) {
        console.warn(
          `WARN: Slug is undefined for project ${index}, falling back to project-${index}`,
        )
        return `project-${index}`
      }

      // Case 1: Direct slug with current property (simple structure from logs)
      if (typeof projectDoc.slug === 'object' && 'current' in projectDoc.slug) {
        const simpleSlug = projectDoc.slug as { current?: string }
        if (!simpleSlug.current) {
          console.warn(
            `WARN: simpleSlug.current is undefined for project ${index}, slug data:`,
            projectDoc.slug,
          )
        }
        return simpleSlug.current || `project-${index}`
      }

      // Case 2: Localized slug structure as defined in our schema
      if (typeof projectDoc.slug === 'object' && '_type' in projectDoc.slug) {
        const typeField = projectDoc.slug as { _type?: string }
        if (typeField._type === 'localeSlug') {
          const slugObj = projectDoc.slug as LocaleSlug
          const langSlug =
            currentLang === 'ca'
              ? slugObj.ca
              : currentLang === 'es'
                ? slugObj.es
                : currentLang === 'en'
                  ? slugObj.en
                  : undefined

          if (langSlug?.current) return langSlug.current
          if (slugObj.ca?.current) return slugObj.ca.current
          if (slugObj.es?.current) return slugObj.es.current
          if (slugObj.en?.current) return slugObj.en.current
          console.warn(
            `WARN: No valid slug found in LocaleSlug for project ${index}, slug data:`,
            projectDoc.slug,
          )
        }
      }

      console.warn(
        `WARN: Unrecognized slug structure for project ${index}, falling back. Slug data:`,
        projectDoc.slug,
      )
      return `project-${index}`
    } catch (error) {
      console.error(
        `Error getting slug for project ${index}:`,
        error instanceof Error ? error.message : String(error),
        projectDoc.slug,
      )
      return `project-${index}`
    }
  }

  // CRITICAL FIX: Directly use the resolved imageUrlToUse
  const getImage = (): string | undefined => {
    if (!imageUrlToUse) {
      console.log(`DEBUG: No imageUrlToUse (from asset.url) found for project ${index}`)
      return undefined
    }
    // No need to call getSanityImageUrl if we have the direct URL
    console.log(`DEBUG: Using direct imageUrlToUse for project ${index}:`, imageUrlToUse)
    return imageUrlToUse
  }

  // Extract title based on its actual structure
  const getTitle = (): string => {
    if (!projectDoc.title) return '' // Handle cases where title might be undefined
    if (typeof projectDoc.title === 'string') return projectDoc.title
    return getLocalizedValue(projectDoc.title)
  }

  // Create the transformed project with detailed logging
  const title = getTitle()
  const slug = getSlug()
  const image = getImage()
  const alt = imageAltText ? getLocalizedValue(imageAltText) : title // Use title as fallback for alt text

  const result: TransformedProject = {
    _id: projectDoc._id,
    index,
    slug,
    image,
    alt,
    title,
    viewProjectText: viewProjectTextValue,
    hoverColor: featuredItem.hoverColor?.hex,
    textHoverColor: featuredItem.textHoverColor?.hex,
  }

  console.log(`DEBUG: Final transformed project ${index}:`, {
    _id: result._id,
    title: result.title,
    slug: result.slug,
    hasImage: !!result.image,
    imageUrl: result.image, // Add imageUrl to final log for clarity
  })

  return result
}
