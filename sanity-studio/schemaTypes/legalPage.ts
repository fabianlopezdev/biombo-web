import {defineField, defineType} from 'sanity'

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal Page',
  type: 'document',
  fields: [
    // Language field for internationalization plugin
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: false,
    }),
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'Title of the legal page (e.g., "Avís Legal", "Aviso Legal", "Legal Notice")',
      validation: (Rule) => Rule.required().error('Title is required'),
    }),
    defineField({
      name: 'content',
      title: 'Legal Content',
      type: 'array',
      description: 'Main legal text content. Use the rich text editor to paste and format your legal notice.',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required().error('Content is required'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      language: 'language',
    },
    prepare(selection) {
      const {title, language} = selection
      return {
        title: `${title || 'Legal Page'} (${(language || '').toUpperCase()})`,
        subtitle: 'Legal notice content',
      }
    },
  },
})
