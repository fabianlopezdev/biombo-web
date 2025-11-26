import { fetchSanityQuery } from '@/lib/sanity/client'
import { contactPageSchema, type ContactPage } from '@/lib/sanity/schemas/contactPageSchema'

// Define common fields to select for the contact page
const CONTACT_PAGE_FIELDS = `
  _id,
  _type,
  _createdAt,
  _updatedAt,
  language,
  title,
  email,
  phone,
  formSection {
    _type,
    formTitle,
    formFields[] {
      _key,
      fieldType,
      label,
      placeholder,
      required
    },
    submitButtonText
  },
  metaTitle,
  metaDescription
`

/**
 * Fetches the contact page data for a specific locale by targeting its unique document ID.
 * @param locale - The locale to fetch ('ca', 'es', 'en'). Defaults to 'ca'.
 * @returns The contact page data or null if not found or on error.
 */
export async function fetchContactPageByLocale(
  locale: 'ca' | 'es' | 'en' = 'ca',
): Promise<ContactPage | null> {
  let documentId: string
  switch (locale) {
    case 'es':
      documentId = 'contactPage-es'
      break
    case 'en':
      documentId = 'contactPage-en'
      break
    case 'ca':
    default:
      documentId = 'contactPage-ca'
      break
  }

  const query = `*[_id == $documentId][0]{ ${CONTACT_PAGE_FIELDS} }`
  const params = { documentId }

  try {
    // Attempt to fetch and validate with Zod schema
    const contactPage = await fetchSanityQuery({
      query,
      params,
      schema: contactPageSchema,
    })
    return contactPage
  } catch (error) {
    console.error('Error fetching contact page:', error)
    // Fallback: try to fetch raw data without schema validation
    try {
      const rawData = await fetchSanityQuery({
        query,
        params,
      })
      if (!rawData) {
        return null
      }
      return rawData as ContactPage
    } catch {
      return null
    }
  }
}

/**
 * Fetches the primary (Catalan) contact page data from Sanity.
 * This is an alias for fetchContactPageByLocale('ca').
 * @returns The Catalan contact page data or null if not found.
 */
export async function fetchContactPage(): Promise<ContactPage | null> {
  return fetchContactPageByLocale('ca')
}
