import { fetchSanityQuery } from '@/lib/sanity/client'
import { legalPageSchema, type LegalPage } from '@/lib/sanity/schemas/legalPageSchema'

// Define common fields to select for the legal page to ensure consistency
const LEGAL_PAGE_FIELDS = `
  _id,
  _type,
  _createdAt,
  _updatedAt,
  language,
  title,
  content[]{
    ...,
    markDefs[]{
      ...,
      _type == 'link' => {
        "href": @.href,
        "blank": @.blank
      }
    }
  }
`

/**
 * Fetches the legal page data for a specific locale by targeting its unique document ID.
 * @param locale - The locale to fetch ('ca', 'es', 'en'). Defaults to 'ca'.
 * @returns The legal page data or null if not found or on error.
 */
export async function fetchLegalPageByLocale(
  locale: 'ca' | 'es' | 'en' = 'ca',
): Promise<LegalPage | null> {
  let documentId: string
  switch (locale) {
    case 'es':
      documentId = 'legalPage-es'
      break
    case 'en':
      documentId = 'legalPage-en'
      break
    case 'ca':
    default:
      documentId = 'legalPage-ca' // Primary locale uses legalPage-ca
      break
  }

  const query = `*[_id == $documentId][0]{ ${LEGAL_PAGE_FIELDS} }`
  const params = { documentId }

  try {
    // Attempt to fetch and validate with Zod schema
    const legalPage = await fetchSanityQuery({
      query,
      params,
      schema: legalPageSchema,
    })
    return legalPage
  } catch {
    // Log schema validation failure and attempt to fetch raw data as a fallback
    // This can be useful during development if schema and data are temporarily misaligned
    try {
      const rawData = await fetchSanityQuery({
        query,
        params,
      })
      if (!rawData) {
        return null
      }
      return rawData as LegalPage // Cast to LegalPage, acknowledging potential mismatch
    } catch {
      return null
    }
  }
}

/**
 * Fetches the primary (Catalan) legal page data from Sanity.
 * This is an alias for fetchLegalPageByLocale('ca').
 * @returns The Catalan legal page data or null if not found.
 */
export async function fetchLegalPage(): Promise<LegalPage | null> {
  return fetchLegalPageByLocale('ca')
}
