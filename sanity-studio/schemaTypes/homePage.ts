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

// Schema for the Projects section
export const projectsSection = defineType({
  name: 'projectsSection',
  title: 'Projects Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      description: 'The main heading for the projects section (e.g. "Tria, remena, fes clic!")',
      type: 'localeString',
      validation: (Rule) => Rule.required().error('Section title is required'),
    }),
    defineField({
      name: 'subtitle',
      title: 'Section Subtitle',
      description: 'The smaller subtitle for the projects section (e.g. "Projectes Destacats")',
      type: 'localeString',
      validation: (Rule) => Rule.required().error('Section subtitle is required'),
    }),
    defineField({
      name: 'viewAllText',
      title: '"View All" Button Text',
      description: 'Text for the link to view all projects (e.g. "Veure tots")',
      type: 'localeString',
      validation: (Rule) => Rule.required().error('"View All" text is required'),
    }),
    defineField({
      name: 'viewProjectText',
      title: 'Cursor Project Text',
      description: 'Text that appears in the custom cursor when hovering over projects (e.g. "Veure projecte")',
      type: 'localeString',
      validation: (Rule) => Rule.required().error('Cursor project text is required'),
    }),
    defineField({
      name: 'featuredProjects',
      title: 'Select Featured Projects',
      description: 'Choose and arrange the 6 projects to feature on the homepage',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'project'}],
          options: {
            disableNew: false,
          },
        },
      ],
      validation: (Rule) => Rule.max(6).error('Maximum of 6 featured projects allowed'),
    }),
  ],
  preview: {
    select: {
      title: baseLanguage ? `title.${baseLanguage.id}` : 'title.ca',
      subtitle: baseLanguage ? `subtitle.${baseLanguage.id}` : 'subtitle.ca',
    },
    prepare({ title, subtitle }) {
      return {
        title: 'Projects Section',
        subtitle: title || 'No title set',
      }
    },
  },
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
