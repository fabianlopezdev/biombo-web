import { page } from './page'
import { localeString } from './localeString'
import { localePortableText } from './localePortableText'
import { header, navigationItemType } from './header'

export const schemaTypes = [
  // Documents
  page,
  header,
  
  // Objects
  localeString,
  localePortableText,
  navigationItemType,
]
