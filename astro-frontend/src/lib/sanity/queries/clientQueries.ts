import { fetchSanityQuery } from '@/lib/sanity/client'
import { clientSchema, type Client } from '@/lib/sanity/schemas/clientSchema'
import { z } from 'zod'

// Define the fields we want to fetch for clients
const CLIENT_FIELDS = `
  _id,
  _type,
  name,
  website,
  logo {
    _type,
    asset-> {
      ...,
      metadata {
        ...,
        lqip
      }
    },
    hotspot { x, y, height, width },
    crop { top, bottom, left, right }
  },
  isFeatured,
  featuredOrder,
  orderRank
`

/**
 * Fetches all featured clients from Sanity
 * @returns Array of featured clients or empty array if none found
 */
export async function fetchFeaturedClients(): Promise<Client[]> {
  // Sort by featuredOrder first (if set), then by orderRank (drag-and-drop order), then by name
  const query = `*[_type == "client" && isFeatured == true] | order(
    coalesce(featuredOrder, 999999) asc,
    orderRank asc,
    name asc
  ) { ${CLIENT_FIELDS} }`

  try {
    const clients = await fetchSanityQuery({
      query,
      schema: z.array(clientSchema),
    })
    return clients || []
  } catch (error) {
    console.error('Error fetching featured clients:', error)
    // Fallback: try to fetch raw data without schema validation
    try {
      const rawData = await fetchSanityQuery({ query })
      if (!rawData || !Array.isArray(rawData)) {
        return []
      }
      return rawData as Client[]
    } catch {
      return []
    }
  }
}

/**
 * Fetches all clients from Sanity (featured and non-featured)
 * @returns Array of all clients or empty array if none found
 */
export async function fetchAllClients(): Promise<Client[]> {
  const query = `*[_type == "client"] | order(orderRank asc, name asc) { ${CLIENT_FIELDS} }`

  try {
    const clients = await fetchSanityQuery({
      query,
      schema: z.array(clientSchema),
    })
    return clients || []
  } catch (error) {
    console.error('Error fetching all clients:', error)
    return []
  }
}
