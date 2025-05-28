// src/shared/lib/sanity/queries/siteSettingsQueries.ts
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import { siteSettingsSchema, type SiteSettings } from '@/shared/schemas/sanity/siteSettingsSchema'

/**
 * Fetches the site settings from Sanity
 * @returns The site settings or null if not found
 */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    // Query for the single siteSettings document with explicit field selection
    const query = `*[_type == "siteSettings"][0]{
      _id,
      _type,
      _createdAt,
      _updatedAt,
      primaryColor,
      secondaryColor
    }`

    // Try fetching without schema validation first as a fallback
    const rawData = await fetchSanityQuery({
      query,
    })

    if (!rawData) {
      return null
    }

    // Now try with schema validation
    try {
      const siteSettings = await fetchSanityQuery({
        query,
        schema: siteSettingsSchema,
      })
      return siteSettings
    } catch (error) {
      console.error('Schema validation failed for site settings:', error)
      return rawData as SiteSettings // Return raw data as fallback
    }
  } catch (error) {
    console.error('Failed to fetch site settings data:', error)
    return null
  }
}

/**
 * Helper function to extract the hex color value from a Sanity color object
 * @param color The Sanity color object
 * @param fallback Fallback color to use if the color object is invalid
 * @returns The hex color value
 */
export function getHexColor(color: unknown, fallback: string): string {
  if (color && typeof color === 'object' && 'hex' in color && typeof color.hex === 'string') {
    return color.hex
  }
  return fallback
}
