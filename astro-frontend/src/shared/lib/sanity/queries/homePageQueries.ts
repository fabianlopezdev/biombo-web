// src/shared/lib/sanity/queries/homePageQueries.ts
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import { homePageSchema, type HomePage } from '@/shared/schemas/sanity/homePageSchema'

/**
 * Fetches the homepage data from Sanity
 * @returns The homepage data or null if not found
 */
export async function fetchHomePage(): Promise<HomePage | null> {
  try {
    // Query for the single homePage document
    const query = `*[_type == "homePage"][0]`
    console.log('Fetching with query:', query)

    // Try fetching without schema validation first to see the raw data
    const rawData = await fetchSanityQuery({
      query,
    })
    console.log('Raw Sanity data for homePage:', rawData)

    if (!rawData) {
      console.log('No homePage document found in Sanity')
      return null
    }

    // Now try with the schema validation
    try {
      console.log('Attempting schema validation with schema:', homePageSchema)
      const homePage = await fetchSanityQuery({
        query,
        schema: homePageSchema,
      })
      console.log('Schema validation succeeded, returning homepage data')
      return homePage
    } catch (error) {
      console.error('Schema validation failed:', error)
      return rawData as HomePage // Return the raw data as a fallback
    }
  } catch (error) {
    console.error('Failed to fetch home page data:', error)
    return null
  }
}

/**
 * Fetches the homepage data with a specific locale's content prioritized
 * @param locale - The locale to prioritize (defaults to 'ca')
 * @returns The homepage data or null if not found
 */
export async function fetchHomePageByLocale(
  locale: 'ca' | 'es' | 'en' = 'ca',
): Promise<HomePage | null> {
  try {
    const homePage = await fetchHomePage()

    if (!homePage) {
      return null
    }

    // Here you could implement additional locale-specific processing if needed
    // For now, we just return the raw data as the Zod schema already handles the structure

    return homePage
  } catch (error) {
    console.error(`Failed to fetch home page data for locale ${locale}:`, error)
    return null
  }
}
