// sanity-studio/schemaTypes/localeString.ts
import { defineType } from 'sanity'
import { supportedLanguages, baseLanguage } from './supportedLanguages'

export const localeString = defineType({
  title: 'Localized string',
  name: 'localeString',
  type: 'object',
  // Fieldsets can be used to group object fields.
  // Here we omit a fieldset for the "default language",
  // making it stand out as the main field.
  fieldsets: [
    {
      title: 'Translations',
      name: 'translations',
      options: { collapsible: true, collapsed: false }, // Start expanded
    },
  ],
  // Dynamically define one field per language
  fields: supportedLanguages.map(lang => ({
    title: lang.title,
    name: lang.id,
    type: 'string',
    // Use 'validation' for required rule if baseLanguage is not found or lang is baseLanguage
    validation: (Rule) => (baseLanguage && lang.id === baseLanguage.id) ? Rule.required() : Rule.optional(),
    fieldset: lang.isDefault ? undefined : 'translations',
  })),
  // Add a preview configuration to show the base language value
  preview: {
    select: {
      title: baseLanguage?.id ? `${baseLanguage.id}` : supportedLanguages[0].id, // Fallback to first language if no default
    },
    prepare(selection) {
      const { title } = selection
      return {
        title: title || 'No title set for base language',
      }
    },
  },
})
