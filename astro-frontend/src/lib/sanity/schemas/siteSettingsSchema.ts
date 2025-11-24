// src/shared/schemas/sanity/siteSettingsSchema.ts
import { z } from 'zod'

// Define Zod schema for Sanity color input type
// This matches the structure returned by @sanity/color-input
export const colorSchema = z.object({
  _type: z.literal('color'),
  hex: z.string(),
  alpha: z.number().optional(),
  hsl: z
    .object({
      h: z.number(),
      s: z.number(),
      l: z.number(),
      a: z.number().optional(),
    })
    .optional(),
  hsv: z
    .object({
      h: z.number(),
      s: z.number(),
      v: z.number(),
      a: z.number().optional(),
    })
    .optional(),
  rgb: z
    .object({
      r: z.number(),
      g: z.number(),
      b: z.number(),
      a: z.number().optional(),
    })
    .optional(),
})

// Define Zod schema for site settings
export const siteSettingsSchema = z.object({
  _id: z.string(),
  _type: z.literal('siteSettings'),
  _createdAt: z.string(),
  _updatedAt: z.string(),
  primaryColor: colorSchema,
  secondaryColor: colorSchema,
  catalaVisible: z.boolean().optional(),
  spanishVisible: z.boolean().optional(),
  englishVisible: z.boolean().optional(),
})

// Export TypeScript types derived from the Zod schemas
export type SiteSettings = z.infer<typeof siteSettingsSchema>
export type SanityColor = z.infer<typeof colorSchema>
