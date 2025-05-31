/**
 * Utility to create service categories with predefined translations
 * 
 * Usage in the Sanity Studio console:
 * 
 * 1. Import the utility and options:
 *    import { createPredefinedCategory } from '../utils/createPredefinedCategory'
 *    import { serviceCategoryOptions } from '../schemaTypes/serviceCategory'
 * 
 * 2. Create a category (example for Web Design):
 *    createPredefinedCategory(serviceCategoryOptions.webDesign)
 * 
 * Available options:
 * - serviceCategoryOptions.webDesign
 * - serviceCategoryOptions.branding
 * - serviceCategoryOptions.uxui
 * - serviceCategoryOptions.ecommerce
 * - serviceCategoryOptions.motionDesign
 * - serviceCategoryOptions.contentStrategy
 * - serviceCategoryOptions.seo
 * - serviceCategoryOptions.webDevelopment
 */

import { getCliClient } from 'sanity/cli'

// Get the Sanity client
const client = getCliClient()

/**
 * Creates a service category with translations for all supported languages
 * @param {Object} categoryData - The category data with translations (from serviceCategoryOptions)
 * @returns {Promise<Object>} - The created documents
 */
export async function createPredefinedCategory(categoryData) {
  if (!categoryData || !categoryData.ca || !categoryData.es || !categoryData.en) {
    throw new Error('Invalid category data. Must include translations for ca, es, and en.')
  }
  
  console.log('Creating service category...')
  const result = {}
  
  try {
    // Create the default language document (Catalan)
    const caDoc = await client.create({
      _type: 'serviceCategory',
      language: 'ca',
      title: categoryData.ca.title,
      description: categoryData.ca.description
    })
    
    result.ca = caDoc
    console.log(`Created Catalan category: ${categoryData.ca.title} (${caDoc._id})`)
    
    // Create the Spanish version with reference to the Catalan version
    const esDoc = await client.create({
      _type: 'serviceCategory',
      language: 'es',
      title: categoryData.es.title,
      description: categoryData.es.description,
      _translations: {
        ca: {
          _ref: caDoc._id,
          _type: 'reference'
        }
      },
      _lang: 'es'
    })
    
    result.es = esDoc
    console.log(`Created Spanish category: ${categoryData.es.title}`)
    
    // Create the English version with reference to the Catalan version
    const enDoc = await client.create({
      _type: 'serviceCategory',
      language: 'en',
      title: categoryData.en.title,
      description: categoryData.en.description,
      _translations: {
        ca: {
          _ref: caDoc._id,
          _type: 'reference'
        }
      },
      _lang: 'en'
    })
    
    result.en = enDoc
    console.log(`Created English category: ${categoryData.en.title}`)
    
    // Update the Catalan document with references to translations
    await client
      .patch(caDoc._id)
      .set({
        _translations: {
          es: {
            _ref: esDoc._id,
            _type: 'reference'
          },
          en: {
            _ref: enDoc._id,
            _type: 'reference'
          }
        },
        _lang: 'ca'
      })
      .commit()
    
    console.log(`Updated Catalan category with translation references`)
    return result
    
  } catch (err) {
    console.error('Error creating category:', err.message)
    throw err
  }
}

/**
 * Creates all predefined service categories
 * @param {Object} options - The service category options object
 * @returns {Promise<Object>} - The created documents
 */
export async function createAllPredefinedCategories(options) {
  console.log('Creating all predefined service categories...')
  const results = {}
  
  for (const [key, categoryData] of Object.entries(options)) {
    try {
      results[key] = await createPredefinedCategory(categoryData)
      console.log(`Created category: ${key}`)
    } catch (err) {
      console.error(`Error creating category ${key}:`, err.message)
    }
  }
  
  console.log('Finished creating all predefined service categories!')
  return results
}
