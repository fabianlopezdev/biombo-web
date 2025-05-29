/**
 * Sanity Studio V3 Structure Configuration
 *
 * This file configures the desk structure with singleton documents and filters
 * out document types we don't want to show in the regular list.
 */
import {type StructureResolver, ListItemBuilder} from 'sanity/structure'

// The list of singleton document types
const singletonTypes = ['homePage', 'header', 'siteSettings', 'projectsPage', 'aboutUsPage', 'contactPage']


// Types to exclude from the regular document list (singletons + removed types)
const excludeTypes = ['page', 'media.tag', ...singletonTypes]

export const structure: StructureResolver = (S) => {
  return S.list()
    .title('Content')
    .items([
      // Header singleton
      S.listItem()
        .title('Header')
        .id('header')
        .icon(() => '🧭')
        .child(S.document().schemaType('header').documentId('header')),

      // HomePage singleton
      S.listItem()
        .title('Home Page')
        .id('homePage')
        .icon(() => '🏠')
        .child(S.document().schemaType('homePage').documentId('homePage')),

        // Projects Page singleton
        S.listItem()
          .title('Projects Page')
          .id('projectsPage')
          .icon(() => '📂')
          .child(S.document().schemaType('projectsPage').documentId('projectsPage')),
  
        // About Us Page singleton
        S.listItem()
          .title('About Us Page')
          .id('aboutUsPage')
          .icon(() => '👥')
          .child(S.document().schemaType('aboutUsPage').documentId('aboutUsPage')),
  
        // Contact Page singleton
        S.listItem()
          .title('Contact Page')
          .id('contactPage')
          .icon(() => '📞')
          .child(S.document().schemaType('contactPage').documentId('contactPage')),
      // Divider
      S.divider(),

      // Filter out singletons and removed types from regular list
      ...S.documentTypeListItems().filter((listItem: ListItemBuilder) => {
        const id = listItem.getId()
        return id ? !excludeTypes.includes(id) : true
      }),

      // Divider
      S.divider(),


      // Site Settings singleton
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .icon(() => '⚙️')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
}
