import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

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
    defineField({
      name: 'featuredOrder',
      title: 'Featured Order',
      type: 'number',
      description: 'Optional: Set a specific order for featured clients (lower numbers appear first)',
      hidden: ({ document }) => !document?.isFeatured,
      validation: (Rule) => Rule.min(0).integer(),
    }),
    orderRankField({ type: 'client' }),
  ],
  orderings: [
    orderRankOrdering,
    {
      name: 'featuredOrder',
      title: 'Featured Order',
      by: [
        { field: 'featuredOrder', direction: 'asc' },
        { field: 'orderRank', direction: 'asc' }
      ]
    },
    {
      name: 'nameAsc',
      title: 'Name A-Z',
      by: [{ field: 'name', direction: 'asc' }]
    }
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
