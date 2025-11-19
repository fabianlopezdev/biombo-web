import { defineArrayMember, defineField, defineType, ReferenceFilterResolverContext } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { MediaFileInput } from '../components/MediaFileInput'
import { SingleItemArrayInput } from '../components/SingleItemArrayInput'

/**
 * Video with custom background color for loading state
 * @description Wraps a video file with an optional background color that displays while the video loads
 */
const videoWithBackground = defineType({
  name: 'videoWithBackground',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'asset',
      type: 'file',
      title: 'Video File',
      options: {
        accept: 'video/*',
      },
      validation: (Rule) => Rule.required(),
      components: {
        input: MediaFileInput,
      },
    }),
    defineField({
      name: 'backgroundColor',
      type: 'color',
      title: 'Loading Background Color',
      description:
        'Background color shown while video loads and during fade-in transition. Choose a color that matches the video content for a smooth transition (defaults to black if not set).',
      options: {
        disableAlpha: true,
      },
    }),
  ],
  preview: {
    select: {
      asset: 'asset',
      backgroundColor: 'backgroundColor',
    },
    prepare({ asset, backgroundColor }) {
      return {
        title: asset?.originalFilename || 'Video',
        subtitle: backgroundColor?.hex ? `Background: ${backgroundColor.hex}` : 'No background color set',
      }
    },
  },
})

/**
 * Embedded object type for image/media sections within projects
 * @description Dynamic image/video layout: 1 media (full width), 2 media (side by side), 3 media (row), 4 media (3 top, 1 bottom)
 * Supports both images and videos - editors can upload either directly
 */
