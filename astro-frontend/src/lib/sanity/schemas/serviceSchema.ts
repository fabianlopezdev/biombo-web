// src/shared/schemas/sanity/serviceSchema.ts
import { z } from 'zod'

export const serviceSchema = z.object({
  _id: z.string(),
  _type: z.literal('service'),
  language: z.union([z.literal('ca'), z.literal('es'), z.literal('en')]),
  title: z.string(),
  slug: z
    .object({
      current: z.string(),
    })
    .optional(),
  description: z.string().optional(),
})

export const servicesSchema = z.array(serviceSchema)

export type Service = z.infer<typeof serviceSchema>
export type Services = z.infer<typeof servicesSchema>
