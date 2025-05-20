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

// Define schema for a navigation item
const navigationItemSchema = z.object({
  _key: z.string(),
  _type: z.literal('navigationItem'),
  title: localeStringSchema,
  slug: z.object({
    _type: z.literal('slug').optional(),
    current: z.string(),
  }),
  isExternal: z.boolean().optional().default(false),
  externalUrl: z.string().url().optional(),
})

// Define the header schema
export const headerSchema = z.object({
  _id: z.string(),
  _type: z.literal('header'),
  title: z.string(),
  navigationItems: z.array(navigationItemSchema).optional(),
  isActive: z.boolean().optional(),
})

// Define types based on the schemas
export type NavigationItem = z.infer<typeof navigationItemSchema>
export type Header = z.infer<typeof headerSchema>

// Schema for an array of headers
export const headersSchema = z.array(headerSchema)
export type Headers = z.infer<typeof headersSchema>
