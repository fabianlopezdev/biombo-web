export const projectsTranslations = {
  ca: {
    pageTitle: 'Projectes',
    filterBy: 'Filtrar per:',
    clearFilters: 'Borrar filtres',
    viewProject: 'Veure projecte',
    noProjects: 'No hi ha projectes disponibles.',
    filterAriaLabel: 'Filtres de serveis',
    clearFiltersAriaLabel: 'Esborrar tots els filtres aplicats',
    projectListAriaLabel: 'Llista de projectes',
    screenReaderAnnouncements: {
      filtersActive: (count: number, visible: number) =>
        `${count} filtres actius. Mostrant ${visible} projectes.`,
      allProjectsShowing: (total: number) => `Mostrant tots els ${total} projectes.`,
    },
  },
  es: {
    pageTitle: 'Proyectos',
    filterBy: 'Filtrar por:',
    clearFilters: 'Borrar filtros',
    viewProject: 'Ver proyecto',
    noProjects: 'No hay proyectos disponibles.',
    filterAriaLabel: 'Filtros de servicios',
    clearFiltersAriaLabel: 'Borrar todos los filtros aplicados',
    projectListAriaLabel: 'Lista de proyectos',
    screenReaderAnnouncements: {
      filtersActive: (count: number, visible: number) =>
        `${count} filtros activos. Mostrando ${visible} proyectos.`,
      allProjectsShowing: (total: number) => `Mostrando todos los ${total} proyectos.`,
    },
  },
  en: {
    pageTitle: 'Projects',
    filterBy: 'Filter by:',
    clearFilters: 'Clear filters',
    viewProject: 'View project',
    noProjects: 'No projects available.',
    filterAriaLabel: 'Service filters',
    clearFiltersAriaLabel: 'Clear all applied filters',
    projectListAriaLabel: 'Projects list',
    screenReaderAnnouncements: {
      filtersActive: (count: number, visible: number) =>
        `${count} active filters. Showing ${visible} projects.`,
      allProjectsShowing: (total: number) => `Showing all ${total} projects.`,
    },
  },
}

export type Locale = keyof typeof projectsTranslations

export function getProjectUrl(slug: string, locale: Locale): string {
  // Strip language suffix if present (for non-Catalan languages)
  let cleanSlug = slug
  if (locale !== 'ca' && slug.endsWith(`-${locale}`)) {
    cleanSlug = slug.slice(0, -locale.length - 1) // Remove "-es" or "-en"
  }

  console.log('[getProjectUrl in config/i18n/projects.ts]')
  console.log('  Input slug:', slug)
  console.log('  Locale:', locale)
  console.log('  Clean slug:', cleanSlug)

  const baseUrls = {
    ca: '/projectes',
    es: '/es/proyectos',
    en: '/en/projects',
  }

  const url = `${baseUrls[locale]}/${cleanSlug}`
  console.log('  Final URL:', url)
  return url
}
