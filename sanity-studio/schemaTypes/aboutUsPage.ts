import { defineField, defineType } from 'sanity'

// Schema for the About Slider section
export const aboutSlider = defineType({
  name: 'aboutSlider',
  title: 'About Slider',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      validation: (Rule) => Rule.required().error('The section title is required.'),
    }),
    defineField({
      name: 'description',
      title: 'Descriptive Paragraph',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
      validation: (Rule) => Rule.required().error('The descriptive paragraph is required.'),
    }),
    defineField({
      name: 'images',
      title: 'Images to Display',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('At least one image is required for the slider.'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'images.0.asset',
    },
    prepare({title, media}) {
      return {
        title: title || 'About Slider',
        subtitle: title ? 'About Slider Content' : 'No title set',
        media: media,
      }
    },
  },
})

export const aboutUsPage = defineType({
  name: 'aboutUsPage',
  title: 'About Us Page',
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
      title: 'Title',
      type: 'string', // Using regular string as the document is already internationalized
      validation: (Rule) => Rule.required().error('A title is required'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required().error('Description is required'),
    }),
    defineField({
      name: 'aboutSlider',
      title: 'About Slider',
      type: 'aboutSlider',
      description: 'Content section with title, description, and image slider',
    }),
    defineField({
      name: 'clientsTitle',
      title: 'Clients Section Title',
      type: 'string',
      description: 'The title for the clients section. The client logos displayed are shared with the homepage. To select which clients appear in the slider, go to the Clients section in Sanity and mark them as "Featured".',
      validation: (Rule) => Rule.required().error('Clients section title is required'),
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
        title: `${title || 'About Us Page'} (${(language || '').toUpperCase()})`,
        subtitle: 'Company information and history',
      }
    },
  },
})
