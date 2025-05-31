import { defineField, defineType } from 'sanity'

/**
 * Predefined service categories with translations
 * These can be used as initial values when creating new categories
 */
export const serviceCategoryOptions = {
  webDesign: {
    ca: {
      title: 'Disseny Web',
      description: 'Creació de llocs web atractius i funcionals que representen la teva marca.'
    },
    es: {
      title: 'Diseño Web',
      description: 'Creación de sitios web atractivos y funcionales que representan tu marca.'
    },
    en: {
      title: 'Web Design',
      description: 'Creating attractive and functional websites that represent your brand.'
    }
  },
  branding: {
    ca: {
      title: 'Branding',
      description: 'Desenvolupament d\'identitat de marca, logotips i guies d\'estil.'
    },
    es: {
      title: 'Branding',
      description: 'Desarrollo de identidad de marca, logotipos y guías de estilo.'
    },
    en: {
      title: 'Branding',
      description: 'Brand identity development, logos, and style guides.'
    }
  },
  uxui: {
    ca: {
      title: 'Disseny UX/UI',
      description: 'Creació d\'interfícies d\'usuari intuïtives i experiències atractives.'
    },
    es: {
      title: 'Diseño UX/UI',
      description: 'Creación de interfaces de usuario intuitivas y experiencias atractivas.'
    },
    en: {
      title: 'UX/UI Design',
      description: 'Creating intuitive user interfaces and engaging experiences.'
    }
  },
  ecommerce: {
    ca: {
      title: 'E-commerce',
      description: 'Desenvolupament de botigues en línia optimitzades per a les vendes.'
    },
    es: {
      title: 'E-commerce',
      description: 'Desarrollo de tiendas online optimizadas para ventas.'
    },
    en: {
      title: 'E-commerce',
      description: 'Development of online stores optimized for sales.'
    }
  },
  motionDesign: {
    ca: {
      title: 'Motion Design',
      description: 'Animacions i elements visuals dinàmics per a web i xarxes socials.'
    },
    es: {
      title: 'Motion Design',
      description: 'Animaciones y elementos visuales dinámicos para web y redes sociales.'
    },
    en: {
      title: 'Motion Design',
      description: 'Animations and dynamic visual elements for web and social media.'
    }
  },
  contentStrategy: {
    ca: {
      title: 'Estratègia de Contingut',
      description: 'Planificació i desenvolupament de contingut per atraure i retenir clients.'
    },
    es: {
      title: 'Estrategia de Contenido',
      description: 'Planificación y desarrollo de contenido para atraer y retener clientes.'
    },
    en: {
      title: 'Content Strategy',
      description: 'Planning and developing content to attract and retain customers.'
    }
  },
  seo: {
    ca: {
      title: 'SEO',
      description: 'Optimització per a motors de cerca per millorar la visibilitat en línia.'
    },
    es: {
      title: 'SEO',
      description: 'Optimización para motores de búsqueda para mejorar la visibilidad online.'
    },
    en: {
      title: 'SEO',
      description: 'Search engine optimization to improve online visibility.'
    }
  },
  webDevelopment: {
    ca: {
      title: 'Desenvolupament Web',
      description: 'Programació i desenvolupament tècnic de llocs web i aplicacions.'
    },
    es: {
      title: 'Desarrollo Web',
      description: 'Programación y desarrollo técnico de sitios web y aplicaciones.'
    },
    en: {
      title: 'Web Development',
      description: 'Programming and technical development of websites and applications.'
    }
  }
}

/**
 * Schema for service categories
 * @description Categories of services that can be referenced by projects
 */
export const serviceCategory = defineType({
  name: 'serviceCategory',
  title: 'Service Categories',
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
      type: 'string',
      description: 'Name of the service category (e.g., "Web Design", "Branding")',
      validation: (Rule) => Rule.required().error('A service category title is required'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of this service category',
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      language: 'language',
    },
    prepare(selection) {
      const { title, subtitle, language } = selection
      return {
        title: title || 'Untitled Service Category',
        subtitle: language ? `${subtitle ? `${subtitle} • ` : ''}Language: ${language}` : subtitle,
      }
    },
  },
})
