// sanity-studio/schemaTypes/header.ts
import { defineField, defineType } from 'sanity'
import type { ValidationContext } from 'sanity'
// No longer need baseLanguage import with document-level internationalization

// Define a schema for a navigation item
const navigationItem = defineType({
  name: 'navigationItem',
  title: 'Navigation Item',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string', // Changed from localeString to string
      description: 'The display name for this navigation item in different languages',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The URL path for this navigation item',
      options: {
        source: 'title', // Updated source reference for slug
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('A slug is required for the navigation link'),
    }),
    defineField({
      name: 'isExternal',
      title: 'Is External Link',
      type: 'boolean',
      description: 'Enable this if the link points to an external website',
      initialValue: false,
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      description: 'The full URL if this is an external link',
      hidden: ({ parent }) => !parent?.isExternal,
      validation: (Rule) =>
        Rule.custom((value, context: ValidationContext) => {
          // Only validate if parent.isExternal is true
          const parent = context.parent as { isExternal?: boolean } | undefined
          if (parent?.isExternal && !value) {
            return 'External URL is required for external links'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title', // Updated reference
      slug: 'slug.current',
      isExternal: 'isExternal',
      externalUrl: 'externalUrl',
    },
    prepare(selection) {
      const { title, slug, isExternal, externalUrl } = selection
      const subtitle = isExternal ? externalUrl : `/${slug}`
      
      return {
        title: title || 'No title set',
        subtitle: subtitle || 'No link destination set',
      }
    },
  },
})

// Define the header schema - This is a singleton document managed by the desk structure
export const header = defineType({
  name: 'header',
  title: 'Header',
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
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'A unique identifier for this header (e.g., "global-header")',
      options: {
        source: (doc) => 'header', // Use a static string since we removed the title field
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('A slug is required to identify this header'),
    }),
    defineField({
      name: 'navigationPages',
      title: 'Navigation Pages',
      type: 'array',
      of: [{ type: 'navigationItem' }],
      description: 'The navigation pages to display in the header',
    }),
    // The isActive field has been removed as it's no longer needed with the singleton pattern
  ],
  preview: {
    select: {
      slug: 'slug.current',
    },
    prepare(selection) {
      const { slug } = selection
      return {
        title: `Header (${slug || 'no-slug'})`,
        subtitle: 'Global navigation configuration',
      }
    },
  },
})

// Export the navigation item type so it can be used in the header schema
export const navigationItemType = navigationItem
