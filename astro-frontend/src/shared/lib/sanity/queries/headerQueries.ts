// src/shared/lib/sanity/queries/headerQueries.ts
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import { headerSchema, type Header } from '@/shared/schemas/sanity/headerSchema'

/**
 * Fetches the header configuration from Sanity
 * @param slug - The slug of the header to fetch (defaults to 'header')
 * @returns The header data or null if not found
 */
export async function fetchHeader(slug = 'header'): Promise<Header | null> {
  try {
    // First try with the provided slug
    const query = `*[_type == "header" && slug.current == $slug][0]{
      ...,
      "navigationPages": navigationPages[]{
        ...
      }
    }`
    const params = { slug }

    let header = await fetchSanityQuery({
      query,
      params,
      schema: headerSchema,
    })

    // If not found, try to get any header document
    if (!header) {
      console.log('No header found with slug:', slug)
      console.log('Trying to fetch any header document...')

      const fallbackQuery = `*[_type == "header"][0]{
        ...,
        "navigationPages": navigationPages[]{
          ...
        }
      }`
      header = await fetchSanityQuery({
        query: fallbackQuery,
        schema: headerSchema,
      })

      // Log the raw data for debugging
      if (header) {
        console.log('Raw header data received:', JSON.stringify(header, null, 2))
      }

      if (header) {
        console.log('Found a header with id:', header?._id)
        // Since we don't know the exact structure, use a safer log approach
        console.log('Header data structure:', JSON.stringify(header, null, 2))
      } else {
        console.log('No header documents found at all')
      }
    }

    return header
  } catch (error) {
    console.error('Failed to fetch header data:', error)
    return null
  }
}
