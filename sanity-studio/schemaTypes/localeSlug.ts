// sanity-studio/schemaTypes/localeSlug.ts
import { defineType } from 'sanity'
import { supportedLanguages, baseLanguage } from './supportedLanguages'

export const localeSlug = defineType({
  title: 'Localized slug',
  name: 'localeSlug',
  type: 'object',
  // Fieldsets for organizing translations
  fieldsets: [
    {
      title: 'Translations',
      name: 'translations',
      options: { collapsible: true, collapsed: false }, // Start expanded
    },
  ],
  // Dynamically define one slug field per language
  fields: supportedLanguages.map(lang => ({
    title: `${lang.title} Slug`,
    name: lang.id,
    type: 'slug',
    description: `URL slug for ${lang.title} pages`,
    options: {
      // Generate slug from title in the same language
      source: (doc, options) => {
        // Try to get the title from the parent document in the same language
        const parent = options.parent as Record<string, any> | undefined
        if (parent && typeof parent === 'object') {
          // Check if parent has a title object with localized strings
          if (parent.title && typeof parent.title === 'object' && parent.title[lang.id]) {
            return parent.title[lang.id]
          }
        }
        return undefined
      },
      maxLength: 96,
    },
    // Make base language slug required, others optional
    validation: (Rule) => {
      return baseLanguage && lang.id === baseLanguage.id 
        ? Rule.required().error(`A slug for ${lang.title} is required`) 
        : Rule.optional()
    },
    fieldset: lang.isDefault ? undefined : 'translations',
  })),
  // Add a preview configuration to show the base language slug
  preview: {
    select: {
      slug: baseLanguage?.id 
        ? `${baseLanguage.id}.current` 
        : `${supportedLanguages[0].id}.current`,
    },
    prepare(selection) {
      const { slug } = selection
      return {
        title: slug || 'No slug set for base language',
      }
    },
  },
})
