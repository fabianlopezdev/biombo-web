// src/shared/lib/sanity/queries/headerQueries.ts
import { fetchSanityQuery } from '@/lib/sanity/client'
import { headerSchema, type Header } from '@/lib/sanity/schemas/headerSchema'

/**
 * Fetches the header configuration from Sanity for the specified language
 * @param locale - The language code to fetch the header for (defaults to 'ca')
 * @returns The header data or null if not found
 */
export async function fetchHeader(locale: string = 'ca'): Promise<Header | null> {
  try {
    // Fetch the header document using the correct document ID pattern
    // This ensures we get header-ca, header-es, header-en instead of old documents
    const documentId = `header-${locale}`
    const query = `*[_id == $documentId][0]{
      ...,
      "navigationPages": navigationPages[] | order(order asc) {
        ...,
        pageReference->{
          _type,
          slug,
          language
        }
      }
    }`
    const params = {
      documentId,
      // Add timestamp to bypass any CDN cache
      _t: Date.now(),
    }

    // Temporarily bypass schema validation for debugging
    // const rawResult = await fetchSanityQuery({
    //   query,
    //   params,
    //   schema: null,
    // })

    let header = await fetchSanityQuery({
      query,
      params,
      schema: headerSchema,
    })

    // If no header is found with the specified language, try falling back to Catalan
    if (!header && locale !== 'ca') {
      const fallbackQuery = `*[_id == "header-ca"][0]{
        ...,
        "navigationPages": navigationPages[] | order(order asc) {
          ...,
          pageReference->{
            _type,
            slug,
            language
          }
        }
      }`

      header = await fetchSanityQuery({
        query: fallbackQuery,
        schema: headerSchema,
      })
    }

    // Removed the last resort query to prevent fetching wrong documents

    return header
  } catch {
    return null
  }
}
