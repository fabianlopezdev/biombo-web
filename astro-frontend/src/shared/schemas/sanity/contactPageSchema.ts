import { z } from 'zod'

// Define Zod schema for Form Section
const formSectionSchema = z.object({
  _type: z.literal('formSection').optional(),
  formTitle: z.string(),
  nameLabel: z.string(),
  emailLabel: z.string(),
  phoneLabel: z.string(),
  messageLabel: z.string(),
  submitButtonText: z.string(),
})

// Define Zod schema for the entire ContactPage
export const contactPageSchema = z.object({
  _id: z.string(),
  _type: z.literal('contactPage'),
  _createdAt: z.string(),
  _updatedAt: z.string(),
  language: z.union([z.literal('ca'), z.literal('es'), z.literal('en')]).optional(),
  title: z.string(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  formSection: formSectionSchema.nullable().optional(),
})

// Export the TypeScript types derived from the Zod schemas
export type FormSection = z.infer<typeof formSectionSchema>
export type ContactPage = z.infer<typeof contactPageSchema>

// Schema for an array of contact pages
export const contactPagesSchema = z.array(contactPageSchema)
export type ContactPages = z.infer<typeof contactPagesSchema>