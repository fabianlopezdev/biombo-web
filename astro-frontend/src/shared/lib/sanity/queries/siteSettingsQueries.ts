// src/shared/lib/sanity/queries/siteSettingsQueries.ts
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import { siteSettingsSchema, type SiteSettings } from '@/shared/schemas/sanity/siteSettingsSchema'

/**
 * Interface for site colors returned by fetchSiteSettings
 */
export interface SiteColors {
  primaryColor: string
  secondaryColor: string
  rawSettings: SiteSettings | null
}

/**
 * Fetches the site settings from Sanity
 * @returns Object with primaryColor and secondaryColor as hex strings
 */
export async function fetchSiteSettings(): Promise<SiteColors> {
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
      return {
        primaryColor: '#f2f2f2', // Default light color
        secondaryColor: '#191919', // Default dark color
        rawSettings: null,
      }
    }

    // Now try with schema validation
    try {
      const siteSettings = await fetchSanityQuery({
        query,
        schema: siteSettingsSchema,
      })

      return {
        primaryColor: getHexColor(siteSettings.primaryColor, '#f2f2f2'),
        secondaryColor: getHexColor(siteSettings.secondaryColor, '#191919'),
        rawSettings: siteSettings,
      }
    } catch {
      // Extract colors from raw data as fallback with type assertion
      const typedRawData = rawData as Record<string, unknown>
      return {
        primaryColor: getHexColor(typedRawData.primaryColor, '#f2f2f2'),
        secondaryColor: getHexColor(typedRawData.secondaryColor, '#191919'),
        rawSettings: rawData as SiteSettings,
      }
    }
  } catch {
    return {
      primaryColor: '#f2f2f2', // Default light color
      secondaryColor: '#191919', // Default dark color
      rawSettings: null,
    }
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
