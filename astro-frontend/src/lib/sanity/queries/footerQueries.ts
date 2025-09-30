// src/shared/lib/sanity/queries/footerQueries.ts
import { fetchSanityQuery } from '@/lib/sanity/client'
import { footerSchema, type Footer } from '@/lib/sanity/schemas/footerSchema'

/**
 * Fetches the footer configuration from Sanity for the specified language
 * @param locale - The language code to fetch the footer for (defaults to 'ca')
 * @returns The footer data or null if not found
 */
export async function fetchFooter(locale: string = 'ca'): Promise<Footer | null> {
  try {
    // Fetch the footer document with the matching language
    const query = `*[_type == "footer" && language == $language][0]{
      ...,
      "socialLinks": socialLinks[] {
        platform,
        url
      }
    }`
    const params = { language: locale }

    let footer = await fetchSanityQuery({
      query,
      params,
      schema: footerSchema,
    })

    // If no footer is found with the specified language, try falling back to Catalan
    if (!footer && locale !== 'ca') {
      const fallbackQuery = `*[_type == "footer" && language == "ca"][0]{
        ...,
        "socialLinks": socialLinks[] {
          platform,
          url
        }
      }`

      footer = await fetchSanityQuery({
        query: fallbackQuery,
        schema: footerSchema,
      })
    }

    // If still no footer, try any footer as a last resort
    if (!footer) {
      const lastResortQuery = `*[_type == "footer"][0]{
        ...,
        "socialLinks": socialLinks[] {
          platform,
          url
        }
      }`

      footer = await fetchSanityQuery({
        query: lastResortQuery,
        schema: footerSchema,
      })
    }

    return footer
  } catch (error) {
    console.error('fetchFooter: Error fetching footer data:', error)
    return null
  }
}
