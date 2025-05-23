// src/shared/schemas/sanity/homePageSchema.ts
import { z } from 'zod'

// Define Zod schema for localized strings (consistent with pageSchema)
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

// Define Zod schema for Hero Section
const heroSectionSchema = z.object({
  _type: z.literal('heroSection'),
  heroText: localeStringSchema,
  scrollText: localeStringSchema,
})

// Define Zod schema for Projects Section (placeholder for now)
const projectsSectionSchema = z.object({
  _type: z.literal('projectsSection'),
  title: localeStringSchema,
  // Add more fields as needed when you expand this section
})

// Define Zod schema for About Section (placeholder for now)
const aboutSectionSchema = z.object({
  _type: z.literal('aboutSection'),
  title: localeStringSchema,
  // Add more fields as needed when you expand this section
})

// Define Zod schema for Services Section (placeholder for now)
const servicesSectionSchema = z.object({
  _type: z.literal('servicesSection'),
  title: localeStringSchema,
  // Add more fields as needed when you expand this section
})

// Define Zod schema for the entire HomePage
export const homePageSchema = z.object({
  _id: z.string(),
  _type: z.literal('homePage'),
  _createdAt: z.string(),
  _updatedAt: z.string(),
  hero: heroSectionSchema,
  projects: projectsSectionSchema.optional(),
  about: aboutSectionSchema.optional(),
  services: servicesSectionSchema.optional(),
})

// Export the TypeScript types derived from the Zod schemas
export type LocaleString = z.infer<typeof localeStringSchema>
// Since we're not using localePortableTextSchema in this schema currently, comment it out
// export type LocalePortableText = z.infer<typeof localePortableTextSchema>
export type HeroSection = z.infer<typeof heroSectionSchema>
export type ProjectsSection = z.infer<typeof projectsSectionSchema>
export type AboutSection = z.infer<typeof aboutSectionSchema>
export type ServicesSection = z.infer<typeof servicesSectionSchema>
export type HomePage = z.infer<typeof homePageSchema>

// Schema for an array of home pages (likely won't be needed, but included for consistency)
export const homePagesSchema = z.array(homePageSchema)
export type HomePages = z.infer<typeof homePagesSchema>
