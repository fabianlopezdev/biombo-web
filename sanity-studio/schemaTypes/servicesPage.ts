import { defineField, defineType } from 'sanity'

export const servicesPage = defineType({
  name: 'servicesPage',
  title: 'Services Page',
  type: 'document',
  fields: [
    // Language field required for document internationalization
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true, // The internationalization plugin handles this field
      hidden: false, // Set to true if you don't want editors to see this field
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string', // Using regular string as the document is already internationalized
      validation: (Rule) => Rule.required().error('A title is required'),
    }),
    defineField({
      name: 'mainContent',
      title: 'Main Content',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required().error('Main content is required'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      language: 'language',
    },
    prepare(selection) {
      const { title, language } = selection
      return {
        title: `${title || 'Services Page'} (${(language || '').toUpperCase()})`,
        subtitle: 'Services listing and configuration',
      }
    },
  },
})