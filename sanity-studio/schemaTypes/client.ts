import { defineField, defineType } from 'sanity'

/**
 * Schema for client information
 * @description Clients that can be referenced by projects (not internationalized)
 */
export const client = defineType({
  name: 'client',
  title: 'Clients',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Name of the client',
      validation: (Rule) => Rule.required().error('A client name is required'),
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      description: 'Client website URL',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Client logo image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Client',
      type: 'boolean',
      description: 'Show this client in the featured clients slider',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'website',
      media: 'logo',
      isFeatured: 'isFeatured',
    },
    prepare(selection) {
      const { title, subtitle, media, isFeatured } = selection
      return {
        title: `${isFeatured ? '⭐ ' : ''}${title || 'Unnamed Client'}`,
        subtitle: subtitle || '',
        media: media,
      }
    },
  },
})
