import { page } from './page'
import { localeString } from './localeString'
import { localePortableText } from './localePortableText'
import { header, navigationItemType } from './header'
import { homePage, heroSection, projectsSection, aboutSection, servicesSection } from './homePage'

export const schemaTypes = [
  // Documents
  page,
  header,
  homePage,
  
  // Objects
  localeString,
  localePortableText,
  navigationItemType,
  heroSection,
  projectsSection,
  aboutSection,
  servicesSection,
]
