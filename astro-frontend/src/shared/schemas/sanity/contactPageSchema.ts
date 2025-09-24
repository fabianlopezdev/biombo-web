import { z } from 'zod'

// Define Zod schema for Form Field
const formFieldSchema = z.object({
  _key: z.string().optional(), // Sanity array items have a _key
  fieldType: z.enum(['name', 'email', 'phone', 'message']),
  label: z.string(),
  placeholder: z.string().nullable().optional(),
  required: z.boolean().default(true),
})

// Define Zod schema for Form Section
const formSectionSchema = z.object({
  _type: z.literal('object').optional(),
  formTitle: z.string(),
  formFields: z.array(formFieldSchema).min(1),
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
export type FormField = z.infer<typeof formFieldSchema>
export type FormSection = z.infer<typeof formSectionSchema>
export type ContactPage = z.infer<typeof contactPageSchema>

// Schema for an array of contact pages
export const contactPagesSchema = z.array(contactPageSchema)
export type ContactPages = z.infer<typeof contactPagesSchema>