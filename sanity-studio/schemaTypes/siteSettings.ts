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