const imageSection = defineType({
  name: 'imageSection',
  title: 'Media Section',
  type: 'object',
  description: `Dynamic media layouts (images or videos) based on your selection:
• 1 MEDIA: Featured media only (full width)
• 2 MEDIA: Two other media items (side by side)
• 3 MEDIA WITH FEATURED: Two other media on top, featured media below (full width)
• 3 MEDIA WITHOUT FEATURED: Three other media in a single row
• 4 MEDIA: Three other media on top, featured media below (full width)

You can mix images and videos in the same section!`,
  fields: [
    // Media fields (support both images and videos)
    defineField({
      name: 'featuredMedia',
      title: 'Featured Media (Image or Video)',
      type: 'array',
      description: `Upload an IMAGE or VIDEO file for featured position.

LAYOUT GUIDE:
• 1 MEDIA: Use Featured only (full width)
• 2 MEDIA: Leave empty, use Other Media only (side by side)
• 3 MEDIA: Option A - Add Featured + 2 Other Media (2 on top, featured below)
• 3 MEDIA: Option B - Leave empty, use 3 Other Media only (row layout)
• 4 MEDIA: Use Featured + 3 Other Media (3 on top, featured below)

Accepts: Images (JPG, PNG, WebP, etc.) and Videos (MP4, WebM, etc.)`,
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: {
            hotspot: true,
          },
        }),
        defineArrayMember({
          type: 'videoWithBackground',
        }),
      ],
      components: {
        input: SingleItemArrayInput,
      },
      validation: Rule => Rule.max(1).error('Only 1 image or video is allowed'),
    }),
    defineField({
      name: 'otherMedia',
      title: 'Other Media (Images or Videos)',
      type: 'array',
      description: 'Upload IMAGE or VIDEO files. For 2 media: Add 2 here (side by side). For 3 media: Add 2 here with Featured (2+1 layout) OR add 3 here without Featured (row layout). For 4 media: Add 3 here with Featured. You can mix images and videos!',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: {
            hotspot: true,
          },
        }),
        defineArrayMember({
          type: 'videoWithBackground',
        }),
      ],
      validation: Rule => Rule.max(3).warning('Maximum 3 additional media items allowed (4 total including featured media)')
    }),
    defineField({
      name: 'mobileFeaturedMedia',
      title: 'Mobile Featured Media (Optional)',
      description: 'Mobile-optimized version of featured media. Desktop aspect ratios change on mobile, potentially cropping important content. If not set, desktop media will be used.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: {
            hotspot: true,
          },
        }),
        defineArrayMember({
          type: 'videoWithBackground',
        }),
      ],
      components: {
        input: SingleItemArrayInput,
      },
      validation: Rule => Rule.max(1).error('Only 1 image or video is allowed'),
    }),
    defineField({
      name: 'mobileOtherMedia',
      title: 'Mobile Other Media (Optional)',
      description: 'Mobile-optimized versions of other media (max 3). If not set, desktop media will be cropped to fit mobile aspect ratios.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: {
            hotspot: true,
          },
        }),
        defineArrayMember({
          type: 'videoWithBackground',
        }),
      ],
      validation: Rule => Rule.max(3).error('Maximum of 3 items allowed'),
    }),
  ],
  preview: {
    select: {
      featuredMedia: 'featuredMedia',
      otherMedia: 'otherMedia',
    },
    prepare({ featuredMedia, otherMedia }) {
      // Count featured media items
      let featuredCount = 0
      if (Array.isArray(featuredMedia)) {
        if (featuredMedia.length > 0) featuredCount++
      } else if (featuredMedia) {
        featuredCount++
      }

      // Count other media
      const otherCount = otherMedia?.length || 0

      // Calculate total
      const totalMedia = featuredCount + otherCount

      // Check if we have at least one featured item
      const hasFeatured = featuredCount > 0

      let title = ''
      let subtitle = ''

      if (totalMedia === 0) {
        title = 'Media Section'
        subtitle = 'No media yet'
      } else if (totalMedia === 1) {
        title = 'Media Section with 1 item'
        subtitle = 'Full width layout'
      } else if (totalMedia === 2) {
        title = 'Media Section with 2 items'
        subtitle = 'Side by side layout'
      } else if (totalMedia === 3) {
        title = 'Media Section with 3 items'
        subtitle = hasFeatured ? '2 on top + featured below' : '3 items in a row'
      } else if (totalMedia === 4) {
        title = 'Media Section with 4 items'
        subtitle = '3 on top, featured below'
      } else {
        title = `Media Section with ${totalMedia} items`
        subtitle = 'Too many items'
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
export { videoWithBackground, imageSection, textBlock }
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
      description: 'This will be used for the project URL. Note: Accented characters (á, é, ñ, etc.) will be converted to their base forms (a, e, n). Please review and edit if needed after generation.',
      type: 'slug',
      hidden: false, // Show slug field so users can regenerate it
      options: {
        source: 'title',
        slugify: (input, _type, context) => {
          // Get the language from the document
          const language = (context.parent as { language?: string } | undefined)?.language

          // Generate base slug
          const baseSlug = input
            ? input
                .normalize('NFD') // Decompose accented characters
                .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]+/g, '')
                .replace(/--+/g, '-')
                .slice(0, 90) // Leave room for language suffix
            : ''

          // For non-Catalan languages, append the language code
          // This makes slugs unique: norma-comics (ca), norma-comics-es (es), norma-comics-en (en)
          if (language && language !== 'ca') {
            return `${baseSlug}-${language}`
          }

          return baseSlug
        },
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
      name: 'mainMedia',
      title: 'Main Media (Image or Video)',
      description: 'Upload an IMAGE or VIDEO file for the main project hero. This appears prominently on the project detail page. Accepts: Images (JPG, PNG, WebP, etc.) and Videos (MP4, WebM, etc.)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: {
            hotspot: true,
          },
        }),
        defineArrayMember({
          type: 'videoWithBackground',
        }),
      ],
      components: {
        input: SingleItemArrayInput,
      },
      validation: (Rule) => Rule.max(1).error('Only 1 image or video is allowed').required().min(1).error('Main Media is required'),
    }),
    defineField({
      name: 'useMobileMainMedia',
      title: 'Use Different Media for Mobile',
      description: 'Mobile crops the desktop hero image from wide (1513/722) to nearly square (65/59). Enable this to upload a mobile-optimized image or video.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'mobileMainMedia',
      title: 'Mobile Hero Media (Image or Video)',
      description: 'Media optimized for mobile (aspect ratio 65/59 - nearly square). If not set, desktop media will be cropped using object-fit: cover.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: {
            hotspot: true,
          },
        }),
        defineArrayMember({
          type: 'videoWithBackground',
        }),
      ],
      components: {
        input: SingleItemArrayInput,
      },
      validation: Rule => Rule.max(1).error('Only 1 image or video is allowed'),
      hidden: ({parent}) => !parent?.useMobileMainMedia,
    }),
    defineField({
      name: 'useSeparateThumbnail',
      title: 'Use Separate Thumbnail',
      description: 'Use a different image as thumbnail instead of the main project image',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'thumbnailMedia',
      title: 'Thumbnail Media (Image or Video)',
      description: 'Upload an IMAGE or VIDEO file for the project thumbnail. Used in project cards and listings (only used if "Use Separate Thumbnail" is enabled). Accepts: Images (JPG, PNG, WebP, etc.) and Videos (MP4, WebM, etc.)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: {
            hotspot: true,
          },
        }),
        defineArrayMember({
          type: 'videoWithBackground',
        }),
      ],
      components: {
        input: SingleItemArrayInput,
      },
      validation: Rule => Rule.max(1).error('Only 1 image or video is allowed'),
      hidden: ({parent}) => !parent?.useSeparateThumbnail,
      // No validation - thumbnail is optional
    }),
    defineField({
      name: 'homepageThumbnailMedia',
      title: 'Homepage Thumbnail Media (Optional)',
      description: 'Optional custom thumbnail specifically for the homepage featured projects section. Use this if you want a different image optimized for the homepage grid layout. If not set, falls back to the regular thumbnail or main image.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: {
            hotspot: true,
          },
        }),
        defineArrayMember({
          type: 'videoWithBackground',
        }),
      ],
      components: {
        input: SingleItemArrayInput,
      },
      validation: Rule => Rule.max(1).error('Only 1 image or video is allowed'),
      // No required validation - this field is optional
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
      thumbnailMedia: 'thumbnailMedia',
      mainMedia: 'mainMedia',
      homepageThumbnailMedia: 'homepageThumbnailMedia',
      mobileMainMedia: 'mobileMainMedia',
      contentSections: 'contentSections',
      language: 'language',
    },
    prepare(selection) {
      const {
        title,
        useSeparateThumbnail,
        thumbnailMedia,
        mainMedia,
        homepageThumbnailMedia,
        mobileMainMedia,
        contentSections,
        language
      } = selection

      // Simplify title handling to avoid any potential issues
      let displayTitle = ''

      if (typeof title === 'string') {
        displayTitle = title || 'Untitled Project'
      } else {
        displayTitle = 'Untitled Project'
      }

      // Helper function to check if media is an image (not a video object)
      const isImage = (media: any) => {
        if (!media) return false
        // Sanity images have _type: 'image', videos have _type: 'videoWithBackground'
        return media._type === 'image'
      }

      // Helper function to find first image in an array or single media item
      const findFirstImage = (media: any): any => {
        if (!media) return null

        // If it's an array, search through it
        if (Array.isArray(media)) {
          for (const item of media) {
            if (isImage(item)) {
              return item
            }
          }
          return null
        }

        // If it's a single item, check if it's an image
        return isImage(media) ? media : null
      }

      // Helper to search content sections for images
      const findImageInContentSections = (sections: any): any => {
        if (!Array.isArray(sections)) return null

        for (const section of sections) {
          // Check if this is an imageSection type
          if (section._type === 'imageSection') {
            // Try featured media first
            const featuredImage = findFirstImage(section.featuredMedia)
            if (featuredImage) return featuredImage

            // Then try other media
            const otherImage = findFirstImage(section.otherMedia)
            if (otherImage) return otherImage

            // Try mobile variants as last resort
            const mobileFeaturedImage = findFirstImage(section.mobileFeaturedMedia)
            if (mobileFeaturedImage) return mobileFeaturedImage

            const mobileOtherImage = findFirstImage(section.mobileOtherMedia)
            if (mobileOtherImage) return mobileOtherImage
          }
        }

        return null
      }

      // Search for first available image in priority order
      let previewMedia = null

      if (useSeparateThumbnail) {
        // Priority 1: thumbnailMedia (if separate thumbnail is enabled)
        previewMedia = findFirstImage(thumbnailMedia)
      }

      if (!previewMedia) {
        // Priority 2: mainMedia
        previewMedia = findFirstImage(mainMedia)
      }

      if (!previewMedia) {
        // Priority 3: homepageThumbnailMedia
        previewMedia = findFirstImage(homepageThumbnailMedia)
      }

      if (!previewMedia) {
        // Priority 4: mobileMainMedia
        previewMedia = findFirstImage(mobileMainMedia)
      }

      if (!previewMedia) {
        // Priority 5: contentSections (search for images in media sections)
        previewMedia = findImageInContentSections(contentSections)
      }

      return {
        title: displayTitle,
        subtitle: language ? `Language: ${language}` : '',
        media: previewMedia || null,
      }
    },
  },
})
