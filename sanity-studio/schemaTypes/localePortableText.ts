// sanity-studio/schemaTypes/localePortableText.ts
import { defineType } from 'sanity'
import { supportedLanguages } from './supportedLanguages'

export const localePortableText = defineType({
  title: 'Localized Portable Text',
  name: 'localePortableText',
  type: 'object',
  fieldsets: [
    {
      title: 'Translations',
      name: 'translations',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: supportedLanguages.map(lang => ({
    title: lang.title,
    name: lang.id,
    type: 'array', // For Portable Text
    of: [{ type: 'block' }], // Basic block content, can be expanded later
    // Portable text is often complex, so making it required might be too strict initially.
    // You can add validation per language if needed.
    // validation: (Rule) => (baseLanguage && lang.id === baseLanguage.id) ? Rule.required() : Rule.optional(),
    fieldset: lang.isDefault ? undefined : 'translations',
  })),
  // Preview for Portable Text is complex; usually, you'd show a snippet or a related field.
  // For now, we'll keep it simple or omit it for this specific type,
  // as the 'Page' schema's preview will use the localized title.
})
