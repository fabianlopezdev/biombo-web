// src/shared/lib/sanity/queries/serviceCategoryQueries.ts
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import {
  serviceCategoriesSchema,
  type ServiceCategories,
} from '@/shared/schemas/sanity/serviceCategorySchema'

export async function fetchServiceCategoriesByLocale(
  locale: 'ca' | 'es' | 'en',
): Promise<ServiceCategories> {
  const query = `*[_type == "serviceCategory" && language == $locale] | order(title asc) {
    _id,
    _type,
    language,
    title,
    description
  }`
  const params = { locale }

  try {
    const categories = await fetchSanityQuery({
      query,
      params,
      schema: serviceCategoriesSchema,
    })
    return categories
  } catch (error) {
    console.warn(
      `Validation failed for service categories (locale: ${locale}). Attempting raw fetch. Error: ${error instanceof Error ? error.message : String(error)}`,
    )
    const raw = await fetchSanityQuery({ query, params })
    // Best effort: if it isn't an array, coerce to [] to keep rendering stable
    return Array.isArray(raw) ? (raw as ServiceCategories) : []
  }
}
