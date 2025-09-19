import { defineArrayMember, defineField, defineType, ReferenceFilterResolverContext } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

/**
 * Embedded object type for image sections within projects
 * @description Dynamic image layout: 1 image (full width), 2 images (side by side), 3 images (row), 4 images (3 top, 1 bottom)
 */
const imageSection = defineType({
  name: 'imageSection',
  title: 'Image Section',
  type: 'object',
  description: `Image layouts:
┌─────────────┐
│   1 image   │ → Use Featured Image only
└─────────────┘

┌──────┬──────┐
│  1   │  2   │ → Use Other Images only (2 images)
└──────┴──────┘

┌────┬────┬────┐
│ 1  │ 2  │ 3  │ → Use Other Images only (3 images)
└────┴────┴────┘

┌────┬────┬────┐
│ 1  │ 2  │ 3  │ → Featured + 3 Other Images
├──────────────┤
│   Featured   │
└──────────────┘`,
  fields: [
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      description: `LAYOUT GUIDE:
• 1 IMAGE: Use Featured only (full width)
• 2 IMAGES: Use Other Images only (side by side)
• 3 IMAGES: Use Other Images only (three in a row)
• 4 IMAGES: Use Featured + 3 Other Images (3 on top, Featured large below)

This field: Use for 1 image layout OR 4 images layout (becomes large bottom image)`,
      options: {
        hotspot: true,
      },
      // No validation - featured image is now optional
    }),
    defineField({
      name: 'otherImages',
      title: 'Other Images',
      type: 'array',
      description: 'Use alone for 2-3 images layout, OR add 3 images here + Featured for 4 images layout',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
      validation: Rule => Rule.max(3).warning('Maximum 3 additional images allowed (4 total including featured image)')
    }),
  ],
  preview: {
    select: {
      featuredImage: 'featuredImage',
      otherImages: 'otherImages',
    },
    prepare({ featuredImage, otherImages }) {
      const totalImages = (featuredImage ? 1 : 0) + (otherImages ? otherImages.length : 0)

      let title = ''
      let subtitle = ''

      if (totalImages === 0) {
        title = 'Image Section'
        subtitle = 'No images yet'
      } else if (totalImages === 1) {
        title = 'Image Section with 1 image'
        subtitle = 'Full width layout'
      } else if (totalImages === 2) {
        title = 'Image Section with 2 images'
        subtitle = 'Side by side layout'
      } else if (totalImages === 3) {
        title = 'Image Section with 3 images'
        subtitle = '3 images in a row'
      } else if (totalImages === 4) {
        title = 'Image Section with 4 images'
        subtitle = '3 on top, featured below'
      }

      return {
        title,
        subtitle
      }
    },
  },
})

/**
 * Rich text content block
 * @description A block for rich formatted text content
 */
const textBlock = defineType({
  name: 'textBlock',
  title: 'Text Content',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Text Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text content that can be styled as regular text or highlighted quotes in the frontend'
    })
  ],
  preview: {
    prepare() {
      return {
        title: 'Text Content',
        subtitle: 'Rich text block'
      }
    }
  }
})


