// src/shared/lib/sanity/queries/headerQueries.ts
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import { headerSchema, type Header } from '@/shared/schemas/sanity/headerSchema'

/**
 * Fetches the header configuration from Sanity for the specified language
 * @param locale - The language code to fetch the header for (defaults to 'ca')
 * @returns The header data or null if not found
 */
export async function fetchHeader(locale: string = 'ca'): Promise<Header | null> {
  try {
    // Fetch the header document with the matching language
    const query = `*[_type == "header" && language == $language][0]{
      ...,
      "navigationPages": navigationPages[] | order(order asc) {
        ...,
        pageReference->{
          _type,
          title,
          slug,
          language
        }
      }
    }`
    const params = { language: locale }

    let header = await fetchSanityQuery({
      query,
      params,
      schema: headerSchema,
    })

    // If no header is found with the specified language, try falling back to Catalan
    if (!header && locale !== 'ca') {
      // console.log(`No header found for language '${locale}', trying to fall back to Catalan`)
      const fallbackQuery = `*[_type == "header" && language == "ca"][0]{
        ...,
        "navigationPages": navigationPages[] | order(order asc) {
          ...,
          pageReference->{
            _type,
            title,
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

    // If still no header, try any header as a last resort
    if (!header) {
      // console.log('No header found for any specified language, trying to find any header document')
      const lastResortQuery = `*[_type == "header"][0]{
        ...,
        "navigationPages": navigationPages[] | order(order asc) {
          ...,
          pageReference->{
            _type,
            title,
            slug,
            language
          }
        }
      }`

      header = await fetchSanityQuery({
        query: lastResortQuery,
        schema: headerSchema,
      })
    }

    return header
  } catch (error) {
    console.error('Failed to fetch header data:', error)
    return null
  }
}
