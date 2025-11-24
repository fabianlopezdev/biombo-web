// src/shared/lib/sanity/queries/homePageQueries.ts
import { fetchSanityQuery } from '@/lib/sanity/client'
import { homePageSchema, type HomePage } from '@/lib/sanity/schemas/homePageSchema'

// Define common fields to select for the homepage to ensure consistency
const HOME_PAGE_FIELDS = `
  _id,
  _type,
  _createdAt,
  _updatedAt,
  language,
  hero,
  projects {
    ...,
    featuredProjects[] {
      _key,
      project -> {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        title,
        slug,
        mainMedia[] {
          _type,
          "asset": coalesce(asset.asset->, asset->) {
            _id,
            _type,
            url,
            path,
            assetId,
            extension,
            mimeType,
            size,
            originalFilename,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              },
              lqip
            }
          },
          backgroundColor { hex }
        },
        thumbnailMedia[] {
          _type,
          "asset": coalesce(asset.asset->, asset->) {
            _id,
            _type,
            url,
            path,
            assetId,
            extension,
            mimeType,
            size,
            originalFilename,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              },
              lqip
            }
          },
          backgroundColor { hex }
        },
        useSeparateThumbnail,
        homepageThumbnailMedia[] {
          _type,
          "asset": coalesce(asset.asset->, asset->) {
            _id,
            _type,
            url,
            path,
            assetId,
            extension,
            mimeType,
            size,
            originalFilename,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              },
              lqip
            }
          },
          backgroundColor { hex }
        },
        useMobileHomepageThumbnail,
        mobileHomepageThumbnailMedia[] {
          _type,
          "asset": coalesce(asset.asset->, asset->) {
            _id,
            _type,
            url,
            path,
            assetId,
            extension,
            mimeType,
            size,
            originalFilename,
            metadata {
              dimensions {
                width,
                height,
                aspectRatio
              },
              lqip
            }
          },
          backgroundColor { hex }
        },
        hoverColor { hex },
        textHoverColor { hex },
        excerpt,
        description,
        clients[]->{ name },
        categories,
        projectDate
      }
    }
  },
  about {
    _type,
    title,
    description[]{
      ...,
      markDefs[]{
        ...,
        _type == 'link' => {
          "href": @.href,
          "blank": @.blank
        }
      }
    },
    images[]{
      _key,
      _type,
      hotspot { x, y, height, width },
      crop { top, bottom, left, right },
      asset-> {
        ...,
        metadata {
          ...,
          lqip
        }
      }
    }
  },
  services {
    _type,
    title,
    subtitle,
    text,
    selectedServices[] -> {
      _id,
      _type,
      language,
      title,
      description
    }
  },
  clients {
    _type,
    title
  }
`

/**
 * Fetches the homepage data for a specific locale by targeting its unique document ID.
 * @param locale - The locale to fetch ('ca', 'es', 'en'). Defaults to 'ca'.
 * @returns The homepage data or null if not found or on error.
 */
export async function fetchHomePageByLocale(
  locale: 'ca' | 'es' | 'en' = 'ca',
): Promise<HomePage | null> {
  let documentId: string
  switch (locale) {
    case 'es':
      documentId = 'homePage-es'
      break
    case 'en':
      documentId = 'homePage-en'
      break
    case 'ca':
    default:
      documentId = 'homePage-ca' // Primary locale uses homePage-ca
      break
  }

  const query = `*[_id == $documentId][0]{ ${HOME_PAGE_FIELDS} }`
  const params = { documentId }

  try {
    // Attempt to fetch and validate with Zod schema
    const homePage = await fetchSanityQuery({
      query,
      params,
      schema: homePageSchema,
    })
    return homePage
  } catch {
    // Log schema validation failure and attempt to fetch raw data as a fallback
    // This can be useful during development if schema and data are temporarily misaligned
    try {
      const rawData = await fetchSanityQuery({
        query,
        params,
      })
      if (!rawData) {
        return null
      }
      return rawData as HomePage // Cast to HomePage, acknowledging potential mismatch
    } catch {
      return null
    }
  }
}

/**
 * Fetches the primary (Catalan) homepage data from Sanity.
 * This is an alias for fetchHomePageByLocale('ca').
 * @returns The Catalan homepage data or null if not found.
 */
export async function fetchHomePage(): Promise<HomePage | null> {
  return fetchHomePageByLocale('ca')
}
