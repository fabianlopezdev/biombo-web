// sanity-studio/schemaTypes/header.ts
import {defineField, defineType} from 'sanity'
import type {ValidationContext, ReferenceFilterResolverContext} from 'sanity'
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
      validation: (Rule) => Rule.custom(() => true), // Make validation pass always
    }),
    defineField({
      name: 'pageReference',
      title: 'Page',
      type: 'reference',
      description:
        'Select the page this navigation item should link to. Important: Each page should only be used once in the navigation.',
      to: [{type: 'projectsPage'}, {type: 'servicesPage'}, {type: 'aboutUsPage'}, {type: 'contactPage'}],
      options: {
        // Show only the allowed page types in the SAME language as this header document
        filter: ({document}: ReferenceFilterResolverContext) => ({
          filter:
            '_type in ["projectsPage", "servicesPage", "aboutUsPage", "contactPage"] && language == $lang',
          params: {lang: (document as {language?: string})?.language},
        }),
        disableNew: true,
      },
      hidden: ({parent}) => parent?.isExternal,
      validation: (Rule) => Rule.custom(() => true), // Make validation always pass for translations
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
      hidden: ({parent}) => !parent?.isExternal,
      validation: (Rule) =>
        Rule.custom((value, context: ValidationContext) => {
          // Make this more permissive for translations
          // Check if we're in a translation document
          const doc = context.document
          if (doc && doc.language && doc.language !== 'ca') {
            return true // Allow empty values for translations
          }

          // Original validation only for primary language
          const parent = context.parent as {isExternal?: boolean} | undefined
          if (parent?.isExternal && !value) {
            return 'External URL is required for external links'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      isExternal: 'isExternal',
      externalUrl: 'externalUrl',
      pageRef: 'pageReference',
      pageTitle: 'pageReference.title',
    },
    prepare(selection) {
      const {title, isExternal, externalUrl, pageRef, pageTitle} = selection

      if (isExternal) {
        return {
          title: title || 'No title set',
          subtitle: externalUrl || 'External URL not set',
        }
      }

      if (pageRef && pageTitle) {
        return {
          title: title || pageTitle,
          subtitle: `Links to: ${pageTitle}`,
        }
      }

      return {
        title: title || 'No title set',
        subtitle: 'Select a page or enable external link',
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
      name: 'navigationPages',
      title: 'Navigation Pages',
      type: 'array',
      of: [{type: 'navigationItem'}],
      description: 'The navigation pages to display in the header',
      // Make the field more flexible for translations by using a custom validation
      validation: (Rule) => Rule.custom(() => true),
    }),
  ],
  preview: {
    select: {
      language: 'language',
    },
    prepare(selection) {
      const {language} = selection
      return {
        title: `Header (${(language || '').toUpperCase()})`,
        subtitle: 'Header navigation pages',
      }
    },
  },
})

export const navigationItemType = navigationItem
