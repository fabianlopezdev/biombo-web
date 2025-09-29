import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

/**
 * Schema for service entries
 * @description Services offered by the company with full internationalization support
 */
export const service = defineType({
  name: 'service',
  title: 'Services',
  type: 'document',
  fields: [
    // Language field required for document internationalization
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true, // The internationalization plugin handles this field
      hidden: false, // Set to true if you don't want editors to see this field
      validation: (Rule) => Rule.required().warning(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Name of the service',
      validation: (Rule) => Rule.required().error('A service title is required'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'This will be used for the service URL. Note: Accented characters (á, é, ñ, etc.) will be converted to their base forms (a, e, n). Please review and edit if needed after generation.',
      type: 'slug',
      options: {
        source: 'title',
        slugify: input => input
          ? input
              .normalize('NFD') // Decompose accented characters
              .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]+/g, '') // Remove non-word chars
              .replace(/--+/g, '-') // Replace multiple dashes with single dash
              .replace(/^-+/, '') // Trim dashes from start
              .replace(/-+$/, '') // Trim dashes from end
          : '',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('A slug is required for the service URL'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of this service',
      rows: 2,
    }),
    // Enable manual drag-and-drop ordering in Desk via order rank field
    orderRankField({ type: 'service' }),
  ],
  // Expose ordering by the manual rank
  orderings: [orderRankOrdering],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      language: 'language',
    },
    prepare(selection) {
      const { title, subtitle, language } = selection
      return {
        title: title || 'Untitled Service',
        subtitle: language ? `[${language.toUpperCase()}] ${subtitle || ''}` : subtitle,
      }
    },
  },
})