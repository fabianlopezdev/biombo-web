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

// Define schema for a navigation page
const navigationPageSchema = z.object({
  _key: z.string(),
  _type: z.literal('NavigationPage'),
  title: localeStringSchema,
  slug: localeSlugSchema,
  isExternal: z.boolean().optional().default(false),
  // Make externalUrl nullable since Sanity returns null rather than undefined
  externalUrl: z.string().url().optional().nullable(),
})

// Define the header schema matching the updated Sanity schema
export const headerSchema = z.object({
  _id: z.string(),
  _type: z.literal('header'),
  // We only use navigationPages now
  navigationPages: z.array(navigationPageSchema).optional(),
})

// Define types based on the schemas
export type NavigationPage = z.infer<typeof navigationPageSchema>
export type Header = z.infer<typeof headerSchema> & {
  navigationPages?: NavigationPage[]
}

// Schema for an array of headers
export const headersSchema = z.array(headerSchema)
export type Headers = z.infer<typeof headersSchema>
