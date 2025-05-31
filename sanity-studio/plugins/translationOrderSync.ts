/**
 * Translation Order Synchronization Plugin
 * 
 * This plugin ensures that when one language variant of a project is reordered,
 * all other language variants of the same document are reordered in the same way.
 * 
 * It hooks into document changes, detects orderRank updates, and applies them
 * to all related translations using document-internationalization's metadata.
 */
import { definePlugin } from 'sanity'

interface TranslationMetadata {
  _id: string
  _type: string
  translations?: Array<{
    _key: string
    _type: string
    language: string
    value: {
      _ref: string
      _type: string
    }
  }>
}

interface DocumentWithLanguage {
  _id: string
  _type: string
  language?: string
}

/**
 * Translation synchronization plugin for orderable documents
 */
export const translationOrderSync = definePlugin(() => ({
  name: 'translation-order-sync',
  document: {
    /**
     * Hook that runs after a document is changed
     * We use this to detect when orderRank is updated and sync it to translations
     */
    afterChange: async (args: { documentId: string; patch: any; client: any }) => {
      const { documentId, patch, client } = args
      
      // Only proceed if the change includes orderRank (reordering)
      if (!patch.hasOwnProperty('orderRank')) {
        return
      }
      
      try {
        // Get the full document that was changed
        const document = await client.getDocument(documentId)
        
        // Only handle project documents
        if (!document || document._type !== 'project') {
          return
        }
        
        console.log(`[OrderSync] Project document ${documentId} orderRank changed`)
        
        // Find all translations of this document
        const translations = await findTranslations(client, document)
        
        if (translations.length === 0) {
          console.log('[OrderSync] No translations found to sync')
          return
        }
        
        console.log(`[OrderSync] Found ${translations.length} translation(s) to update`)
        
        // Update the orderRank for all translations
        await updateTranslationsOrderRank(client, translations, patch.orderRank, documentId)
        
        console.log('[OrderSync] Successfully updated translations orderRank')
      } catch (error) {
        console.error('[OrderSync] Error synchronizing translation order:', error)
      }
    }
  }
}))

/**
 * Find all translations of a document using the document-internationalization metadata
 */
async function findTranslations(client: any, document: DocumentWithLanguage): Promise<string[]> {
  // Skip if the document has no language field
  if (!document.language) {
    return []
  }
  
  try {
    // First, query for the metadata document that links all translations
    // The metadata ID follows the pattern: drafts.translation.metadata.<doctype>.<baseid>
    
    // Remove 'drafts.' prefix if present to get the base document ID
    const baseDocId = document._id.replace(/^drafts\./, '')
    
    // Query for metadata document using GROQ
    const metadataQuery = `*[_type == "translation.metadata" && 
      translations[].value._ref in [$docId, "drafts.${baseDocId}", "${baseDocId}"]][0]`
    
    // Use type assertion instead of generic type parameter
    const metadata = await client.fetch(metadataQuery, {
      docId: document._id
    })
    
    if (!metadata || !metadata.translations) {
      console.log('[OrderSync] No translation metadata found')
      return []
    }
    
    // Type assertion for proper TypeScript handling
    const typedMetadata = metadata as TranslationMetadata
    
    // We've already checked that translations exists above, but TypeScript needs reassurance
    const translations = typedMetadata.translations || []
    
    // Extract all translation document IDs except the current one
    return translations
      .map((t: any) => t.value._ref)
      .filter((id: string) => id !== document._id)
  } catch (error) {
    console.error('[OrderSync] Error finding translations:', error)
    return []
  }
}

/**
 * Update the orderRank field for all translations
 */
async function updateTranslationsOrderRank(
  client: any, 
  translations: string[], 
  newOrderRank: string,
  originalDocId: string
): Promise<void> {
  // Update each translation's orderRank in parallel
  await Promise.all(
    translations.map(async (translationId) => {
      try {
        // Skip the original document which was already updated
        if (translationId === originalDocId) return
        
        // Update the translation with the new orderRank
        await client
          .patch(translationId)
          .set({ orderRank: newOrderRank })
          .commit()
        
        console.log(`[OrderSync] Updated translation ${translationId}`)
      } catch (error) {
        console.error(`[OrderSync] Failed to update translation ${translationId}:`, error)
      }
    })
  )
}
