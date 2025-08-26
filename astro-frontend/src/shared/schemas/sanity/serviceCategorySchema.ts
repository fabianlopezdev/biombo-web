// src/shared/schemas/sanity/serviceCategorySchema.ts
import { z } from 'zod'

export const serviceCategorySchema = z.object({
  _id: z.string(),
  _type: z.literal('serviceCategory'),
  language: z.union([z.literal('ca'), z.literal('es'), z.literal('en')]),
  title: z.string(),
  description: z.string().optional(),
})

export const serviceCategoriesSchema = z.array(serviceCategorySchema)

export type ServiceCategory = z.infer<typeof serviceCategorySchema>
export type ServiceCategories = z.infer<typeof serviceCategoriesSchema>
