import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import { servicesPageSchema, type ServicesPage } from '@/shared/schemas/sanity/servicesPageSchema'

export async function fetchServicesPageByLocale(locale: 'ca' | 'es' | 'en'): Promise<ServicesPage | null> {
  const query = `*[_type == "servicesPage" && language == $locale][0] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    language,
    title,
    description,
    "selectedServices": selectedServices[]-> {
      _id,
      _type,
      language,
      title,
      slug,
      description
    }
  }`
  const params = { locale }

  try {
    const servicesPage = await fetchSanityQuery({
      query,
      params,
      schema: servicesPageSchema,
    })
    return servicesPage
  } catch (error) {
    console.error('Error fetching services page:', error)
    return null
  }
}