import { defineField, defineType } from 'sanity'
import { baseLanguage } from './supportedLanguages' // Import baseLanguage

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title', // This will now be an object like { ca: 'Catalan Title', es: 'Spanish Title', ... }
      title: 'Title',
      type: 'localeString', // Use our new localized string type
      // Validation is now handled within localeString for the base language
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        // Source the slug from the base language title field
        source: baseLanguage ? `title.${baseLanguage.id}` : 'title.ca', // Fallback just in case
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('A slug is required to generate the page URL.'),
    }),
    defineField({
      name: 'mainContent', // This will now be an object like { ca: [blocks], es: [blocks], ... }
      title: 'Main Content',
      type: 'localePortableText', // Use our new localized Portable Text type
      // The 'of' array is now defined within localePortableText for each language
    }),
  ],
  preview: {
    select: {
      // Select the title from the base language for the preview
      title: baseLanguage ? `title.${baseLanguage.id}` : 'title.ca', // Fallback just in case
      subtitle: 'slug.current',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title: title || 'No title set for base language',
        subtitle: subtitle || 'No slug generated',
      }
    },
  },
})
