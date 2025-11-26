// sanity-studio/schemaTypes/localeStringOptional.ts
import { defineType } from 'sanity'
import { supportedLanguages } from './supportedLanguages'
import { LocaleStringOptionalInput } from '../components/LocaleStringOptionalInput'

/**
 * Localized string type where ALL languages are optional.
 * Use this for fields like alt text and image titles where
 * content is recommended but not required.
 */
export const localeStringOptional = defineType({
  title: 'Localized string (all optional)',
  name: 'localeStringOptional',
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
    type: 'string',
    validation: (Rule) => Rule.optional(),
    fieldset: lang.isDefault ? undefined : 'translations',
  })),
  // Custom input component to fix change detection for nested fields in extended image types
  components: {
    input: LocaleStringOptionalInput,
  },
})
