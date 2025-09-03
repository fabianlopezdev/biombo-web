// src/shared/lib/sanity/queries/headerQueries.ts
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import { headerSchema, type Header } from '@/shared/schemas/sanity/headerSchema'

/**
 * Fetches the header configuration from Sanity for the specified language
 * @param locale - The language code to fetch the header for (defaults to 'ca')
 * @returns The header data or null if not found
 */
export async function fetchHeader(locale: string = 'ca'): Promise<Header | null> {
  console.log('DEBUG fetchHeader: Starting with locale:', locale)
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
      _t: Date.now()
    }
    console.log('DEBUG fetchHeader: Looking for document ID:', documentId)
    console.log('DEBUG fetchHeader: Query params:', params)

    const rawResult = await fetchSanityQuery({
      query,
      params,
      schema: null, // Temporarily bypass schema validation
    })
    console.log('DEBUG fetchHeader: Raw result navigationPages count:', rawResult?.navigationPages?.length)
    console.log('DEBUG fetchHeader: Raw navigationPages:', JSON.stringify(rawResult?.navigationPages, null, 2))
    
    let header = await fetchSanityQuery({
      query,
      params,
      schema: headerSchema,
    })
    console.log('DEBUG fetchHeader: After validation navigationPages count:', header?.navigationPages?.length)
    console.log('DEBUG fetchHeader: After validation navigationPages:', JSON.stringify(header?.navigationPages, null, 2))

    // If no header is found with the specified language, try falling back to Catalan
    if (!header && locale !== 'ca') {
      console.log(`No header found for ${documentId}, trying to fall back to header-ca`)
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
  } catch (error) {
    console.error('Failed to fetch header data:', error)
    return null
  }
}
