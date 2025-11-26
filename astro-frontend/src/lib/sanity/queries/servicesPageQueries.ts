import { fetchSanityQuery } from '@/lib/sanity/client'
import { servicesPageSchema, type ServicesPage } from '@/lib/sanity/schemas/servicesPageSchema'

// Define common fields to select for the services page to ensure consistency
const SERVICES_PAGE_FIELDS = `
  _id,
  _type,
  _createdAt,
  _updatedAt,
  language,
  title,
  description,
  "selectedServices": selectedServices[]-> {
    _id,
    _type,
    language,
    title,
    slug,
    description
  },
  metaTitle,
  metaDescription
`

/**
 * Fetches the services page data for a specific locale by targeting its unique document ID.
 * @param locale - The locale to fetch ('ca', 'es', 'en'). Defaults to 'ca'.
 * @returns The services page data or null if not found or on error.
 */
export async function fetchServicesPageByLocale(
  locale: 'ca' | 'es' | 'en' = 'ca',
): Promise<ServicesPage | null> {
  let documentId: string
  switch (locale) {
    case 'es':
      documentId = 'servicesPage-es'
      break
    case 'en':
      documentId = 'servicesPage-en'
      break
    case 'ca':
    default:
      documentId = 'servicesPage-ca'
      break
  }

  const query = `*[_id == $documentId][0]{ ${SERVICES_PAGE_FIELDS} }`
  const params = { documentId }

  console.log('🔍 [Services Query] Document ID:', documentId)
  console.log('🔍 [Services Query] Full query:', query)
  console.log('🔍 [Services Query] Params:', params)

  try {
    const servicesPage = await fetchSanityQuery({
      query,
      params,
      schema: servicesPageSchema,
    })
    console.log('✅ [Services Query] Data fetched successfully:', servicesPage)
    return servicesPage
  } catch (error) {
    console.error('❌ [Services Query] Error fetching services page:', error)
    // Fallback: try to fetch raw data without schema validation
    try {
      const rawData = await fetchSanityQuery({
        query,
        params,
      })
      console.log('⚠️ [Services Query] Raw data (schema validation failed):', rawData)
      if (!rawData) {
        console.log('❌ [Services Query] No raw data found')
        return null
      }
      return rawData as ServicesPage
    } catch (fallbackError) {
      console.error('❌ [Services Query] Fallback also failed:', fallbackError)
      return null
    }
  }
}
