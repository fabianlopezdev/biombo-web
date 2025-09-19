import { defineField, defineType, ReferenceFilterResolverContext } from 'sanity'

export const servicesPage = defineType({
  name: 'servicesPage',
  title: 'Services Page',
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
      name: 'selectedServices',
      title: 'Select Services',
      description: 'Pick and order the services to display on the services page',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'service'}],
          options: {
            // Filter by the language of the Services Page document
            // and exclude already selected services to avoid duplicates
            filter: ({document, parent}: ReferenceFilterResolverContext) => {
              const servicesPageDoc = document as any
              const language = servicesPageDoc?.language
              const alreadySelected = Array.isArray(parent)
                ? parent.map((item: any) => item?._ref).filter(Boolean)
                : []

              const filterParts = ['_type == "service"']
              const params: {language?: string; selected?: string[]} = {}

              if (language) {
                filterParts.push('language == $language')
                params.language = language
              }

              if (alreadySelected.length > 0) {
                filterParts.push('!(_id in $selected)')
                params.selected = alreadySelected
              }

              return {
                filter: filterParts.join(' && '),
                params,
              }
            },
            noResultsText:
              'No services for this language. Create new services or change the language.',
          },
        },
      ],
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
        title: `${title || 'Services Page'} (${(language || '').toUpperCase()})`,
        subtitle: 'Services listing and configuration',
      }
    },
  },
})