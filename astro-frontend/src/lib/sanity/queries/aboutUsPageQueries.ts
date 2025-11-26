// src/shared/lib/sanity/queries/aboutUsPageQueries.ts
import { fetchSanityQuery } from '@/lib/sanity/client'
import { aboutUsPageSchema, type AboutUsPage } from '@/lib/sanity/schemas/aboutUsPageSchema'

// Define common fields to select for the about us page to ensure consistency
const ABOUT_US_PAGE_FIELDS = `
  _id,
  _type,
  _createdAt,
  _updatedAt,
  language,
  title,
  description[]{
    ...,
    markDefs[]{
      ...,
      _type == 'link' => {
        "href": @.href,
        "blank": @.blank
      }
    }
  },
  aboutSlider {
    _type,
    title,
    description[]{
      ...,
      markDefs[]{
        ...,
        _type == 'link' => {
          "href": @.href,
          "blank": @.blank
        }
      }
    },
    images[]{
      _key,
      _type,
      alt,
      hotspot { x, y, height, width },
      crop { top, bottom, left, right },
      asset-> {
        ...,
        metadata {
          ...,
          lqip
        }
      }
    }
  },
  clientsTitle,
  metaTitle,
  metaDescription
`

/**
 * Fetches the about us page data for a specific locale by targeting its unique document ID.
 * @param locale - The locale to fetch ('ca', 'es', 'en'). Defaults to 'ca'.
 * @returns The about us page data or null if not found or on error.
 */
export async function fetchAboutUsPageByLocale(
  locale: 'ca' | 'es' | 'en' = 'ca',
): Promise<AboutUsPage | null> {
  let documentId: string
  switch (locale) {
    case 'es':
      documentId = 'aboutUsPage-es'
      break
    case 'en':
      documentId = 'aboutUsPage-en'
      break
    case 'ca':
    default:
      documentId = 'aboutUsPage-ca' // Primary locale uses aboutUsPage-ca
      break
  }

  const query = `*[_id == $documentId][0]{ ${ABOUT_US_PAGE_FIELDS} }`
  const params = { documentId }

  console.log('🔍 [About Us Query] Document ID:', documentId)
  console.log('🔍 [About Us Query] Full query:', query)
  console.log('🔍 [About Us Query] Params:', params)

  try {
    // Attempt to fetch and validate with Zod schema
    const aboutUsPage = await fetchSanityQuery({
      query,
      params,
      schema: aboutUsPageSchema,
    })
    console.log('✅ [About Us Query] Data fetched successfully:', aboutUsPage)
    return aboutUsPage
  } catch (error) {
    console.error('❌ [About Us Query] Schema validation failed:', error)
    // Log schema validation failure and attempt to fetch raw data as a fallback
    // This can be useful during development if schema and data are temporarily misaligned
    try {
      const rawData = await fetchSanityQuery({
        query,
        params,
      })
      console.log('⚠️ [About Us Query] Raw data (schema validation failed):', rawData)
      if (!rawData) {
        console.log('❌ [About Us Query] No raw data found')
        return null
      }
      return rawData as AboutUsPage // Cast to AboutUsPage, acknowledging potential mismatch
    } catch (fallbackError) {
      console.error('❌ [About Us Query] Fallback also failed:', fallbackError)
      return null
    }
  }
}

/**
 * Fetches the primary (Catalan) about us page data from Sanity.
 * This is an alias for fetchAboutUsPageByLocale('ca').
 * @returns The Catalan about us page data or null if not found.
 */
export async function fetchAboutUsPage(): Promise<AboutUsPage | null> {
  return fetchAboutUsPageByLocale('ca')
}
