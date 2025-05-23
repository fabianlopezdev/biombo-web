import { defineField, defineType } from 'sanity'
import { baseLanguage } from './supportedLanguages'

// Schema for the Hero section
export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heroText',
      title: 'Main Heading',
      description: 'The large heading text at the top of the page. Use **bold** to mark which word should be highlighted with the underline effect (e.g., "Transformem **idees** en solucions")',
      type: 'localeString',
      validation: (Rule) => Rule.required().error('The hero heading text is required'),
    }),
    defineField({
      name: 'scrollText',
      title: 'Scroll Text',
      description: 'Text that appears next to the scroll icon (e.g., "Explora fent scroll")',
      type: 'localeString',
    }),
  ],
  preview: {
    select: {
      heroText: baseLanguage ? `heroText.${baseLanguage.id}` : 'heroText.ca',
    },
    prepare(selection) {
      const { heroText } = selection
      return {
        title: 'Hero Section',
        subtitle: heroText || 'No hero text set',
      }
    },
  },
})

// Schema for the Projects section (placeholder for now)
export const projectsSection = defineType({
  name: 'projectsSection',
  title: 'Projects Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'localeString',
    }),
    // You can add more fields here as needed
  ],
})

// Schema for the About section (placeholder for now)
export const aboutSection = defineType({
  name: 'aboutSection',
  title: 'About Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'localeString',
    }),
    // You can add more fields here as needed
  ],
})

// Schema for the Services section (placeholder for now)
export const servicesSection = defineType({
  name: 'servicesSection',
  title: 'Services Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'localeString',
    }),
    // You can add more fields here as needed
  ],
})

// Main HomePage schema
export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'heroSection',
      description: 'The main banner section at the top of the homepage',
      validation: (Rule) => Rule.required().error('The hero section is required.'),
      options: {
        collapsible: false,  // Don't allow collapsing this section
        collapsed: false,    // Start expanded
      },
    }),
    defineField({
      name: 'projects',
      title: 'Projects Section',
      type: 'projectsSection',
    }),
    defineField({
      name: 'about',
      title: 'About Section',
      type: 'aboutSection',
    }),
    defineField({
      name: 'services',
      title: 'Services Section',
      type: 'servicesSection',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page',
        subtitle: 'Landing page content',
      }
    },
  },
})
