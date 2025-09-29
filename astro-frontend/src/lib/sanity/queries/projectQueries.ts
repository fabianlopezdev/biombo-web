// src/shared/lib/sanity/queries/projectQueries.ts
import { z } from 'zod'
import { fetchSanityQuery } from '@/lib/sanity/client'
import {
  projectSchema,
  projectsSchema,
  type Project,
  type Projects,
} from '@/lib/sanity/schemas/projectSchema'

// Define a schema for the ProjectsSection data structure
const projectsSectionSchema = z.object({
  _type: z.literal('projectsSection'),
  title: z.record(z.string()).optional(),
  subtitle: z.record(z.string()).optional(),
  viewAllText: z.record(z.string()).optional(),
  viewProjectText: z.record(z.string()).optional(),
  featuredProjects: z.array(z.any()).optional(), // We'll just validate the structure, not the content
})

// Export the type for ProjectsSection
export type ProjectsSection = z.infer<typeof projectsSectionSchema>

/**
 * Fetches a single project by slug with all content
 * @param slug - The project slug
 * @param locale - The locale to match (defaults to 'ca')
 * @returns The project data or null if not found
 */
export async function fetchProjectBySlug(
  slug: string,
  locale: 'ca' | 'es' | 'en' = 'ca',
): Promise<Project | null> {
  try {
    // Query for a project with the matching slug and language
    const query = `*[_type == "project" && slug.current == $slug && language == $locale][0] {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      language,
      title,
      slug,
      mainImage {
        ...,
        asset-> {
          ...,
          metadata {
            ...,
            lqip
          }
        }
      },
      thumbnailImage {
        ...,
        asset-> {
          ...,
          metadata {
            ...,
            lqip
          }
        }
      },
      useSeparateThumbnail,
      hoverColor { hex },
      textHoverColor { hex },
      clients[]-> {
        _id,
        name
      },
      services[]-> {
        _id,
        title,
        slug,
        description
      },
      categories[]-> {
        _id,
        title,
        description
      },
      mainText,
      contentSections[] {
        _type,
        _key,
        // For textBlock
        text,
        // For imageSection
        featuredImage {
          ...,
          asset-> {
            ...,
            metadata {
              ...,
              lqip
            }
          }
        },
        otherImages[] {
          ...,
          asset-> {
            ...,
            metadata {
              ...,
              lqip
            }
          }
        }
      },
      publishDate
    }`
    const params = { slug, locale }

    // Try fetching with schema validation
    const project = await fetchSanityQuery({
      query,
      params,
      schema: projectSchema,
    })

    return project
  } catch {
    return null
  }
}

/**
 * Alias for fetchProjectBySlug for backwards compatibility
 */
export const getProjectBySlug = fetchProjectBySlug

/**
 * Fetches all featured projects for the homepage
 * @returns Array of featured projects sorted by featuredOrder or null if none found
 */
