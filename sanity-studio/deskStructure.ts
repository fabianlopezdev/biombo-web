/**
 * Sanity Studio V3 Structure Configuration
 *
 * This file configures the desk structure with singleton documents and filters
 * out document types we don't want to show in the regular list.
 */
import {type StructureResolver, ListItemBuilder} from 'sanity/structure'

// The list of singleton document types
const singletonTypes = ['homePage', 'header']

// Types to exclude from the regular document list (singletons + removed types)
// Also exclude any schema types from plugins that we don't want to show
const excludeTypes = [
  'page', // Removed document type
  'media.tag', // Hide media plugin tag type
  ...singletonTypes, // Hide singleton document types
]

export const structure: StructureResolver = (S) => {
  return S.list()
    .title('Content')
    .items([
      // Header singleton
      S.listItem()
        .title('Header')
        .id('header')
        .icon(() => '🧭') // 🧭 icon
        .child(S.document().schemaType('header').documentId('header')),

      // HomePage singleton
      S.listItem()
        .title('Home Page')
        .id('homePage')
        .icon(() => '🏠') // 🏠 icon
        .child(S.document().schemaType('homePage').documentId('homePage')),

      // Divider
      S.divider(),

      // Filter out singletons and removed types from regular list
      ...S.documentTypeListItems().filter((listItem: ListItemBuilder) => {
        const id = listItem.getId()
        return id ? !excludeTypes.includes(id) : true
      }),
    ])
}
