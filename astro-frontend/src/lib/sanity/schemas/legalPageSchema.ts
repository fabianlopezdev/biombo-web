import { z } from 'zod'
import { portableTextBlockSchema } from './homePageSchema'

// Main Legal Page schema
export const legalPageSchema = z.object({
  _id: z.string(),
  _type: z.literal('legalPage'),
  _createdAt: z.string().optional(),
  _updatedAt: z.string().optional(),
  language: z.union([z.literal('ca'), z.literal('es'), z.literal('en')]).optional(),
  title: z.string(),
  content: z.array(portableTextBlockSchema),
})

// Type exports
export type LegalPage = z.infer<typeof legalPageSchema>
