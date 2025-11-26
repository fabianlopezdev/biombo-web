import {defineField, defineType} from 'sanity'

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal Page',
  type: 'document',
  fieldsets: [
    {
      name: 'seo',
      title: 'SEO / Meta Tags',
      description: 'Customize how this page appears in search engine results',
      options: { collapsible: true, collapsed: true }
    }
  ],
  fields: [
    // Language field for internationalization plugin
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: false,
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      fieldset: 'seo',
      description: 'Custom title for search engines and browser tabs. Recommended: 50-60 characters. Leave empty to use default.',
      validation: (Rule) => Rule.max(70).warning('Meta titles over 60 characters may be truncated in search results'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      fieldset: 'seo',
      description: 'Brief summary for search engine results. Recommended: 150-160 characters. Leave empty to use default.',
      validation: (Rule) => Rule.max(200).warning('Meta descriptions over 160 characters may be truncated in search results'),
    }),
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'Title of the legal page (e.g., "Avís Legal", "Aviso Legal", "Legal Notice")',
      validation: (Rule) => Rule.required().error('Title is required'),
    }),
    defineField({
      name: 'content',
      title: 'Legal Content',
      type: 'array',
      description: 'Main legal text content. Use the rich text editor to paste and format your legal notice.',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required().error('Content is required'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      language: 'language',
    },
    prepare(selection) {
      const {title, language} = selection
      return {
        title: `${title || 'Legal Page'} (${(language || '').toUpperCase()})`,
        subtitle: 'Legal notice content',
      }
    },
  },
})
