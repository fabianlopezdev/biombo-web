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

// Define Zod schema for an image with an UNRESOLVED asset reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const imageWithAltSchema = z.object({
  _type: z.literal('image'),
  asset: z.object({
    _ref: z.string(), // This is for an unresolved reference
    _type: z.literal('reference'),
  }),
  alt: localeStringSchema.optional(),
  caption: localeStringSchema.optional(),
  hotspot: z
    .object({
      x: z.number(),
      y: z.number(),
      height: z.number(),
      width: z.number(),
    })
    .optional(),
})

// Define Zod schema for a resolved Sanity image asset (when asset-> is used in GROQ)
const resolvedSanityAssetSchema = z.object({
  _id: z.string(),
  _type: z.string(), // Typically 'sanity.imageAsset'
  url: z.string().url(),
  path: z.string().optional(),
  assetId: z.string().optional(),
  extension: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  // Add other fields from a resolved asset as needed, e.g., metadata, dimensions
  metadata: z
    .object({
      dimensions: z
        .object({
          width: z.number(),
          height: z.number(),
          aspectRatio: z.number(),
        })
        .optional(),
      // other metadata fields
    })
    .optional(),
})

// Define Zod schema for an image object that contains a RESOLVED asset
const imageWithResolvedAssetSchema = z.object({
  _type: z.literal('image'),
  asset: resolvedSanityAssetSchema, // Use the resolved asset schema here
  alt: localeStringSchema.optional(),
  caption: localeStringSchema.optional(),
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
  title: localeStringSchema, // Assuming title can also be a direct string based on logs
  slug: localeSlugSchema,
  mainImage: imageWithResolvedAssetSchema, // Use the schema with resolved asset
  thumbnailImage: imageWithResolvedAssetSchema.optional(), // Optional thumbnail, also with resolved asset
  excerpt: localePortableTextSchema.optional(),
  description: localePortableTextSchema.optional(),
  client: z.string().optional(),
  categories: z.array(z.string()).optional(),
  projectDate: z.string().optional(), // ISO date string from Sanity
  gallery: z.array(imageWithResolvedAssetSchema).optional(), // Gallery images also use resolved assets
})

// Schema for a list of projects
export const projectsSchema = z.array(projectSchema)

// Export TypeScript types derived from the Zod schemas
export type LocaleString = z.infer<typeof localeStringSchema>
export type LocalePortableText = z.infer<typeof localePortableTextSchema>
export type LocaleSlug = z.infer<typeof localeSlugSchema>
export type ResolvedSanityAsset = z.infer<typeof resolvedSanityAssetSchema>
export type ImageWithResolvedAsset = z.infer<typeof imageWithResolvedAssetSchema>
// Note: ImageWithAlt is no longer directly used by projectSchema if all images are resolved.
// If you still need ImageWithAlt for other purposes (e.g. unresolved image references), keep it.
// Otherwise, it could be removed or aliased if imageWithResolvedAssetSchema replaces its use cases.
export type ImageWithAlt = z.infer<typeof imageWithAltSchema> // Keeping for now, review if needed
export type Project = z.infer<typeof projectSchema>
export type Projects = z.infer<typeof projectsSchema>
