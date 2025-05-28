import type { Project } from '@/shared/schemas/sanity/projectSchema'
import { getSanityImageUrl } from '@/utils/shared/sanity'

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

  console.log(`Processing project at index ${index}:`, project._id, project.title)

  // Extract image reference from Sanity image object
  const imageRef = project.mainImage?.asset?._ref

  // Safely get localized string values with fallbacks
  const getLocalizedValue = (field: Record<string, string> | undefined, fallback: string = '') => {
    if (!field) return fallback
    return field[currentLang] || field.ca || fallback
  }

  // Safely get slug as a simple string
  const getSlug = (): string => {
    try {
      // Safely navigate the nested object structure
      // Check if project has a slug object with expected structure
      if (project.slug && typeof project.slug === 'object' && '_type' in project.slug) {
        // Treat the slug as our defined LocaleSlug type for type safety
        const slugObj = project.slug as LocaleSlug

        // Try the current language first, then fall back to Catalan
        const slugForLang =
          currentLang === 'ca'
            ? slugObj.ca
            : currentLang === 'es'
              ? slugObj.es
              : currentLang === 'en'
                ? slugObj.en
                : undefined

        // If we found a slug for the current language, use it
        if (slugForLang && typeof slugForLang.current === 'string') {
          return slugForLang.current
        }

        // Otherwise fall back to Catalan (which should always exist)
        if (slugObj.ca && typeof slugObj.ca.current === 'string') {
          return slugObj.ca.current
        }
      }
      // Fallback if no valid slug found
      return `project-${index}`
    } catch (error) {
      console.error('Error getting slug:', error instanceof Error ? error.message : String(error))
      return `project-${index}`
    }
  }

  // Safely get image URL
  const getImage = (): string | undefined => {
    try {
      return imageRef ? getSanityImageUrl(imageRef) : undefined
    } catch (error) {
      console.error('Error getting image:', error instanceof Error ? error.message : String(error))
      return undefined
    }
  }

  // Create a properly typed transformed project
  return {
    _id: project._id,
    index,
    slug: getSlug(), // Now a simple string
    image: getImage(),
    alt: project.mainImage?.alt
      ? getLocalizedValue(project.mainImage.alt)
      : getLocalizedValue(project.title),
    title: getLocalizedValue(project.title),
    viewProjectText: viewProjectTextValue,
  }
}
