import { z } from 'zod'
import { serviceSchema } from './serviceSchema'
import { portableTextBlockSchema } from './homePageSchema'

export const servicesPageSchema = z.object({
  _id: z.string(),
  _type: z.literal('servicesPage'),
  _createdAt: z.string().optional(),
  _updatedAt: z.string().optional(),
  language: z.union([z.literal('ca'), z.literal('es'), z.literal('en')]),
  title: z.string(),
  description: z.array(portableTextBlockSchema),
  selectedServices: z.array(serviceSchema).optional(),
})

export type ServicesPage = z.infer<typeof servicesPageSchema>
