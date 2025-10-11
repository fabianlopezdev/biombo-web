// Removed page import as this schema has been deleted
import { localeString } from './localeString'
import { localePortableText } from './localePortableText'
import { localeSlug } from './localeSlug'
import { header, navigationItemType } from './header'
import { homePage, heroSection, projectsSection, aboutSection, servicesSection, clientsSection } from './homePage'
import { projects, imageSection, textBlock } from './projects'
import { siteSettings } from './siteSettings'
import { projectsPage } from './projectsPage'
import { servicesPage } from './servicesPage'
import { aboutUsPage, aboutSlider } from './aboutUsPage'
import { contactPage } from './contactPage'
import { legalPage } from './legalPage'
import { service } from './service'
import { client } from './client'
import { footer } from './footer'

export const schemaTypes = [
  // Documents
  header,
  homePage,
  projects,
  service,
  client,
  footer,
  siteSettings,
  projectsPage,
  servicesPage,
  aboutUsPage,
  contactPage,
  legalPage,

  // Objects
  localeString,
  localePortableText,
  localeSlug,
  navigationItemType,
  heroSection,
  projectsSection,
  aboutSection,
  servicesSection,
  clientsSection,
  aboutSlider,
  imageSection,
  textBlock,
]
