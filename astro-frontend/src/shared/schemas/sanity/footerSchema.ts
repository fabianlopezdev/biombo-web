// src/shared/schemas/sanity/footerSchema.ts
import { z } from 'zod'

// Social link schema
const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
})

// Footer document schema
export const footerSchema = z.object({
  _id: z.string(),
  _type: z.literal('footer'),
  _createdAt: z.string(),
  _updatedAt: z.string(),
  _rev: z.string(),
  language: z.string(),
  slogan: z.string().optional(),
  backToTopText: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  legalLinkText: z.string().optional(),
  legalLinkUrl: z.string().optional(),
})

export type Footer = z.infer<typeof footerSchema>
export type SocialLink = z.infer<typeof socialLinkSchema>