// Export the content block types to use in other schemas if needed
export { imageSection, textBlock }
/**
 * Schema for project entries
 * @description Projects showcasing the company's work
 */
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
      // Language field managed by internationalization plugin - but no longer required
      validation: (Rule) => Rule.required().warning(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'This will be used for the project URL (click "Generate" button to create from title)',
      type: 'slug',
      hidden: false, // Show slug field so users can regenerate it
      options: {
        source: 'title',
        slugify: input => input
          ? input
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]+/g, '')
              .replace(/--+/g, '-')
              .slice(0, 96)
          : '', // Empty fallback
        maxLength: 96,
      },
      validation: Rule => Rule.required().error('A slug is required for the project URL'),
    }),
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string', // Changed from localeString to string
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Project Image',
      description: 'Main project image - appears prominently on the project page (REQUIRED)',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error('Main image is required for all projects'),
    }),
    defineField({
      name: 'useSeparateThumbnail',
      title: 'Use Separate Thumbnail',
      description: 'Use a different image as thumbnail instead of the main project image',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Thumbnail Image',
      description: 'Image to appear as project thumbnail (only used if option above is enabled)',
      type: 'image',
      options: {
        hotspot: true,
      },
      hidden: ({parent}) => !parent?.useSeparateThumbnail,
      // No validation
    }),
    defineField({
      name: 'hoverColor',
      title: 'Hover Color',
      description: 'Background color when hovering over the project thumbnail',
      type: 'color',
      options: {
        disableAlpha: true,
      },
    }),
    defineField({
      name: 'textHoverColor',
      title: 'Text Hover Color',
      description: 'Text color when hovering over the project thumbnail',
      type: 'color',
      options: {
        disableAlpha: true,
      },
    }),
    defineField({
      name: 'clients',
      title: 'Clients',
      description: 'Clients associated with this project',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'client' }],
        }),
      ],
      // No validation
    }),
    defineField({
      name: 'services',
      title: 'Services',
      description: 'Services associated with this project (filtered by current language). If no options appear, click "Create new" to add a new service.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'service' }],
          options: {
            // @ts-expect-error - Sanity Studio's type system doesn't fully capture the filter resolver pattern
            filter: ({ document }: ReferenceFilterResolverContext) => {
              // Get the language and current services from the document
              const language = document?.language
              const selectedServices = document?.services as { _ref: string }[] | undefined

              // Extract refs of already selected services
              const selectedRefs = selectedServices?.map(service => service._ref) || []

              // Filter by language AND exclude already selected services
              return {
                filter: 'language == $language && !(_id in $selectedRefs)',
                params: { language, selectedRefs },
                apiVersion: 'v2023-01-01'
              }
            },
            noResultsText: 'No services. Click on create to add a new one'
          }
        }),
      ],
      // No validation
    }),
    defineField({
      name: 'mainText',
      title: 'Main Text',
      description: 'Main descriptive content for the project',
      type: 'array',
      of: [{ type: 'block' }],
      // No validation
    }),
    defineField({
      name: 'contentSections',
      title: 'Content Sections',
      description: 'Add and rearrange content sections for this project. Text blocks can be styled as regular text or highlighted quotes in the frontend.',
      type: 'array',
      of: [
        defineArrayMember({ type: 'textBlock' }),
        defineArrayMember({ type: 'imageSection' })
      ],
      options: {
        layout: 'list',
        sortable: true
      }
    }),
    // Keeping these fields for backward compatibility with existing content
    // These fields are hidden from the UI but preserve existing data
    defineField({
      name: 'firstImageSection',
      title: 'First Image Section (Legacy)',
      description: 'First image showcase section (use Content Sections above instead)',
      type: 'imageSection',
      hidden: true,
    }),
    defineField({
      name: 'smallText',
      title: 'Small Text (Legacy)',
      description: 'A short piece of text (use Content Sections above instead)',
      type: 'text',
      rows: 3,
      hidden: true,
    }),
    defineField({
      name: 'secondImageSection',
      title: 'Second Image Section (Legacy)',
      description: 'Second image showcase section (use Content Sections above instead)',
      type: 'imageSection',
      hidden: true,
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      description: 'Date and time when project was published',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    orderRankField({ type: 'project' }),
  ],
  orderings: [
    orderRankOrdering,
    {
      name: 'publishDateDesc',
      title: 'Publish Date, Newest',
      by: [{ field: 'publishDate', direction: 'desc' }],
    },
    {
      name: 'titleAsc',
      title: 'Title, Ascending',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      useSeparateThumbnail: 'useSeparateThumbnail',
      thumbnailImage: 'thumbnailImage',
      mainImage: 'mainImage',
      language: 'language',
    },
    prepare(selection) {
      const { title, useSeparateThumbnail, thumbnailImage, mainImage, language } = selection
      
      // Simplify title handling to avoid any potential issues
      let displayTitle = ''
      
      if (typeof title === 'string') {
        displayTitle = title || 'Untitled Project'
      } else {
        displayTitle = 'Untitled Project'
      }
      
      return {
        title: displayTitle,
        subtitle: language ? `Language: ${language}` : '',
        media: (useSeparateThumbnail && thumbnailImage) || mainImage || null,
      }
    },
  },
})
