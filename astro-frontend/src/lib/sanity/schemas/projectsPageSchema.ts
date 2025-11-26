import { z } from 'zod'

export const projectsPageSchema = z.object({
  _id: z.string(),
  _type: z.literal('projectsPage'),
  _createdAt: z.string().optional(),
  _updatedAt: z.string().optional(),
  language: z.union([z.literal('ca'), z.literal('es'), z.literal('en')]),
  title: z.string(),
  metaTitle: z.string().nullable().optional(), // SEO: Custom meta title
  metaDescription: z.string().nullable().optional(), // SEO: Custom meta description
})

export type ProjectsPage = z.infer<typeof projectsPageSchema>
