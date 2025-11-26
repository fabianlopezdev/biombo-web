import { defineField, defineType } from 'sanity'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact Page',
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
    // Language field required for document internationalization
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true, // The internationalization plugin handles this field
      hidden: false, // Set to true if you don't want editors to see this field
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
      title: 'Title',
      type: 'string', // Using regular string as the document is already internationalized
      validation: (Rule) => Rule.required().error('A title is required'),
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      description: 'Your contact email address that will be displayed on the page',
      validation: (Rule) => Rule.email().error('Please enter a valid email address'),
    }),
    defineField({
      name: 'phone',
      title: 'Contact Phone',
      type: 'string',
      description: 'Your contact phone number that will be displayed on the page',
    }),
    defineField({
      name: 'formSection',
      title: 'Contact Form Configuration',
      type: 'object',
      description: 'Configure the contact form settings and field order',
      fields: [
        defineField({
          name: 'formTitle',
          title: 'Form Title',
          type: 'string',
          description: 'The title that appears above the contact form',
          validation: (Rule) => Rule.required().error('Form title is required'),
        }),
        defineField({
          name: 'formFields',
          title: 'Form Fields',
          type: 'array',
          description: '⚡ Drag and drop these fields to reorder them on the contact form. The order here will be the order displayed on the website.',
          of: [
            {
              type: 'object',
              title: 'Form Field',
              fields: [
                defineField({
                  name: 'fieldType',
                  title: 'Field Type',
                  type: 'string',
                  description: 'Select the type of form field',
                  options: {
                    list: [
                      { title: 'Name Field', value: 'name' },
                      { title: 'Email Field', value: 'email' },
                      { title: 'Phone Field', value: 'phone' },
                      { title: 'Message Field', value: 'message' },
                    ],
                  },
                  validation: (Rule) => Rule.required().error('Field type is required'),
                }),
                defineField({
                  name: 'label',
                  title: 'Field Label',
                  type: 'string',
                  description: 'The label text that appears above the input field',
                  validation: (Rule) => Rule.required().error('Field label is required'),
                }),
                defineField({
                  name: 'placeholder',
                  title: 'Placeholder Text',
                  type: 'string',
                  description: 'Optional placeholder text that appears inside the empty field',
                }),
                defineField({
                  name: 'required',
                  title: 'Required Field',
                  type: 'boolean',
                  description: 'If checked, users cannot submit the form without filling this field',
                  initialValue: true,
                }),
              ],
              preview: {
                select: {
                  fieldType: 'fieldType',
                  label: 'label',
                  required: 'required',
                },
                prepare(selection: { fieldType?: 'name' | 'email' | 'phone' | 'message'; label?: string; required?: boolean }) {
                  const { fieldType, label, required } = selection
                  const typeLabels: Record<string, string> = {
                    name: '👤 Name',
                    email: '✉️ Email',
                    phone: '📞 Phone',
                    message: '💬 Message',
                  }
                  return {
                    title: label || 'Unnamed field',
                    subtitle: `${fieldType ? (typeLabels[fieldType] || fieldType) : 'Unknown'}${required ? ' (Required)' : ' (Optional)'}`,
                  }
                },
              },
            },
          ],
          validation: (Rule) =>
            Rule.custom((fields) => {
              // If fields is undefined or null, it's valid (will be caught by parent validation)
              if (!fields) return true

              // Check that we have at least one field
              if (!Array.isArray(fields) || fields.length === 0) {
                return 'At least one form field is required'
              }

              // Check for duplicate field types
              const fieldTypes = (fields as Array<{ fieldType?: string }>).map(f => f?.fieldType).filter(Boolean)
              const uniqueTypes = new Set(fieldTypes)

              if (fieldTypes.length !== uniqueTypes.size) {
                return 'Each field type can only be used once in the form'
              }

              return true
            }),
        }),
        defineField({
          name: 'submitButtonText',
          title: 'Submit Button Text',
          type: 'string',
          description: 'The text displayed on the form submit button (e.g., "Send", "Submit", "Contact Us")',
          validation: (Rule) => Rule.required().error('Submit button text is required'),
        }),
      ],
      validation: (Rule) => Rule.required().error('Form configuration is required'),
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
        title: `${title || 'Contact Page'} (${(language || '').toUpperCase()})`,
        subtitle: 'Contact information and form',
      }
    },
  },
})