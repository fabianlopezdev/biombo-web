import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'color',
      options: { disableAlpha: true },
      validation: (Rule) => Rule.required().error('Primary color is required'),
    }),
    defineField({
      name: 'secondaryColor',
      title: 'Secondary Color',
      type: 'color',
      options: { disableAlpha: true },
      validation: (Rule) => Rule.required().error('Secondary color is required'),
    }),
    defineField({
      name: 'catalaVisible',
      title: 'Català Language Ready',
      type: 'boolean',
      initialValue: true,
      description: 'Show Catalan language option in the language switcher. Recommended to keep enabled as it is the default language.',
    }),
    defineField({
      name: 'spanishVisible',
      title: 'Spanish Language Ready',
      type: 'boolean',
      initialValue: false,
      description: 'Show Spanish language option in the language switcher. Enable when Spanish translations are complete.',
    }),
    defineField({
      name: 'englishVisible',
      title: 'English Language Ready',
      type: 'boolean',
      initialValue: false,
      description: 'Show English language option in the language switcher. Enable when English translations are complete.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
        subtitle: 'Global theme and styling configuration',
      }
    },
  },
})