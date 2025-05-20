// src/shared/lib/sanity/queries/headerQueries.ts
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import { headerSchema, type Header } from '@/shared/schemas/sanity/headerSchema'

/**
 * Fetches the active header configuration from Sanity
 * @param slug - The slug of the header to fetch (defaults to 'global-header')
 * @returns The header data or null if not found
 */
export async function fetchHeader(slug = 'global-header'): Promise<Header | null> {
  try {
    const query = `*[_type == "header" && slug.current == $slug][0]`
    const params = { slug }

    const header = await fetchSanityQuery({
      query,
      params,
      schema: headerSchema,
    })

    return header
  } catch (error) {
    console.error('Failed to fetch header data:', error)
    return null
  }
}

/**
 * Fetches the active header configuration from Sanity
 * @returns The active header or null if not found
 */
export async function fetchActiveHeader(): Promise<Header | null> {
  try {
    const query = `*[_type == "header" && isActive == true][0]`

    const header = await fetchSanityQuery({
      query,
      schema: headerSchema,
    })

    return header
  } catch (error) {
    console.error('Failed to fetch active header data:', error)
    return null
  }
}
