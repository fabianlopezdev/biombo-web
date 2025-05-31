import type { Project } from '@/shared/schemas/sanity/projectSchema'

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
  project: Project | null,
  index: number,
  currentLang: string,
  viewProjectTextValue: string,
): TransformedProject {
  // If we don't have a project (or not enough projects), use placeholder data
  if (!project) {
    console.log(`Creating placeholder for project at index ${index}`)
    return {
      index,
      slug: ``, // Simple string slug for placeholders
      image: '',
      alt: ``,
      title: ``,
      viewProjectText: viewProjectTextValue || 'View project',
    }
  }

  console.log(`Processing project at index ${index}:`, project._id)

  // Enhanced debugging for key project fields
  console.log(`DEBUG data structure - Project ${index} with ID: ${project._id}:`)
  console.log(
    `  Title:`,
    typeof project.title === 'string' ? project.title : JSON.stringify(project.title),
  )
  console.log(`  Slug:`, project.slug ? JSON.stringify(project.slug) : 'undefined')
  console.log(`  MainImage:`, project.mainImage ? JSON.stringify(project.mainImage) : 'undefined')
  console.log(
    `  ThumbnailImage:`,
    project.thumbnailImage ? JSON.stringify(project.thumbnailImage) : 'undefined',
  )

  // CRITICAL FIX: Extract image URL directly from asset.url if available
  let thumbnailUrl: string | undefined
  let mainImageUrl: string | undefined
  let chosenImageSource: 'thumbnail' | 'main' | undefined

  if (project.thumbnailImage?.asset?.url) {
    thumbnailUrl = project.thumbnailImage.asset.url
    console.log(`DEBUG: Found thumbnailUrl for project ${index}: ${thumbnailUrl}`)
  } else {
    console.log(
      `DEBUG: thumbnailUrl not found or asset.url missing for project ${index}. ThumbnailData:`,
      project.thumbnailImage,
    )
  }

  if (project.mainImage?.asset?.url) {
    mainImageUrl = project.mainImage.asset.url
    console.log(`DEBUG: Found mainImageUrl for project ${index}: ${mainImageUrl}`)
  } else {
    console.log(
      `DEBUG: mainImageUrl not found or asset.url missing for project ${index}. MainImageData:`,
      project.mainImage,
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

  if (chosenImageSource === 'thumbnail' && project.thumbnailImage?.alt) {
    imageAltText = project.thumbnailImage.alt
  } else if (chosenImageSource === 'main' && project.mainImage?.alt) {
    imageAltText = project.mainImage.alt
  } else if (project.mainImage?.alt) {
    // Fallback to mainImage alt if thumbnail alt is missing but thumbnail URL was used
    imageAltText = project.mainImage.alt
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
      if (!project.slug) {
        console.warn(
          `WARN: Slug is undefined for project ${index}, falling back to project-${index}`,
        )
        return `project-${index}`
      }

      // Case 1: Direct slug with current property (simple structure from logs)
      if (typeof project.slug === 'object' && 'current' in project.slug) {
        const simpleSlug = project.slug as { current?: string }
        if (!simpleSlug.current) {
          console.warn(
            `WARN: simpleSlug.current is undefined for project ${index}, slug data:`,
            project.slug,
          )
        }
        return simpleSlug.current || `project-${index}`
      }

      // Case 2: Localized slug structure as defined in our schema
      if (typeof project.slug === 'object' && '_type' in project.slug) {
        const typeField = project.slug as { _type?: string }
        if (typeField._type === 'localeSlug') {
          const slugObj = project.slug as LocaleSlug
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
            project.slug,
          )
        }
      }

      console.warn(
        `WARN: Unrecognized slug structure for project ${index}, falling back. Slug data:`,
        project.slug,
      )
      return `project-${index}`
    } catch (error) {
      console.error(
        `Error getting slug for project ${index}:`,
        error instanceof Error ? error.message : String(error),
        project.slug,
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
    if (typeof project.title === 'string') return project.title
    return getLocalizedValue(project.title)
  }

  // Create the transformed project with detailed logging
  const title = getTitle()
  const slug = getSlug()
  const image = getImage()
  const alt = imageAltText ? getLocalizedValue(imageAltText) : title // Use title as fallback for alt text

  const result = {
    _id: project._id,
    index,
    slug,
    image,
    alt,
    title,
    viewProjectText: viewProjectTextValue,
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
