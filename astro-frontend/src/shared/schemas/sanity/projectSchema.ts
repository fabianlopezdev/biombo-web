// src/shared/schemas/sanity/projectSchema.ts
import { z } from 'zod'

// Define Zod schema for localized strings (consistent with other schemas)
const localeStringSchema = z
  .object({
    _type: z.literal('localeString'),
    ca: z.string().optional(),
    es: z.string().optional(),
    en: z.string().optional(),
  })
  .partial()

// Define schema for localized portable text (rich text)
const localePortableTextSchema = z.object({
  _type: z.literal('localePortableText'),
  // For each language, we expect an array of blocks (rich text)
  ca: z.array(z.any()).optional(),
  es: z.array(z.any()).optional(),
  en: z.array(z.any()).optional(),
})

// Schema for localized slugs
const localeSlugSchema = z.object({
  _type: z.literal('localeSlug'),
  ca: z.object({
    current: z.string(),
  }),
  es: z
    .object({
      current: z.string(),
    })
    .optional(),
  en: z
    .object({
      current: z.string(),
    })
    .optional(),
})

// Define Zod schema for image with alt text
const imageWithAltSchema = z.object({
  _type: z.literal('image'),
  asset: z.object({
    _ref: z.string(),
    _type: z.literal('reference'),
  }),
  // Make alt and caption optional in case some images don't have them yet
  alt: localeStringSchema.optional(),
  caption: localeStringSchema.optional(),
  // Include hotspot fields if your images use them
  hotspot: z
    .object({
      x: z.number(),
      y: z.number(),
      height: z.number(),
      width: z.number(),
    })
    .optional(),
})

// Schema for a single project
export const projectSchema = z.object({
  _id: z.string(),
  _type: z.literal('project'),
  _createdAt: z.string(),
  _updatedAt: z.string(),
  title: localeStringSchema,
  slug: localeSlugSchema,
  // featured and featuredOrder fields removed - we now manage featured projects through the homepage
  mainImage: imageWithAltSchema,
  excerpt: localePortableTextSchema.optional(),
  description: localePortableTextSchema.optional(),
  client: z.string().optional(),
  categories: z.array(z.string()).optional(),
  projectDate: z.string().optional(), // ISO date string from Sanity
  gallery: z.array(imageWithAltSchema).optional(),
})

// Schema for a list of projects
export const projectsSchema = z.array(projectSchema)

// Export TypeScript types derived from the Zod schemas
export type LocaleString = z.infer<typeof localeStringSchema>
export type LocalePortableText = z.infer<typeof localePortableTextSchema>
export type LocaleSlug = z.infer<typeof localeSlugSchema>
export type ImageWithAlt = z.infer<typeof imageWithAltSchema>
export type Project = z.infer<typeof projectSchema>
export type Projects = z.infer<typeof projectsSchema>
