// src/shared/schemas/sanity/headerSchema.ts
import { z } from 'zod'

// Define Zod schema for localized strings (same as in pageSchema)
const localeStringSchema = z
  .object({
    ca: z.string().optional(),
    es: z.string().optional(),
    en: z.string().optional(),
  })
  .partial()

// Define a Zod schema for localized slugs that exactly matches the Sanity structure
const localeSlugSchema = z.object({
  _type: z.literal('localeSlug'),
  ca: z.object({
    _type: z.literal('slug'),
    current: z.string(),
  }),
  en: z.object({
    _type: z.literal('slug'),
    current: z.string(),
  }),
  es: z.object({
    _type: z.literal('slug'),
    current: z.string(),
  }),
})

// Define schema for a page reference
const pageReferenceSchema = z
  .object({
    _type: z.string(), // Make this more flexible
    _ref: z.string().optional(), // Make this optional
    // Include referenced page data that will be expanded by GROQ
    title: z.string().optional(),
    _key: z.string().nullable().optional(), // Allow null or undefined
  })
  .passthrough() // Allow additional fields for debugging

// Define schema for a navigation page - updated to match actual Sanity structure
const navigationPageSchema = z.object({
  _key: z.string(),
  // Accept any string as _type since it might not match our expected value
  _type: z.string(),
  // Accept either a string title or a localized object
  title: z.union([z.string(), localeStringSchema]),
  // Accept either a page reference or a slug
  pageReference: pageReferenceSchema.optional(),
  // Make slug optional since we now use pageReference
  slug: z
    .union([
      z.object({
        _type: z.literal('slug'),
        current: z.string(),
      }),
      localeSlugSchema,
    ])
    .optional(),
  isExternal: z.boolean().optional().default(false),
  // Make externalUrl nullable since Sanity returns null rather than undefined
  externalUrl: z.string().url().optional().nullable(),
})

// Define the header schema matching the updated Sanity schema
// Make it more flexible to help debug validation issues
export const headerSchema = z
  .object({
    _id: z.string(),
    _type: z.literal('header'),
    // Include slug since we're using it in queries
    slug: z.object({
      _type: z.literal('slug'),
      current: z.string(),
    }),
    // Support either navigationPages or navigationItems
    navigationPages: z.array(navigationPageSchema).optional(),
    navigationItems: z.array(navigationPageSchema).optional(),
  })
  .passthrough() // Allow extra fields while debugging

// Define types based on the schemas
export type NavigationPage = z.infer<typeof navigationPageSchema>
export type Header = z.infer<typeof headerSchema> & {
  navigationPages?: NavigationPage[]
  navigationItems?: NavigationPage[]
}

// Schema for an array of headers
export const headersSchema = z.array(headerSchema)
export type Headers = z.infer<typeof headersSchema>
