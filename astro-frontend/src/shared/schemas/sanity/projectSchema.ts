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

// Import PortableTextBlock type from homePageSchema
import type { PortableTextBlock } from './homePageSchema'

// Define types for localized portable text and slugs
export type LocalePortableText = {
  _type: 'localePortableText'
  ca?: PortableTextBlock[]
  es?: PortableTextBlock[]
  en?: PortableTextBlock[]
}

export type LocaleSlug = {
  _type: 'localeSlug'
  ca: { current: string }
  es?: { current: string }
  en?: { current: string }
}

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
    .nullable()
    .optional(),
})

// Schema for text block content section
const textBlockSchema = z.object({
  _type: z.literal('textBlock'),
  _key: z.string(),
  text: z.array(z.any()).nullable().optional(), // Portable text blocks
})

// Schema for image section content
const imageSectionSchema = z.object({
  _type: z.literal('imageSection'),
  _key: z.string(),
  featuredImage: imageWithResolvedAssetSchema.nullable().optional(),
  otherImages: z.array(imageWithResolvedAssetSchema).nullable().optional(),
})

// Combined content section schema
const contentSectionSchema = z.union([textBlockSchema, imageSectionSchema])

// Schema for a single project
export const projectSchema = z.object({
  _id: z.string(),
  _type: z.literal('project'),
  _createdAt: z.string(),
  _updatedAt: z.string(),
  language: z.string().optional(), // Added language field
  title: z.string(), // Changed from localeStringSchema
  slug: z.object({ _type: z.literal('slug'), current: z.string() }), // Changed from localeSlugSchema
  mainImage: imageWithResolvedAssetSchema, // Use the schema with resolved asset
  thumbnailImage: imageWithResolvedAssetSchema.nullable().optional(), // Added nullable
  useSeparateThumbnail: z.boolean().nullable().optional(), // Added useSeparateThumbnail field
  excerpt: z.array(z.any()).nullable().optional(), // Added nullable
  description: z.array(z.any()).nullable().optional(), // Added nullable
  mainText: z.array(z.any()).nullable().optional(), // Added mainText field
  contentSections: z.array(contentSectionSchema).nullable().optional(), // Added contentSections field
  hoverColor: z.object({ hex: z.string() }).nullable().optional(), // Added hover color
  textHoverColor: z.object({ hex: z.string() }).nullable().optional(), // Added text hover color
  clients: z
    .array(
      z.object({
        _id: z.string(),
        name: z.string(),
      }),
    )
    .nullable()
    .optional(), // Updated to include _id since we're dereferencing
  categories: z
    .array(
      z.object({
        _id: z.string(),
        title: z.string(),
        description: z.string().optional(),
      }),
    )
    .nullable()
    .optional(), // Changed to expect dereferenced objects, added nullable
  services: z
    .array(
      z.object({
        _id: z.string(),
        title: z.string(),
        slug: z.object({
          current: z.string(),
        }).optional(),
        description: z.string().optional(),
      }),
    )
    .nullable()
    .optional(), // Added services field for dereferenced services
  projectDate: z.string().nullable().optional(), // Added nullable
  publishDate: z.string().nullable().optional(), // Added publishDate field
  gallery: z.array(imageWithResolvedAssetSchema).optional(), // Gallery images also use resolved assets
})

// Schema for a list of projects
export const projectsSchema = z.array(projectSchema)

// Export TypeScript types derived from the Zod schemas
export type LocaleString = z.infer<typeof localeStringSchema>
export type ResolvedSanityAsset = z.infer<typeof resolvedSanityAssetSchema>
export type ImageWithResolvedAsset = z.infer<typeof imageWithResolvedAssetSchema>
export type ImageWithAlt = z.infer<typeof imageWithAltSchema> // Keeping for now, review if needed
export type Project = z.infer<typeof projectSchema>
export type Projects = z.infer<typeof projectsSchema>
