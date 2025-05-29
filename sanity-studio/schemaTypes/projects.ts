import { defineField, defineType } from 'sanity'

export const projects = defineType({
  name: 'project', // This ID remains 'project' to maintain compatibility with existing data
  title: 'Projects',
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
      title: 'Project Title',
      type: 'string', // Changed from localeString to string
      validation: (Rule) => Rule.required().error('A project title is required'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'This will be used for the project URL',
      type: 'slug',
      hidden: true, // Hide from the editor UI
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
      type: 'array', // Changed from localePortableText to standard portable text
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      language: 'language',
    },
    prepare(selection) {
      const { title, media, language } = selection
      return {
        title: title || 'Untitled Project',
        subtitle: language ? `Language: ${language}` : '',
        media,
      }
    },
  },
})
