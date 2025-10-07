/**
 * Page Metadata for SEO
 * Contains titles and descriptions for all pages in all supported languages
 */

export type Locale = 'ca' | 'es' | 'en'

interface PageMetadata {
  title: string
  description: string
}

type PageMetadataCollection = {
  [K in Locale]: PageMetadata
}

export const pageMetadata = {
  homepage: {
    en: {
      title: 'Creative Graphic Design & Branding Studio in Granollers (Barcelona) | Biombo Studio',
      description:
        'Biombo Studio is a creative graphic design agency in Granollers, Barcelona province, specializing in branding & identity, web/UX design, art direction, and illustration. Contact us today to bring your vision to life.',
    },
    es: {
      title: 'Agencia de Diseño Gráfico en Granollers (Barcelona) | Biombo Studio',
      description:
        'Biombo Studio es una agencia creativa en Granollers (provincia de Barcelona) especializada en branding, identidad corporativa, diseño web y UX/UI, dirección de arte e ilustración. Contáctanos y da vida a tu marca.',
    },
    ca: {
      title: 'Estudi de Disseny Gràfic a Granollers (Barcelona) | Biombo Studio',
      description:
        "Biombo Studio és un estudi creatiu a Granollers (província de Barcelona) especialitzat en branding, identitat corporativa, disseny web i UX/UI, direcció d'art i il·lustració. Contacta'ns i dona vida a la teva marca.",
    },
  } as PageMetadataCollection,

  services: {
    en: {
      title:
        'Branding, Web Design, UX/UI & More – Services in Granollers (Barcelona) | Biombo Studio',
      description:
        'Explore our full range of design services – from branding and corporate identity to web design, UX/UI, art direction, and illustration. Biombo Studio serves Granollers and the Barcelona area to elevate your brand.',
    },
    es: {
      title: 'Branding, Diseño Web y UX/UI en Granollers (Barcelona) – Servicios | Biombo Studio',
      description:
        'Explora nuestros servicios de diseño: branding e identidad corporativa, diseño web, UX/UI, dirección de arte e ilustración. Biombo Studio trabaja en Granollers y el área de Barcelona para potenciar tu marca.',
    },
    ca: {
      title:
        'Branding, Disseny Web, UX/UI i Més a Granollers (Barcelona) – Serveis | Biombo Studio',
      description:
        "Descobreix els nostres serveis de disseny: branding i identitat corporativa, disseny web, UX/UI, direcció d'art i il·lustració. Biombo Studio treballa a Granollers i l'àrea de Barcelona per potenciar la teva marca.",
    },
  } as PageMetadataCollection,

  projects: {
    en: {
      title: 'Design Portfolio – Projects in Granollers & Barcelona | Biombo Studio',
      description:
        "Browse our portfolio of graphic design projects, including branding, website design, and illustration work for clients across Granollers, Barcelona, and beyond. See the creative solutions we've delivered.",
    },
    es: {
      title: 'Portafolio de Diseño – Proyectos en Granollers y Barcelona | Biombo Studio',
      description:
        'Explora nuestro portafolio de proyectos de diseño gráfico, incluyendo branding, diseño web e ilustración para clientes de Granollers, Barcelona y más allá. Inspírate con nuestras soluciones creativas.',
    },
    ca: {
      title: 'Portafoli de Disseny – Projectes a Granollers i Barcelona | Biombo Studio',
      description:
        "Explora el nostre portafoli de projectes de disseny gràfic, incloent branding, disseny web i il·lustració per a clients de Granollers, Barcelona i més enllà. Inspira't amb les nostres solucions creatives.",
    },
  } as PageMetadataCollection,

  about: {
    en: {
      title: 'About Biombo Studio – Creative Design Agency in Granollers (Barcelona)',
      description:
        'Meet the team behind Biombo Studio, a leading graphic design studio in Granollers (Barcelona). Learn about our mission, our creative approach to branding and web design, and why businesses trust us.',
    },
    es: {
      title: 'Sobre Biombo Studio – Agencia de Diseño Creativo en Granollers (Barcelona)',
      description:
        'Conoce al equipo detrás de Biombo Studio, un estudio de diseño gráfico líder en Granollers (Barcelona). Descubre nuestra misión, nuestro enfoque creativo en branding y diseño web, y por qué confían en nosotros.',
    },
    ca: {
      title: 'Sobre Biombo Studio – Estudi de Disseny Creatiu a Granollers (Barcelona)',
      description:
        "Coneix l'equip darrere de Biombo Studio, un estudi de disseny gràfic líder a Granollers (Barcelona). Descobreix la nostra missió, el nostre enfocament creatiu en branding i disseny web, i per què confien en nosaltres.",
    },
  } as PageMetadataCollection,

  contact: {
    en: {
      title: 'Contact Us | Biombo Studio – Granollers (Barcelona) Design Studio',
      description:
        "Get in touch with Biombo Studio, your local Granollers (Barcelona) design agency, to discuss your project or request a quote. We're ready to help with branding, web, UX/UI design and more.",
    },
    es: {
      title: 'Contáctanos | Biombo Studio – Estudio de Diseño en Granollers (Barcelona)',
      description:
        'Ponte en contacto con Biombo Studio, tu agencia de diseño en Granollers (Barcelona), para hablar de tu proyecto o solicitar un presupuesto. Estamos listos para ayudarte con branding, diseño web, UX/UI y más.',
    },
    ca: {
      title: "Contacta'ns | Biombo Studio – Estudi de Disseny a Granollers (Barcelona)",
      description:
        "Posa't en contacte amb Biombo Studio, la teva agència de disseny a Granollers (Barcelona), per parlar del teu projecte o sol·licitar un pressupost. Estem a punt per ajudar-te amb branding, disseny web, UX/UI i més.",
    },
  } as PageMetadataCollection,
}

