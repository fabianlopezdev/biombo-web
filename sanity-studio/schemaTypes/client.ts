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
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'website',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title: title || 'Unnamed Client',
        subtitle: subtitle || '',
      }
    },
  },
})
