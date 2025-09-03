import {defineConfig, definePlugin} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {media} from 'sanity-plugin-media'
import {structure} from './deskStructure'
import {colorInput} from '@sanity/color-input'
import {documentInternationalization} from '@sanity/document-internationalization'
import {SINGLETONS} from './constants/i18n'
import {translationOrderSync} from './plugins/translationOrderSync'
import {BulkDelete} from 'sanity-plugin-bulk-delete'

// Restrict new-doc options and actions for singleton types
const restrictDocs = definePlugin({
  name: 'restrict-docs',
  document: {
    newDocumentOptions: (prev) =>
      prev.filter(
        (item) =>
          item.templateId !== 'media.tag' &&
          !SINGLETONS.some((s) => s._type === item.templateId),
      ),
    actions: (prev, {schemaType}) =>
      SINGLETONS.some((s) => s._type === schemaType)
        ? prev.filter(({action}) => action !== 'delete' && action !== 'duplicate')
        : prev,
  },
})

export default defineConfig({
  name: 'default',
  title: 'Biombo Studio Website',

  projectId: '08xgag7z',
  dataset: 'production',
  apiVersion: 'v2023-01-01', // Add consistent API version for all queries

  // Document options now handled by the restrictDocs plugin
  


  plugins: [
    // Use the custom structure from deskStructure.ts
    structureTool({structure}),
    // Add the plugin to restrict new-doc options and actions for singleton types
    restrictDocs,
    visionTool(),
    // Configure the media plugin
    media(),
    colorInput(),
    // Sync translation ordering when documents are reordered
    translationOrderSync(),
    // Add bulk delete functionality with safety checks
    BulkDelete({
      schemaTypes: schemaTypes,
    }),
    documentInternationalization({
      supportedLanguages: [
        // First language in the array will be the default one
        {id: 'ca', title: 'Català'},
        {id: 'es', title: 'Español'},
        {id: 'en', title: 'English'},
      ],
      // Explicitly list document types that should be internationalized
      schemaTypes: [
        'project', 
        'serviceCategory', 
        'homePage', 
        'header',
        'footer',
        'projectsPage',
        'servicesPage', 
        'aboutUsPage', 
        'contactPage'
      ],
      // Field name that will store the language
      languageField: 'language',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