export type PageKey = keyof typeof pageMetadata

/**
 * Get metadata for a specific page and locale
 * @param page - The page key
 * @param locale - The locale (ca, es, en)
 * @returns The page metadata
 */
export function getPageMetadata(page: PageKey, locale: Locale): PageMetadata {
  return pageMetadata[page][locale]
}

/**
 * Generate dynamic metadata for a project page
 * @param project - The project object from Sanity
 * @param locale - The current locale (ca, es, en)
 * @param portableTextToPlainText - Function to convert PortableText to plain text
 * @returns PageMetadata with dynamic title and description
 */
export function generateProjectMetadata(
  project: {
    title: string
    mainText?: unknown[]
    services?: Array<{ title: string }>
  },
  locale: Locale,
  portableTextToPlainText: (content: unknown[] | undefined, maxLength?: number) => string,
): PageMetadata {
  const MAX_TITLE_LENGTH = 60
  const STUDIO_SUFFIX = ' | Biombo Studio'

  // Translations for "& more"
  const moreText = {
    ca: ' i més',
    es: ' y más',
    en: ' & more',
  }
  const MORE_SUFFIX = moreText[locale]

  // Build title with smart truncation to stay under 60 characters
  let title = project.title

  if (project.services && project.services.length > 0) {
    // Calculate available space for services
    const baseLength = project.title.length + STUDIO_SUFFIX.length + 3 // 3 for " – "
    const availableSpace = MAX_TITLE_LENGTH - baseLength

    if (project.services.length === 1) {
      // Single service - use it if it fits
      const singleService = project.services[0].title
      if (singleService.length <= availableSpace) {
        title = `${project.title} – ${singleService}${STUDIO_SUFFIX}`
      } else {
        title = `${project.title}${STUDIO_SUFFIX}`
      }
    } else if (project.services.length === 2) {
      // Two services - try to fit both
      const twoServices = `${project.services[0].title}, ${project.services[1].title}`
      if (twoServices.length <= availableSpace) {
        title = `${project.title} – ${twoServices}${STUDIO_SUFFIX}`
      } else {
        // Just show first service + locale-aware "& more"
        const firstService = project.services[0].title
        if (firstService.length <= availableSpace - MORE_SUFFIX.length) {
          title = `${project.title} – ${firstService}${MORE_SUFFIX}${STUDIO_SUFFIX}`
        } else {
          title = `${project.title}${STUDIO_SUFFIX}`
        }
      }
    } else {
      // 3+ services - show first service + locale-aware "& more" if it fits
      const firstService = project.services[0].title
      if (firstService.length <= availableSpace - MORE_SUFFIX.length) {
        title = `${project.title} – ${firstService}${MORE_SUFFIX}${STUDIO_SUFFIX}`
      } else {
        title = `${project.title}${STUDIO_SUFFIX}`
      }
    }
  } else {
    title = `${project.title}${STUDIO_SUFFIX}`
  }

  // Ensure title doesn't exceed max length (final safety check)
  if (title.length > MAX_TITLE_LENGTH) {
    const excess = title.length - MAX_TITLE_LENGTH
    const projectTitleTruncated = project.title.slice(0, -(excess + 3))
    title = `${projectTitleTruncated}...${STUDIO_SUFFIX}`
  }

  // Convert project mainText to plain text for meta description
  const description = portableTextToPlainText(project.mainText, 160)

  return {
    title,
    description,
  }
}
