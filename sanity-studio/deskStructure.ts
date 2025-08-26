/**
 * Sanity Desk Structure with translated singletons and language nesting.
 */
import { type StructureResolver, ListItemBuilder } from 'sanity/structure'
import { LANGUAGES, SINGLETONS } from './constants/i18n'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { getLanguageIconFn } from './components/icons/LanguageFlags'

// All singleton _types that HAVE translations
const translatedSingletonTypes = SINGLETONS.map((s) => s._type)
// Add non-translated singleton types here
const singletonTypes = [...translatedSingletonTypes, 'siteSettings']

// Types to hide from the generic document list
const excludeTypes = ['page', 'media.tag', ...singletonTypes]

// Icon map for singleton documents
const singletonIcon = (id: string) => {
  const map: Record<string, string> = {
    header: '🧭',
    homePage: '🏠',
    projectsPage: '📂',
    aboutUsPage: '👥',
    contactPage: '📞',
  }
  return () => map[id] ?? '📄'
}

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      // ——————————— Translated Singletons ———————————
      ...SINGLETONS.map((singleton) =>
        S.listItem()
          .title(singleton.title)
          .id(singleton.id)
          .icon(singletonIcon(singleton.id))
          .child(
            S.list()
              .title(singleton.title)
              .id(`${singleton.id}-languages`)
              .items(
                LANGUAGES.map((lang) =>
                  S.documentListItem()
                    .schemaType(singleton._type)
                    .id(`${singleton.id}-${lang.id}`)
                    .title(`${singleton.title} (${lang.id.toUpperCase()})`)
                    .icon(getLanguageIconFn(lang.id)),
                ),
              )
              .canHandleIntent(
                (intentName, params) =>
                  intentName === 'edit' && params.id.startsWith(singleton.id),
              ),
          ),
      ),

      // Divider
      S.divider(),

      // ——————————— Regular Collections ———————————
      // Projects with drag-and-drop ordering
      S.listItem()
        .title('Projects')
        .icon(() => '🎨')
        .child(
          S.list()
            .title('Projects')
            .items([
              // Orderable document list for drag-and-drop ordering
              orderableDocumentListDeskItem({
                type: 'project',
                title: 'Projects',
                S,
                context,
              }),
              // Standard document list with search for finding projects
              S.divider(),
              S.listItem()
                .title('Search Projects')
                .icon(() => '🔍')
                .child(
                  S.documentTypeList('project')
                    .title('Search Projects')
                    .filter('_type == "project"')
                    .apiVersion('v2023-01-01')
                )
            ])
        ),

      // Service Categories organized by language
      S.listItem()
        .title('Service Categories')
        .icon(() => '🏷️')
        .child(
          S.list()
            .title('Service Categories')
            .items([
              // Create a separate draggable list for each language
              ...LANGUAGES.map((lang) =>
                orderableDocumentListDeskItem({
                  type: 'serviceCategory',
                  id: `orderable-serviceCategory-${lang.id}`,
                  title: `${lang.title} Service Categories`,
                  S,
                  context,
                  filter: '_type == "serviceCategory" && language == $language',
                  params: { language: lang.id },
                  icon: getLanguageIconFn(lang.id),
                })
              ),
            ])
        ),
        
      // Other document types
      ...S.documentTypeListItems().filter((listItem: ListItemBuilder) => {
        const id = listItem.getId()
        return id ? !excludeTypes.includes(id) && id !== 'project' && id !== 'serviceCategory' : true
      }),

      // Divider
      S.divider(),

      // ——————————— Non-translated singleton (Site Settings) ———————————
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .icon(() => '⚙️')
        .child(S.documentTypeList('siteSettings').title('Site Settings')),
    ])
