// src/shared/schemas/sanity/homePageSchema.ts
import { z } from 'zod'
import { projectSchema } from './projectSchema'
import { serviceSchema } from './serviceSchema'

// Define Zod schema for localized strings (consistent with pageSchema)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const localeStringSchema = z
  .object({
    _type: z.literal('localeString'),
    ca: z.string().optional(),
    es: z.string().optional(),
    en: z.string().optional(),
  })
  .partial()

// Define Zod schema for localized portable text (consistent with pageSchema)
// We don't need portable text for the homepage sections right now, so removing these schemas
// If needed later, they can be re-added or imported from pageSchema

// Basic Zod schema for a child of a portable text block (span)
export const portableTextChildSchema = z.object({
  _key: z.string(),
  _type: z.literal('span'),
  marks: z.array(z.string()).optional(),
  text: z.string(),
})

// Basic Zod schema for a portable text block
export const portableTextBlockSchema = z.object({
  _key: z.string(),
  _type: z.string(), // Allows for 'block' or custom block types
  style: z.string().optional(),
  children: z.array(portableTextChildSchema),
  listItem: z.string().optional(), // For list items (bullet, number)
  level: z.number().optional(), // For nested lists
  markDefs: z
    .array(
      z.object({
        _key: z.string(),
        _type: z.string(),
        href: z.string().optional(), // Example for link markDef
        blank: z.boolean().optional(), // Example for link markDef
      }),
    )
    .optional(),
})

// Zod schema for image asset metadata
const imageAssetMetadataSchema = z.object({
  lqip: z.string().optional(), // Low-Quality Image Placeholder
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
    aspectRatio: z.number(),
  }),
})

// Zod schema for image asset
const imageAssetSchema = z.object({
  _id: z.string(),
  url: z.string().url(),
  metadata: imageAssetMetadataSchema.optional(), // Making metadata optional as it might not always be present
})

// Zod schema for image hotspot
const imageHotspotSchema = z.object({
  x: z.number(),
  y: z.number(),
  height: z.number(),
  width: z.number(),
})

// Zod schema for image crop
const imageCropSchema = z.object({
  top: z.number(),
  bottom: z.number(),
  left: z.number(),
  right: z.number(),
})

// Zod schema for a Sanity image
export const sanityImageSchema = z.object({
  _key: z.string().optional(), // _key might not be present if it's a direct image field, not in an array
  _type: z.literal('image'),
  asset: imageAssetSchema, // Reference to the image asset
  hotspot: imageHotspotSchema.nullable().optional(),
  crop: imageCropSchema.nullable().optional(),
})

// Define Zod schema for Hero Section
const heroSectionSchema = z.object({
  _type: z.literal('heroSection').optional(),
  heroText: z.string().optional(),
  scrollText: z.string().optional(),
  textAlignment: z.string().optional(), // Desktop text alignment: 'left' | 'center' | 'right'
  mobileTextAlignment: z.string().optional(), // Mobile text alignment: 'left' | 'center' | 'right'
})

// Define Zod schema for an individual featured project item
export const featuredProjectItemSchema = z.object({
  _key: z.string(),
  project: projectSchema, // This is the dereferenced project document
})

export type FeaturedProjectItem = z.infer<typeof featuredProjectItemSchema>

// Define Zod schema for Projects Section with all required fields
const projectsSectionSchema = z.object({
  _type: z.literal('projectsSection'),
  title: z.string(),
  subtitle: z.string().optional(),
  viewAllText: z.string().optional(),
  viewProjectText: z.string().optional(),
  // Properly reference the projectSchema for featured projects
  featuredProjects: z.array(featuredProjectItemSchema).optional(),
})

// Define Zod schema for About Section
const aboutSectionSchema = z.object({
  _type: z.literal('aboutSection'),
  title: z.string(), // Title is a direct string, not localized at field level
  description: z.array(portableTextBlockSchema).min(1), // Portable text, required
  images: z.array(sanityImageSchema).min(1), // Array of images, at least one required
})

// Define Zod schema for Services Section
const servicesSectionSchema = z.object({
  _type: z.literal('servicesSection'),
  title: z.string(),
  subtitle: z.string().optional(),
  text: z.string().optional(),
  selectedServices: z.array(serviceSchema).optional(),
})

// Zod schema for the Clients section
const clientsSectionSchema = z.object({
  _type: z.literal('clientsSection').optional(),
  title: z.string(),
})

// Define Zod schema for the entire HomePage
export const homePageSchema = z.object({
  _id: z.string(),
  _type: z.literal('homePage'),
  _createdAt: z.string(),
  _updatedAt: z.string(),
  language: z.union([z.literal('ca'), z.literal('es'), z.literal('en')]).optional(),
  hero: heroSectionSchema.nullable(), // Allow null when not yet populated
  projects: projectsSectionSchema.nullable().optional(), // Allow null or undefined
  about: aboutSectionSchema.nullable().optional(), // Allow null or undefined
  services: servicesSectionSchema.nullable().optional(), // Allow null or undefined
  clients: clientsSectionSchema.nullable().optional(), // Allow null or undefined
})

// Export the TypeScript types derived from the Zod schemas
export type LocaleString = z.infer<typeof localeStringSchema>
// Since we're not using localePortableTextSchema in this schema currently, comment it out
// export type LocalePortableText = z.infer<typeof localePortableTextSchema>
export type PortableTextChild = z.infer<typeof portableTextChildSchema>
export type PortableTextBlock = z.infer<typeof portableTextBlockSchema>
export type SanityImage = z.infer<typeof sanityImageSchema>
export type HeroSection = z.infer<typeof heroSectionSchema>
export type ProjectsSection = z.infer<typeof projectsSectionSchema>
export type AboutSection = z.infer<typeof aboutSectionSchema>
export type ServicesSection = z.infer<typeof servicesSectionSchema>
export type ClientsSection = z.infer<typeof clientsSectionSchema>

// Define HomePage type to properly handle nullable fields
export type HomePage = Omit<
  z.infer<typeof homePageSchema>,
  'hero' | 'projects' | 'about' | 'services' | 'clients'
> & {
  hero: HeroSection | null
  projects?: ProjectsSection | null
  about?: AboutSection | null
  services?: ServicesSection | null
  clients?: ClientsSection | null
}

// Schema for an array of home pages (likely won't be needed, but included for consistency)
export const homePagesSchema = z.array(homePageSchema)
export type HomePages = z.infer<typeof homePagesSchema>
