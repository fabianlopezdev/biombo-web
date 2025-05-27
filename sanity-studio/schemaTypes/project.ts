import { defineField, defineType } from 'sanity'
import { baseLanguage } from './supportedLanguages'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'localeString',
      validation: (Rule) => Rule.required().error('Project title is required'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'localeSlug',
      description: 'This defines the project URL. Click Generate to create automatically from title.',
      validation: (Rule) => Rule.required().error('Slug is required for routing'),
    }),
    // Featured projects are now managed through the homepage schema
    // instead of on individual projects
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'localeString',
          title: 'Alternative Text',
          description: 'Important for SEO and accessibility. Describe what is in the image.',
          validation: (Rule) => Rule.required().error('Alt text is required for accessibility'),
        },
        {
          name: 'caption',
          type: 'localeString',
          title: 'Caption',
          description: 'Optional caption for this image',
        },
      ],
      validation: (Rule) => Rule.required().error('Main image is required'),
    }),
    defineField({
      name: 'excerpt',
      title: 'Short Description',
      type: 'localePortableText',
      description: 'A brief summary of the project (used in listings and cards)',
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'localePortableText',
      description: 'Full project description (shown on project page)',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'projectDate',
      title: 'Project Date',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'localeString',
              title: 'Alternative Text',
              description: 'Important for SEO and accessibility',
            },
            {
              name: 'caption',
              type: 'localeString',
              title: 'Caption',
              description: 'Optional caption for this image',
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: baseLanguage ? `title.${baseLanguage.id}` : 'title.ca',
      client: 'client',
      media: 'mainImage',
      featured: 'featured',
      featuredOrder: 'featuredOrder',
    },
    prepare({ title, client, media, featured, featuredOrder }) {
      const subtitle = [
        client && `Client: ${client}`,
        featured && `Featured${featuredOrder ? ` (#${featuredOrder})` : ''}`,
      ].filter(Boolean).join(' • ')

      return {
        title,
        subtitle,
        media,
      }
    },
  },
})
