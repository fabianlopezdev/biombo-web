import { z } from 'zod'

// Zod schema for image asset metadata
const imageAssetMetadataSchema = z
  .object({
    lqip: z.string().optional(),
    dimensions: z
      .object({
        width: z.number(),
        height: z.number(),
        aspectRatio: z.number(),
      })
      .optional(),
  })
  .optional()

// Zod schema for image asset
const imageAssetSchema = z
  .object({
    _id: z.string(),
    url: z.string().url(),
    metadata: imageAssetMetadataSchema,
  })
  .optional()

// Zod schema for image hotspot
const imageHotspotSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    height: z.number(),
    width: z.number(),
  })
  .optional()
  .nullable()

// Zod schema for image crop
const imageCropSchema = z
  .object({
    top: z.number(),
    bottom: z.number(),
    left: z.number(),
    right: z.number(),
  })
  .optional()
  .nullable()

// Zod schema for a Sanity image
const sanityImageSchema = z
  .object({
    _type: z.literal('image'),
    asset: imageAssetSchema,
    hotspot: imageHotspotSchema,
    crop: imageCropSchema,
  })
  .optional()
  .nullable()

// Zod schema for Client document
export const clientSchema = z.object({
  _id: z.string(),
  _type: z.literal('client'),
  name: z.string(),
  website: z.string().url().optional().nullable(),
  logo: sanityImageSchema,
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().optional().nullable(),
  orderRank: z.string().optional().nullable(),
})

// Export TypeScript types
export type Client = z.infer<typeof clientSchema>
export type ClientImage = z.infer<typeof sanityImageSchema>

// Schema for an array of clients
export const clientsSchema = z.array(clientSchema)
export type Clients = z.infer<typeof clientsSchema>
