import { defineField, defineType } from 'sanity'
import { baseLanguage } from './supportedLanguages'

export const projects = defineType({
  name: 'project', // This ID remains 'project' to maintain compatibility with existing data
  title: 'Projects',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'localeString',
      validation: (Rule) => Rule.required().error('A project title is required'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'This will be used for the project URL',
      type: 'localeSlug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('A slug is required'),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Web Design', value: 'web-design' },
          { title: 'Branding', value: 'branding' },
          { title: 'UX/UI', value: 'ux-ui' },
          { title: 'Motion Design', value: 'motion-design' },
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localePortableText',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: baseLanguage ? `title.${baseLanguage.id}` : 'title.ca',
      media: 'mainImage',
    },
    prepare(selection) {
      const { title, media } = selection
      return {
        title: title || 'Untitled Project',
        media,
      }
    },
  },
})
