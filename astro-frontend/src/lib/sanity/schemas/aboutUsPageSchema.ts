// src/shared/schemas/sanity/aboutUsPageSchema.ts
import { z } from 'zod'
import { portableTextBlockSchema } from './homePageSchema'

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
  url: z.string(),
  metadata: imageAssetMetadataSchema.optional(),
})

// Zod schema for image hotspot
const hotspotSchema = z.object({
  x: z.number(),
  y: z.number(),
  height: z.number(),
  width: z.number(),
})

// Zod schema for image crop
const cropSchema = z.object({
  top: z.number(),
  bottom: z.number(),
  left: z.number(),
  right: z.number(),
})

// Zod schema for localized string (optional - for alt text)
const localeStringOptionalSchema = z
  .object({
    ca: z.string().optional(),
    es: z.string().optional(),
    en: z.string().optional(),
  })
  .optional()

// Zod schema for Sanity image
export const aboutUsImageSchema = z.object({
  _key: z.string(),
  _type: z.literal('image'),
  asset: imageAssetSchema,
  alt: localeStringOptionalSchema, // Multilingual alt text
  hotspot: hotspotSchema.optional(),
  crop: cropSchema.optional(),
})

// Schema for the About Slider section
export const aboutSliderSchema = z.object({
  _type: z.literal('aboutSlider').optional(),
  title: z.string(),
  description: z.array(portableTextBlockSchema),
  images: z.array(aboutUsImageSchema).min(1),
})

// Main About Us Page schema
export const aboutUsPageSchema = z.object({
  _id: z.string(),
  _type: z.literal('aboutUsPage'),
  _createdAt: z.string().optional(),
  _updatedAt: z.string().optional(),
  language: z.string().optional(),
  title: z.string(),
  description: z.array(portableTextBlockSchema),
  aboutSlider: aboutSliderSchema.optional(),
  clientsTitle: z.string().optional(),
})

// Type exports
export type AboutUsImage = z.infer<typeof aboutUsImageSchema>
export type AboutSlider = z.infer<typeof aboutSliderSchema>
export type AboutUsPage = z.infer<typeof aboutUsPageSchema>
