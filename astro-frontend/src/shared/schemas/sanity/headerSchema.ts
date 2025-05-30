// src/shared/schemas/sanity/headerSchema.ts
import { z } from 'zod'

// Valid language codes for the application
const languageCodes = ['ca', 'es', 'en'] as const
type LanguageCode = (typeof languageCodes)[number]

// Define schema for a page reference - updated for new i18n structure
const pageReferenceSchema = z
  .object({
    _type: z.string(), // Make this flexible for different page types
    _ref: z.string().optional(), // Reference ID
    // Include referenced page data that will be expanded by GROQ
    title: z.string().nullable().optional(), // Allow null or undefined
    _key: z.string().nullable().optional(), // Allow null or undefined
  })
  .passthrough() // Allow additional fields for debugging

// Define schema for a navigation page - updated to match the new i18n structure
const navigationPageSchema = z.object({
  _key: z.string(),
  _type: z.string(), // Accept any string as _type since it might not match our expected value
  title: z.string(), // Now a simple string in the new schema
  // Page reference - link to internal pages
  pageReference: pageReferenceSchema.optional(),
  isExternal: z.boolean().optional().default(false),
  // External URL for external links
  externalUrl: z.string().url().optional().nullable(),
})

// Define the header schema matching the updated Sanity i18n schema
export const headerSchema = z
  .object({
    _id: z.string(),
    _type: z.literal('header'),
    // Language field for i18n
    language: z.enum(languageCodes),
    // Navigation pages array
    navigationPages: z.array(navigationPageSchema).optional(),
  })
  .passthrough() // Allow extra fields while debugging

// Define types based on the schemas
export type NavigationPage = z.infer<typeof navigationPageSchema>
export type Header = z.infer<typeof headerSchema> & {
  navigationPages?: NavigationPage[]
  language: LanguageCode
}

// Schema for an array of headers (useful for debugging)
export const headersSchema = z.array(headerSchema)
export type Headers = z.infer<typeof headersSchema>
