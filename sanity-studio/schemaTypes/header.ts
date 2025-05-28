// sanity-studio/schemaTypes/header.ts
import { defineField, defineType } from 'sanity'
import type { ValidationContext } from 'sanity'
import { baseLanguage } from './supportedLanguages'

// Define a schema for a navigation item
const navigationItem = defineType({
  name: 'navigationItem',
  title: 'Navigation Item',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      description: 'The display name for this navigation item in different languages',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The URL path for this navigation item',
      options: {
        source: baseLanguage ? `title.${baseLanguage.id}` : 'title.ca',
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
      title: baseLanguage ? `title.${baseLanguage.id}` : 'title.ca',
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
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Name for this header configuration (for internal use)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'A unique identifier for this header (e.g., \'global-header\')',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('A slug is required to identify this header'),
    }),
    defineField({
      name: 'navigationItems',
      title: 'Navigation Items',
      type: 'array',
      of: [{ type: 'navigationItem' }],
      description: 'The navigation items to display in the header',
    }),
    // The isActive field has been removed as it's no longer needed with the singleton pattern
  ],
  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
    },
    prepare(selection) {
      const { title, isActive } = selection
      return {
        title,
        subtitle: isActive ? 'Active' : 'Inactive',
      }
    },
  },
})

// Export the navigation item type so it can be used in the header schema
export const navigationItemType = navigationItem
