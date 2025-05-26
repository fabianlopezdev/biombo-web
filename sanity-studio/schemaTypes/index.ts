import { page } from './page'
import { localeString } from './localeString'
import { localePortableText } from './localePortableText'
import { localeSlug } from './localeSlug'
import { header, navigationItemType } from './header'
import { homePage, heroSection, projectsSection, aboutSection, servicesSection } from './homePage'
import { project } from './project'

export const schemaTypes = [
  // Documents
  page,
  header,
  homePage,
  project,
  
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
