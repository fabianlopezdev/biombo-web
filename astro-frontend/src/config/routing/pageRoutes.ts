// Route configuration for dynamic page routing
// Using clear Catalan naming to distinguish routes

export type PageLayout =
  | 'Homepage'
  | 'AboutUs'
  | 'Services'
  | 'Contact'
  | 'ProjectsLayout'
  | 'ProjectsPageWrapper'

interface RouteConfig {
  layout: PageLayout
  // Optional: for pages that need special props
  props?: Record<string, unknown>
}

// Map Catalan page names to their layouts
export const catalanPageRoutes: Record<string, RouteConfig> = {
  nosaltres: { layout: 'AboutUs' },
  serveis: { layout: 'Services' },
  contacte: { layout: 'Contact' },
  projectes: { layout: 'ProjectsPageWrapper' },
}

// Map other language routes to their layouts
// Structure: [lang]/[page] => layout
export const otherLanguageRoutes: Record<string, Record<string, RouteConfig>> = {
  en: {
    'about-us': { layout: 'AboutUs' },
    services: { layout: 'Services' },
    contact: { layout: 'Contact' },
    projects: { layout: 'ProjectsPageWrapper' },
  },
  es: {
    nosotros: { layout: 'AboutUs' },
    servicios: { layout: 'Services' },
    contacto: { layout: 'Contact' },
    proyectos: { layout: 'ProjectsPageWrapper' },
  },
}

export function getLayoutForCatalanPage(pagina: string): PageLayout | null {
  const route = catalanPageRoutes[pagina]
  return route ? route.layout : null
}

export function getLayoutForOtherLanguagePage(lang: string, page: string): PageLayout | null {
  const langRoutes = otherLanguageRoutes[lang]
  if (!langRoutes) return null

  const route = langRoutes[page]
  return route ? route.layout : null
}

// Helper to get all valid Catalan page names
export function getCatalanPageNames(): string[] {
  return Object.keys(catalanPageRoutes)
}

// Helper to get all valid page names for a language
export function getPageNamesForLanguage(lang: string): string[] {
  const langRoutes = otherLanguageRoutes[lang]
  return langRoutes ? Object.keys(langRoutes) : []
}

// TypeScript types for Astro static paths
export interface CatalanStaticPath {
  params: { pagines: string }
  props: { pagina: string; locale: 'ca' }
}

export interface OtherLanguageStaticPath {
  params: { lang: string; pages: string }
  props: { lang: string; page: string; locale: string }
}
