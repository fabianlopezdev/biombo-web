// src/shared/schemas/sanity/pageSchema.ts
import { z } from 'zod'

// Define Zod schema for localeString based on supportedLanguages
const localeStringSchema = z
  .object({
    ca: z.string().optional(),
    es: z.string().optional(),
    en: z.string().optional(),
  })
  .partial() // .partial() ensures that even if a language key is present, its value can be undefined.
// If a language key might be missing entirely, this is fine.
// If specific languages are always required (e.g., the default 'ca'), define them without .optional() inside the object before .partial().

// Define a basic Zod schema for Portable Text blocks
const portableTextBlockSchema = z
  .object({
    _key: z.string().optional(), // _key might not be present on all root level array elements from Portable Text if it's a custom object, but usually is for blocks.
    _type: z.string(),
    children: z
      .array(
        z.object({
          _key: z.string().optional(),
          _type: z.string().optional(), // span blocks often have _type: 'span'
          text: z.string().optional(), // Text can be empty
          marks: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    style: z.string().optional(),
    list: z.string().optional(),
    level: z.number().optional(),
    listItem: z.string().optional(),
    markDefs: z.array(z.any()).optional(),
  })
  .passthrough() // Allows other properties not explicitly defined, common for various block types

// Define Zod schema for localePortableText
const localePortableTextSchema = z
  .object({
    ca: z.array(portableTextBlockSchema).optional(),
    es: z.array(portableTextBlockSchema).optional(),
    en: z.array(portableTextBlockSchema).optional(),
  })
  .partial()

export const pageSchema = z.object({
  _id: z.string(),
  _type: z.literal('page'),
  title: localeStringSchema.optional(), // Making title itself optional, assuming a page might exist without a title temporarily
  slug: z
    .object({
      current: z.string(),
      _type: z.literal('slug').optional(), // _type for slug is typically 'slug'
    })
    .optional(), // Making slug object optional
  mainContent: localePortableTextSchema.optional(),
  // Example: if you fetch the 'language' field from document-internationalization
  // language: z.enum(['ca', 'es', 'en']).optional(),
})

export type Page = z.infer<typeof pageSchema>

export const pagesSchema = z.array(pageSchema)
export type Pages = z.infer<typeof pagesSchema>
