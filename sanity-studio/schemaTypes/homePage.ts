import {defineField, defineType, ReferenceFilterResolverContext} from 'sanity'
// No longer need baseLanguage import with document-level internationalization

// Schema for the Hero section
export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heroText',
      title: 'Main Heading',
      description:
        'The large heading text at the top of the page. Use **bold** to mark which word should be highlighted with the underline effect (e.g., "Transformem **idees** en solucions"). Press Enter to create line breaks for multi-line titles.',
      type: 'text', // Changed from string to text to support multi-line input
      rows: 3, // Show 3 rows in the editor for better editing experience
      validation: (Rule) => Rule.required().error('The hero heading text is required'),
    }),
    defineField({
      name: 'scrollText',
      title: 'Scroll Text',
      description: 'Text that appears next to the scroll icon (e.g., "Explora fent scroll")',
      type: 'string', // Changed from localeString to string
    }),
  ],
  preview: {
    select: {
      heroText: 'heroText',
    },
    prepare(selection) {
      const {heroText} = selection
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
      type: 'string', // Changed from localeString to string
      validation: (Rule) => Rule.required().error('Section title is required'),
    }),
    defineField({
      name: 'subtitle',
      title: 'Section Subtitle',
      description: 'The smaller subtitle for the projects section (e.g. "Projectes Destacats")',
      type: 'string', // Changed from localeString to string
      validation: (Rule) => Rule.required().error('Section subtitle is required'),
    }),
    defineField({
      name: 'viewAllText',
      title: '"View All" Button Text',
      description: 'Text for the link to view all projects (e.g. "Veure tots")',
      type: 'string', // Changed from localeString to string
      validation: (Rule) => Rule.required().error('"View All" text is required'),
    }),
    defineField({
      name: 'viewProjectText',
      title: 'Cursor Project Text',
      description:
        'Text that appears in the custom cursor when hovering over projects (e.g. "Veure projecte")',
      type: 'string', // Changed from localeString to string
      validation: (Rule) => Rule.required().error('Cursor project text is required'),
    }),
    defineField({
      name: 'featuredProjects',
      title: 'Select Featured Projects',
      description: 'Choose and arrange the 6 projects to feature on the homepage',
      type: 'array',
      of: [
        {
          name: 'featuredProjectItem',
          type: 'object',
          fields: [
            {
              name: 'project',
              title: 'Project',
              type: 'reference',
              to: [{type: 'project'}],
              options: {
                disableNew: false, // Keep existing options if relevant
                filter: ({document, parent}: ReferenceFilterResolverContext) => {
                  const homePageDoc = document as any // Root homePage document
                  const currentFeaturedItemKey = (parent as any)?._key as string | undefined // _key of the current featuredProjectItem

                  const language = homePageDoc?.language

                  let filterClauses = ['_type == "project"']
                  const params: {language?: string; selectedProjectIds?: string[]} = {}

                  // Apply language filter
                  if (language) {
                    filterClauses.push('language == $language')
                    params.language = language
                  } else {
                    // Fallback language if not found on homePageDoc, though this should ideally always be present
                    console.warn(
                      'Language not found on HomePage document for project filter, defaulting to "ca".',
                    )
                    filterClauses.push('language == "ca"')
                  }

                  // Apply filter to exclude already selected projects
                  // Root cause of duplicate prevention failure: Incorrect path to featuredProjects array.
                  // Corrected path: homePageDoc.projects is the 'Projects Section' object, which then contains featuredProjects.
                  const allFeaturedProjects = homePageDoc?.projects?.featuredProjects
                  if (Array.isArray(allFeaturedProjects) && currentFeaturedItemKey) {
                    const selectedProjectIds = allFeaturedProjects
                      .filter(
                        (item: any) => item._key !== currentFeaturedItemKey && item.project?._ref,
                      )
                      .map((item: any) => item.project._ref)

                    if (selectedProjectIds.length > 0) {
                      filterClauses.push('!(_id in $selectedProjectIds)')
                      params.selectedProjectIds = selectedProjectIds
                    }
                  } else if (Array.isArray(allFeaturedProjects) && !currentFeaturedItemKey) {
                    // If it's a new item (no key yet), exclude all already selected projects
                    const selectedProjectIds = allFeaturedProjects
                      .filter((item: any) => item.project?._ref)
                      .map((item: any) => item.project._ref)
                    if (selectedProjectIds.length > 0) {
                      filterClauses.push('!(_id in $selectedProjectIds)')
                      params.selectedProjectIds = selectedProjectIds
                    }
                  }

                  return {
                    filter: filterClauses.join(' && '),
                    params,
                  }
                },
                noResultsText:
                  'No projects available for the selected language or no language set on Home Page.',
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'hoverColor',
              title: 'Hover Color',
              type: 'color',
              options: {
                disableAlpha: true,
              },
            },
            {
              name: 'textHoverColor',
              title: 'Text Hover Color',
              type: 'color',
              options: {
                disableAlpha: true,
              },
            },
          ],
          preview: {
            select: {
              // Root cause of previous title issue: 'project.title' is a string, not a localized object.
              // Similarly, 'project.slug' is a standard slug object.
              // Corrected paths to select the actual title and slug string.
              actualProjectTitle: 'project.title',
              projectSlugString: 'project.slug.current',
              hoverColorValue: 'hoverColor.hex',
              textHoverColorValue: 'textHoverColor.hex',
              media: 'project.mainImage', // This was working correctly
            },
            prepare({
              actualProjectTitle,
              projectSlugString,
              hoverColorValue,
              textHoverColorValue,
              media,
            }) {
              // Rationale for fix: Use the directly selected project title, then slug string, then default text.
              const title = actualProjectTitle || projectSlugString || 'No project selected'
              let subtitles = []
              if (hoverColorValue) subtitles.push(`Hover: ${hoverColorValue}`)
              if (textHoverColorValue) subtitles.push(`Text Hover: ${textHoverColorValue}`)
              const subtitle = subtitles.length > 0 ? subtitles.join(' | ') : 'No colors set'
              return {
                title: title,
                subtitle: subtitle,
                media: media, // Display project's image in preview
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(6).error('Maximum of 6 featured projects allowed'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
    },
    prepare({title, subtitle}) {
      return {
        title: 'Projects Section',
        subtitle: title || 'No title set',
      }
    },
  },
})

// Schema for the About section (MODIFIED)
export const aboutSection = defineType({
  name: 'aboutSection',
  title: 'About Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string', // Stays as string for document-level i18n
      validation: (Rule) => Rule.required().error('The about section title is required.'),
    }),
    defineField({
      name: 'description',
      title: 'Descriptive Paragraph',
      type: 'array', // For Sanity's Portable Text/Block Content
      of: [
        {
          type: 'block',
          // You can customize styles and marks here if needed,
          // e.g., styles: [{title: 'Normal', value: 'normal'}],
          // lists: [{title: 'Bullet', value: 'bullet'}],
          // marks: {decorators: [{title: 'Strong', value: 'strong'}, {title: 'Emphasis', value: 'em'}]}
        },
      ],
      validation: (Rule) => Rule.required().error('The descriptive paragraph is required.'),
    }),
    defineField({
      name: 'images',
      title: 'Image Slider/Carousel',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true, // Enables image hotspot for better cropping
          },
          // No custom fields needed for image meta-information as Sanity Media Plugin is in use.
        },
      ],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('At least one image is required for the about section slider/carousel.'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'images.0.asset', // Show the first image as media preview
    },
    prepare({title, media}) {
      return {
        title: title || 'About Section',
        subtitle: title ? 'About Section Content' : 'No title set',
        media: media,
      }
    },
  },
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
      type: 'string', // Changed from localeString to string
    }),
    defineField({
      name: 'subtitle',
      title: 'Section Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      description: 'Short descriptive text for the services section',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'selectedCategories',
      title: 'Select Service Categories',
      description: 'Pick and order the service categories to display on the homepage',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'serviceCategory'}],
          options: {
            // Filter by the language of the Home Page document
            // and exclude already selected categories to avoid duplicates
            filter: ({document, parent}: ReferenceFilterResolverContext) => {
              const homePageDoc = document as any
              const language = homePageDoc?.language
              const alreadySelected = Array.isArray(parent)
                ? parent.map((item: any) => item?._ref).filter(Boolean)
                : []

              const filterParts = ['_type == "serviceCategory"']
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
              'No categories for this language. Create new service categories or change the language.',
          },
        },
      ],
    }),
  ],
})

// Main HomePage schema - This is a singleton document managed by the desk structure
export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
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
      name: 'hero',
      title: 'Hero Section',
      type: 'heroSection',
      description: 'The main banner section at the top of the homepage',
      validation: (Rule) => Rule.required().error('The hero section is required.'),
      options: {
        collapsible: false, // Don't allow collapsing this section
        collapsed: false, // Start expanded
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
    select: {
      language: 'language',
    },
    prepare(selection) {
      const {language} = selection
      return {
        title: `Home Page (${(language || '').toUpperCase()})`,
        subtitle: 'Landing page content',
      }
    },
  },
})
