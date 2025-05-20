// src/shared/lib/sanity/client.ts
import { sanityClient } from '@sanity/astro/client'
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
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    const data = await sanityClient.fetch(query, params)
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

    if (schema) {
      const validationResult = schema.safeParse(data)
      if (!validationResult.success) {
        console.error('Sanity data validation failed:', validationResult.error.flatten())

        const formErrors = validationResult.error.flatten().formErrors.join(', ')
        throw new Error(`Sanity data validation failed: ${formErrors}`)
      }
      return validationResult.data
    }

    return data
  } catch (error) {
    console.error('Error fetching data from Sanity:', error)
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
import { fetchSanityQuery } from '@/shared/lib/sanity/client';

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
