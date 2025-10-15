import { defineField, defineType } from 'sanity'

export const projectsPage = defineType({
  name: 'projectsPage',
  title: 'Projects Page',
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
      title: 'Page Title',
      type: 'string', // Using regular string as the document is already internationalized
      description: 'The main title displayed at the top of the projects page. Note: The projects displayed are automatically pulled from the Projects documents, and the filter options come from the Services documents. This page only controls the page title.',
      validation: (Rule) => Rule.required().error('A title is required'),
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
        title: `${title || 'Projects Page'} (${(language || '').toUpperCase()})`,
        subtitle: 'Projects listing page - controls page title only',
      }
    },
  },
})
