// src/shared/lib/sanity/queries/serviceQueries.ts
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import {
  servicesSchema,
  type Services,
} from '@/shared/schemas/sanity/serviceSchema'

export async function fetchServicesByLocale(
  locale: 'ca' | 'es' | 'en',
): Promise<Services> {
  const query = `*[_type == "service" && language == $locale] | order(orderRank) {
    _id,
    _type,
    language,
    title,
    description
  }`
  const params = { locale }

  try {
    const services = await fetchSanityQuery({
      query,
      params,
      schema: servicesSchema,
    })
    return services
  } catch {
    const raw = await fetchSanityQuery({ query, params })
    // Best effort: if it isn't an array, coerce to [] to keep rendering stable
    return Array.isArray(raw) ? (raw as Services) : []
  }
}