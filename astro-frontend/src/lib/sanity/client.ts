// src/shared/lib/sanity/client.ts
import { sanityClient } from 'sanity:client'
import type { ZodSchema } from 'zod'

/**
 * Fetches data from Sanity and optionally validates it against a Zod schema.
 * @param options - The query, parameters, and optional Zod schema.
 * @returns The fetched data, validated if a schema is provided.
 * @throws Error if fetching fails or Zod validation fails.
 */
// Overload for when schema is provided
export async function fetchSanityQuery<S extends ZodSchema>(options: {
  query: string
  params?: Record<string, unknown>
  schema: S
}): Promise<S['_output']>
// Overload for when schema is NOT provided
export async function fetchSanityQuery(options: {
  query: string
  params?: Record<string, unknown>
  schema?: undefined
}): Promise<unknown>

// Implementation
export async function fetchSanityQuery<S extends ZodSchema>(
  options: { query: string; params?: Record<string, unknown>; schema?: S },
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
): Promise<S['_output'] | unknown> {
  const { query, params = {}, schema } = options

  try {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    const data = await sanityClient.fetch(query, params)
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */

    // If no schema provided, return raw data
    if (!schema) {
      return data
    }

    const validationResult = schema.safeParse(data)
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format()
      throw new Error(`Sanity data validation failed: ${JSON.stringify(formattedErrors, null, 2)}`)
    }
    return validationResult.data

    // This code is unreachable due to the returns above, but kept for type safety
    return data
  } catch (error) {
    // It's good practice to throw a more specific error or handle it appropriately
    if (error instanceof Error && error.message.startsWith('Sanity data validation failed')) {
      throw error // Re-throw Zod validation error
    }
    throw new Error(
      `Failed to fetch data from Sanity: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

// Example Usage (will be in another file, e.g., a page or component):
/*
import { z } from 'zod';
import { fetchSanityQuery } from '@/lib/sanity/client';

const pageSchema = z.object({
  title: z.string(),
  // ... other fields
});

async function getPageData(slug: string) {
  const query = `*[_type == "page" && slug.current == $slug][0]`;
  const params = { slug };
  return fetchSanityQuery({ query, params, schema: pageSchema });
}
*/
