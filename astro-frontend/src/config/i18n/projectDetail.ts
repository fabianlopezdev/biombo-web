export const projectDetailTranslations = {
  ca: {
    client: 'Client:',
    services: 'Serveis:',
    viewProject: 'Veure projecte',
    similarProjects: 'Projectes similars',
    viewAll: 'Veure tots els projectes',
    clientInfoLabel: 'Informació del client',
    projectDetailsLabel: 'Detalls del projecte',
    notAvailable: 'N/A',
  },
  en: {
    client: 'Client:',
    services: 'Services:',
    viewProject: 'View project',
    similarProjects: 'Similar projects',
    viewAll: 'View all projects',
    clientInfoLabel: 'Client information',
    projectDetailsLabel: 'Project details',
    notAvailable: 'N/A',
  },
  es: {
    client: 'Cliente:',
    services: 'Servicios:',
    viewProject: 'Ver proyecto',
    similarProjects: 'Proyectos similares',
    viewAll: 'Ver todos los proyectos',
    clientInfoLabel: 'Información del cliente',
    projectDetailsLabel: 'Detalles del proyecto',
    notAvailable: 'N/A',
  },
} as const

export type ProjectLocale = keyof typeof projectDetailTranslations

export function getProjectTranslations(locale: string) {
  const validLocale = locale as ProjectLocale
  return projectDetailTranslations[validLocale] || projectDetailTranslations.ca
}
