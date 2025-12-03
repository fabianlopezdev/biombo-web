// src/shared/schemas/sanity/projectSchema.ts
import { z } from 'zod'

// Define Zod schema for localized strings (optional alt text)
// Note: Sanity's localeStringOptional type returns plain objects without _type
// and can be null when no alt text is set
const localeStringSchema = z
  .object({
    ca: z.string().optional(),
    es: z.string().optional(),
    en: z.string().optional(),
  })
  .nullable()
  .optional()

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
  alt: localeStringSchema, // Already handles null/optional
  caption: localeStringSchema, // Already handles null/optional
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
      lqip: z.string().optional(), // Add LQIP field
      // other metadata fields
    })
    .nullable()
    .optional(),
})

// Define Zod schema for a resolved Sanity video/file asset
const resolvedSanityFileAssetSchema = z.object({
  _id: z.string(),
  _type: z.string(), // Typically 'sanity.fileAsset'
  url: z.string().url(),
  path: z.string().optional(),
  assetId: z.string().optional(),
  extension: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  originalFilename: z.string().optional(),
})

// Define Zod schema for an image object that contains a RESOLVED asset
const imageWithResolvedAssetSchema = z.object({
  _type: z.literal('image'),
  asset: resolvedSanityAssetSchema, // Use the resolved asset schema here
  alt: localeStringSchema, // Already handles null/optional
  caption: localeStringSchema, // Already handles null/optional
  showFullOnMobile: z.boolean().nullable().optional(), // When true, show full image on mobile without cropping
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

// Define Zod schema for a file object with resolved asset (can be image or video)
// Supports both legacy 'file' type and new 'videoWithBackground' type
const fileWithResolvedAssetSchema = z.object({
  _type: z.union([z.literal('file'), z.literal('videoWithBackground')]),
  asset: z.union([resolvedSanityAssetSchema, resolvedSanityFileAssetSchema]),
  backgroundColor: z.object({ hex: z.string() }).nullable().optional(), // Custom background color for loading state
  showFullOnMobile: z.boolean().nullable().optional(), // When true, show full media on mobile without cropping
})

// Define a union schema for media items that can be EITHER image OR file type
// This matches Sanity Studio's hybrid array type: of: [{type: 'image'}, {type: 'file'}]
const mediaItemSchema = z.union([imageWithResolvedAssetSchema, fileWithResolvedAssetSchema])

// Schema for text block content section
const textBlockSchema = z.object({
  _type: z.literal('textBlock'),
  _key: z.string(),
  text: z.array(z.any()).nullable().optional(), // Portable text blocks
})

// Schema for image/media section content
const imageSectionSchema = z.object({
  _type: z.literal('imageSection'),
  _key: z.string(),
  // Media format - can be EITHER image OR file (video)
  // Accepts both single item (legacy) or array item from Sanity's hybrid array type
  featuredMedia: z
    .union([z.array(mediaItemSchema), mediaItemSchema])
    .nullable()
    .optional(),
  otherMedia: z.array(mediaItemSchema).nullable().optional(),
  mobileFeaturedMedia: z
    .union([z.array(mediaItemSchema), mediaItemSchema])
    .nullable()
    .optional(),
  mobileOtherMedia: z.array(mediaItemSchema).nullable().optional(),
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
  mainMedia: z
    .union([z.array(mediaItemSchema), mediaItemSchema])
    .nullable()
    .optional(), // Media field - can be image or file (video), array with max 1 item (or single for legacy)
  useMobileMainMedia: z.boolean().nullable().optional(), // Toggle for mobile main media
  mobileMainMedia: z
    .union([z.array(mediaItemSchema), mediaItemSchema])
    .nullable()
    .optional(), // Mobile hero media field - optional custom media for mobile single project layout
  thumbnailMedia: z
    .union([z.array(mediaItemSchema), mediaItemSchema])
    .nullable()
    .optional(), // Thumbnail media field - can be image or file (video), array with max 1 item (or single for legacy)
  useSeparateThumbnail: z.boolean().nullable().optional(), // Added useSeparateThumbnail field
  homepageThumbnailMedia: z
    .union([z.array(mediaItemSchema), mediaItemSchema])
    .nullable()
    .optional(), // Homepage thumbnail media field - optional custom thumbnail for homepage featured projects
  useMobileHomepageThumbnail: z.boolean().nullable().optional(), // Toggle for mobile homepage thumbnail
  mobileHomepageThumbnailMedia: z
    .union([z.array(mediaItemSchema), mediaItemSchema])
    .nullable()
    .optional(), // Mobile homepage thumbnail media field - optional custom thumbnail for mobile homepage featured projects
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
        description: z.string().nullable().optional(),
      }),
    )
    .nullable()
    .optional(), // Changed to expect dereferenced objects, added nullable
  services: z
    .array(
      z.object({
        _id: z.string(),
        title: z.string(),
        slug: z
          .object({
            current: z.string(),
          })
          .optional(),
        description: z.string().optional(),
      }),
    )
    .nullable()
    .optional(), // Added services field for dereferenced services
  projectDate: z.string().nullable().optional(), // Added nullable
  publishDate: z.string().nullable().optional(), // Added publishDate field
  gallery: z.array(imageWithResolvedAssetSchema).optional(), // Gallery images also use resolved assets
  metaTitle: z.string().nullable().optional(), // SEO: Custom meta title
  metaDescription: z.string().nullable().optional(), // SEO: Custom meta description
})

// Schema for a list of projects
export const projectsSchema = z.array(projectSchema)

// Export TypeScript types derived from the Zod schemas
export type LocaleString = z.infer<typeof localeStringSchema>
export type ResolvedSanityAsset = z.infer<typeof resolvedSanityAssetSchema>
export type ResolvedSanityFileAsset = z.infer<typeof resolvedSanityFileAssetSchema>
export type ImageWithResolvedAsset = z.infer<typeof imageWithResolvedAssetSchema>
export type FileWithResolvedAsset = z.infer<typeof fileWithResolvedAssetSchema>
export type MediaItem = z.infer<typeof mediaItemSchema> // Union type for media that can be image OR file
export type ImageWithAlt = z.infer<typeof imageWithAltSchema> // Keeping for now, review if needed
export type Project = z.infer<typeof projectSchema>
export type Projects = z.infer<typeof projectsSchema>