export async function fetchFeaturedProjects(): Promise<Projects | null> {
  try {
    // Get all project documents
    const allProjectsQuery = `*[_type == "project"]{
      _createdAt,
      _id,
      _rev,
      _type,
      _updatedAt,
      categories,
      client,
      description,
      excerpt,
      featured,
      featuredOrder,
      mainImage,
      projectDate,
      slug,
      title
    }`

    // Fetch without schema validation first
    const rawProjects = await fetchSanityQuery({
      query: allProjectsQuery,
    })

    // Now try with schema validation
    let projects
    try {
      projects = await fetchSanityQuery({
        query: allProjectsQuery,
        schema: projectsSchema,
      })
    } catch {
      // If schema validation fails, use the raw data
      projects = rawProjects
    }

    // No projects found
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return null
    }

    // Define a type guard for project objects
    function isProjectWithFeaturedProps(
      obj: unknown,
    ): obj is { featured?: boolean; featuredOrder?: number } {
      return obj !== null && typeof obj === 'object' && 'featured' in obj
    }

    // Filter for featured projects if available using the type guard
    const featuredProjects = projects
      .filter((project) => isProjectWithFeaturedProps(project) && project.featured === true)
      .sort((a, b) => {
        // Get the featured order or use a high number as default
        const orderA = isProjectWithFeaturedProps(a) ? Number(a.featuredOrder) || 999 : 999
        const orderB = isProjectWithFeaturedProps(b) ? Number(b.featuredOrder) || 999 : 999
        return orderA - orderB
      })

    // If we have featured projects, return those, otherwise return all projects as a fallback
    // Cast to Projects to satisfy type safety
    return (featuredProjects.length > 0 ? featuredProjects : projects) as Projects
  } catch {
    try {
      // Use the same query string but without schema validation
      const rawProjectsQuery = `*[_type == "project" && featured == true] | order(featuredOrder asc)`
      const rawProjects = await fetchSanityQuery({
        query: rawProjectsQuery,
        params: {},
      })

      // Log the raw project data structure to help with debugging
      if (Array.isArray(rawProjects) && rawProjects.length > 0) {
        // Raw project data available for debugging
      }
    } catch {
      // Even raw fetch failed
    }

    return null
  }
}

/**
 * Fetches the projects section content from the homepage document
 * @returns The projects section data or null if not found
 */
export async function fetchProjectsSection(): Promise<ProjectsSection | null> {
  try {
    // Query for the complete projects section of the homepage with all its properties
    const query = `*[_type == "homePage"][0]{
      "projects": projects{
        _type,
        title,
        subtitle,
        viewAllText,
        viewProjectText,
        featuredProjects
      }
    }.projects`

    // Try fetching with schema validation
    const projectsSection = await fetchSanityQuery({
      query,
      schema: projectsSectionSchema,
    })

    return projectsSection
  } catch {
    return null
  }
}

/**
 * Fetches all projects (for projects listing page)
 * @returns Array of all projects or null if none found
 */
export async function fetchAllProjects(): Promise<Projects | null> {
  try {
    // Query for all projects
    const query = `*[_type == "project"] | order(_createdAt desc)`

    // Try fetching with schema validation
    const projects = await fetchSanityQuery({
      query,
      schema: projectsSchema,
    })

    return projects
  } catch {
    return null
  }
}

/**
 * Fetches all projects for a specific locale
 * @param locale - The locale to fetch projects for
 * @returns Array of projects for the specified locale or null if none found
 */
export async function fetchProjectsByLocale(locale: 'ca' | 'es' | 'en'): Promise<Projects | null> {
  try {
    // Query for all projects in the specified language, ordered by orderRank (manual order)
    const query = `*[_type == "project" && language == $locale] | order(orderRank) {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      language,
      title,
      slug,
      mainImage {
        ...,
        asset-> {
          ...,
          metadata {
            ...,
            lqip
          }
        }
      },
      thumbnailImage {
        ...,
        asset-> {
          ...,
          metadata {
            ...,
            lqip
          }
        }
      },
      useSeparateThumbnail,
      hoverColor { hex },
      textHoverColor { hex },
      clients[]-> {
        _id,
        name
      },
      services[]-> {
        _id,
        title,
        slug,
        description
      },
      categories[]-> {
        _id,
        title,
        description
      },
      mainText,
      publishDate
    }`

    const params = { locale }

    // Try fetching with schema validation
    const projects = await fetchSanityQuery({
      query,
      params,
      schema: projectsSchema,
    })

    return projects
  } catch {
    // If schema validation fails, try without it
    try {
      const query = `*[_type == "project" && language == $locale] | order(orderRank) {
        _id,
        _type,
        title,
        slug,
        mainImage,
        thumbnailImage,
        useSeparateThumbnail,
        clients,
        services,
        mainText,
        publishDate
      }`

      const params = { locale }
      const rawProjects = await fetchSanityQuery({ query, params })

      return Array.isArray(rawProjects) ? (rawProjects as Projects) : null
    } catch {
      return null
    }
  }
}
