import {defineConfig, definePlugin} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {media} from 'sanity-plugin-media'
import {structure} from './deskStructure'
import {colorInput} from '@sanity/color-input'
import {documentInternationalization} from '@sanity/document-internationalization'

// Define a plugin to remove the media.tag from New Document menu
const removeMediaTag = definePlugin({
  name: 'remove-media-tag',
  document: {
    // Hide media.tag from new document options
    newDocumentOptions: (prev) => {
      return prev.filter((templateItem) => templateItem.templateId !== 'media.tag')
    },
  },
})

export default defineConfig({
  name: 'default',
  title: 'Biombo Studio Website',

  projectId: '08xgag7z',
  dataset: 'production',

  // Document options now handled by the removeMediaTag plugin

  plugins: [
    // Use the custom structure from deskStructure.ts
    structureTool({structure}),
    // Add the plugin to remove media.tag from new document options
    removeMediaTag,
    visionTool(),
    // Configure the media plugin
    media(),
    colorInput(),
    documentInternationalization({
      supportedLanguages: [
        // First language in the array will be the default one
        {id: 'ca', title: 'Català'},
        {id: 'es', title: 'Español'},
        {id: 'en', title: 'English'},
      ],
      // Explicitly list document types that should be internationalized
      schemaTypes: ['project', 'homePage', 'header'],
      // Field name that will store the language
      languageField: 'language',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
