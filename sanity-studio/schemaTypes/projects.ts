import { defineArrayMember, defineField, defineType, ReferenceFilterResolverContext } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

/**
 * Embedded object type for image sections within projects
 * @description A reusable structure for featured image and gallery
 */
const imageSection = defineType({
  name: 'imageSection',
  title: 'Image Section',
  type: 'object',
  fields: [
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      description: 'Main, prominent image for this section',
      options: {
        hotspot: true,
      },
      // No validation - featured image is now optional
    }),
    defineField({
      name: 'otherImages',
      title: 'Other Images',
      type: 'array',
      description: 'Collection of additional images',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
      // No validation
    }),
  ],
  preview: {
    select: {
      featuredImage: 'featuredImage',
      otherImages: 'otherImages',
    },
    prepare({ featuredImage, otherImages }) {
      const hasImages = featuredImage || (otherImages && otherImages.length > 0)
      return {
        title: 'Image Section',
        subtitle: hasImages 
          ? `${featuredImage ? '1 featured image' : 'No featured image'}${otherImages && otherImages.length > 0 ? `, ${otherImages.length} additional image${otherImages.length === 1 ? '' : 's'}` : ''}` 
          : 'No images yet',
        media: featuredImage || null,
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
      of: [{ type: 'block' }]
    })
  ],
  preview: {
    select: {
      text: 'text'
    },
    prepare({ text }) {
      // Extract some text from the portable text blocks for preview
      const block = (text || []).find((block: {_type: string; children: Array<{_type: string; text: string}>}) => block._type === 'block')
      const textPreview = block
        ? block.children
            .filter((child: {_type: string}) => child._type === 'span')
            .map((span: {text: string}) => span.text)
            .join('')
        : 'No content'

      return {
        title: textPreview.length > 50 ? textPreview.substring(0, 50) + '...' : textPreview,
        subtitle: 'Text Content'
      }
    }
  }
})

/**
 * Small text block for shorter content
 * @description A block for shorter, non-formatted text content
 */
const smallTextBlock = defineType({
  name: 'smallTextBlock',
  title: 'Small Text',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Small Text',
      type: 'text',
      rows: 3
    })
  ],
  preview: {
    select: {
      text: 'text'
    },
    prepare({ text }) {
      return {
        title: text ? (text.length > 40 ? `${text.substring(0, 40)}...` : text) : 'No content',
        subtitle: 'Small Text'
      }
    }
  }
})

// Export the content block types to use in other schemas if needed
export { imageSection, textBlock, smallTextBlock }
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
      description: 'Use a different image for the homepage thumbnail?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Homepage Thumbnail',
      description: 'Custom thumbnail for homepage (only used if option above is enabled)',
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
      description: 'Background color when hovering over the project',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      initialValue: {
        hex: '#63b2d5',
      },
    }),
    defineField({
      name: 'textHoverColor',
      title: 'Text Hover Color',
      description: 'Text color when hovering over the project',
      type: 'color',
      options: {
        disableAlpha: true,
      },
      initialValue: {
        hex: '#ffffff',
      },
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'This will be used for the project URL',
      type: 'slug',
      hidden: true, // Hide slug field as it's auto-generated
      options: {
        source: 'title',
        slugify: input => input
          ? input
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]+/g, '')
              .replace(/--+/g, '-')
              .slice(0, 96)
          : 'untitled', // Fallback if title is empty
        maxLength: 96,
        isUnique: () => true, // Skip uniqueness check for better performance
      },
      // This will force the slug to always pass validation
      validation: Rule => Rule.custom(() => true),
      // Set a default value to ensure it always has content
      initialValue: {current: 'untitled'}
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
      description: 'Add and rearrange content sections for this project',
      type: 'array',
      of: [
        defineArrayMember({ type: 'textBlock' }),
        defineArrayMember({ type: 'smallTextBlock' }),
        defineArrayMember({ type: 'imageSection' })
      ],
      options: {
        layout: 'grid',
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
