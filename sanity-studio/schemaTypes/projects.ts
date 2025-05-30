import { defineArrayMember, defineField, defineType, ReferenceFilterResolverContext } from 'sanity'

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
      validation: (Rule) => Rule.required(),
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
    }),
  ],
})

// Export the imageSection type to use in other schemas if needed
export { imageSection }
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
    }),
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string', // Changed from localeString to string
      validation: (Rule) => Rule.required().error('A project title is required'),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Project Image',
      description: 'Main project image - appears prominently on the project page',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error('A main project image is required'),
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
      validation: (Rule) => Rule.custom((value, context: any) => {
        if (context.parent?.useSeparateThumbnail && !value) {
          return 'Custom thumbnail image is required when enabled';
        }
        return true;
      }),
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
      validation: (Rule) => Rule.required().error('At least one client is required'),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      description: 'Service categories this project falls under (filtered by current language). If no options appear, click "Create new" to add a new service category.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'serviceCategory' }],
          options: {
            // @ts-expect-error - Sanity Studio's type system doesn't fully capture the filter resolver pattern
            filter: ({ document }: ReferenceFilterResolverContext) => {
              // Get the language and current categories from the document
              const language = document?.language
              const selectedCategories = document?.categories as { _ref: string }[] | undefined
              
              // Extract refs of already selected categories
              const selectedRefs = selectedCategories?.map(cat => cat._ref) || []
              
              // Filter by language AND exclude already selected categories
              return {
                filter: 'language == $language && !(_id in $selectedRefs)',
                params: { 
                  language,
                  selectedRefs
                }
              }
            },
            noResultsText: 'No services. Click on create to add a new one'
          }
        }),
      ],
      validation: (Rule) => Rule.required().error('At least one category is required'),
    }),
    defineField({
      name: 'mainText',
      title: 'Main Text',
      description: 'Main descriptive content for the project',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'firstImageSection',
      title: 'First Image Section',
      description: 'First image showcase section',
      type: 'imageSection',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'smallText',
      title: 'Small Text',
      description: 'A short piece of text, suitable for a few sentences',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'secondImageSection',
      title: 'Second Image Section',
      description: 'Second image showcase section',
      type: 'imageSection',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      description: 'Date project was published/went live (for sorting)',
      type: 'date',
    }),
  ],
  orderings: [
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
      return {
        title: title || 'Untitled Project',
        subtitle: language ? `Language: ${language}` : '',
        media: (useSeparateThumbnail && thumbnailImage) || mainImage,
      }
    },
  },
})
