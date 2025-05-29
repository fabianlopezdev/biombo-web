// Removed page import as this schema has been deleted
import { localeString } from './localeString'
import { localePortableText } from './localePortableText'
import { localeSlug } from './localeSlug'
import { header, navigationItemType } from './header'
import { homePage, heroSection, projectsSection, aboutSection, servicesSection } from './homePage'
import { projects } from './projects'
import { siteSettings } from './siteSettings'
import { projectsPage } from './projectsPage'
import { aboutUsPage } from './aboutUsPage'
import { contactPage } from './contactPage'

export const schemaTypes = [
  // Documents
  header,
  homePage,
  projects,
  siteSettings,
  projectsPage,
  aboutUsPage,
  contactPage,

  // Objects
  localeString,
  localePortableText,
  localeSlug,
  navigationItemType,
  heroSection,
  projectsSection,
  aboutSection,
  servicesSection,
]
