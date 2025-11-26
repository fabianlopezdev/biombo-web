import { fetchSanityQuery } from '@/lib/sanity/client'
import { projectsPageSchema, type ProjectsPage } from '@/lib/sanity/schemas/projectsPageSchema'

// Define common fields to select for the projects page to ensure consistency
const PROJECTS_PAGE_FIELDS = `
  _id,
  _type,
  _createdAt,
  _updatedAt,
  language,
  title,
  metaTitle,
  metaDescription
`

/**
 * Fetches the projects page data for a specific locale by targeting its unique document ID.
 * @param locale - The locale to fetch ('ca', 'es', 'en'). Defaults to 'ca'.
 * @returns The projects page data or null if not found or on error.
 */
export async function fetchProjectsPageByLocale(
  locale: 'ca' | 'es' | 'en' = 'ca',
): Promise<ProjectsPage | null> {
  let documentId: string
  switch (locale) {
    case 'es':
      documentId = 'projectsPage-es'
      break
    case 'en':
      documentId = 'projectsPage-en'
      break
    case 'ca':
    default:
      documentId = 'projectsPage-ca'
      break
  }

  const query = `*[_id == $documentId][0]{ ${PROJECTS_PAGE_FIELDS} }`
  const params = { documentId }

  console.log('🔍 [Projects Page Query] Document ID:', documentId)
  console.log('🔍 [Projects Page Query] Full query:', query)
  console.log('🔍 [Projects Page Query] Params:', params)

  try {
    const projectsPage = await fetchSanityQuery({
      query,
      params,
      schema: projectsPageSchema,
    })
    console.log('✅ [Projects Page Query] Data fetched successfully:', projectsPage)
    return projectsPage
  } catch (error) {
    console.error('❌ [Projects Page Query] Error fetching projects page:', error)
    // Fallback: try to fetch raw data without schema validation
    try {
      const rawData = await fetchSanityQuery({
        query,
        params,
      })
      console.log('⚠️ [Projects Page Query] Raw data (schema validation failed):', rawData)
      if (!rawData) {
        console.log('❌ [Projects Page Query] No raw data found')
        return null
      }
      return rawData as ProjectsPage
    } catch (fallbackError) {
      console.error('❌ [Projects Page Query] Fallback also failed:', fallbackError)
      return null
    }
  }
}
