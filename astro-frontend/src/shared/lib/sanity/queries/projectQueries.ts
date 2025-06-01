// src/shared/lib/sanity/queries/projectQueries.ts
import { z } from 'zod'
import { fetchSanityQuery } from '@/shared/lib/sanity/client'
import {
  projectSchema,
  projectsSchema,
  type Project,
  type Projects,
} from '@/shared/schemas/sanity/projectSchema'

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
 * Fetches a single project by slug
 * @param slug - The project slug
 * @param locale - The locale of the slug to match (defaults to 'ca')
 * @returns The project data or null if not found
 */
export async function fetchProjectBySlug(
  slug: string,
  locale: 'ca' | 'es' | 'en' = 'ca',
): Promise<Project | null> {
  try {
    // Query for a project with the matching slug in the specified locale
    const query = `*[_type == "project" && slug.${locale}.current == $slug][0]`
    const params = { slug }

    // Try fetching with schema validation
    const project = await fetchSanityQuery({
      query,
      params,
      schema: projectSchema,
    })

    return project
  } catch (error) {
    console.error(`Failed to fetch project with slug "${slug}" in locale "${locale}":`, error)
    return null
  }
}

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
      // console.log(
      //   'Projects after schema validation:',
      //   projects ? projects.length : 0,
      //   'projects found',
      // )
    } catch (error) {
      console.error('Error fetching projects with schema:', error)
      console.log('No schema provided, returning raw data')
      // If schema validation fails, use the raw data
      projects = rawProjects
    }

    // No projects found
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      console.warn('No projects found in Sanity')
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

    // console.log(
    //   `Found ${featuredProjects.length} featured projects out of ${projects.length} total projects`,
    // )

    // If we have featured projects, return those, otherwise return all projects as a fallback
    // Cast to Projects to satisfy type safety
    return (featuredProjects.length > 0 ? featuredProjects : projects) as Projects
  } catch (error: unknown) {
    console.error(
      'Error fetching featured projects:',
      error instanceof Error ? error.message : 'Unknown error',
    )

    // If validation failed, try fetching without schema validation for debugging
    console.log('Attempting to fetch without schema validation...')
    try {
      // Use the same query string but without schema validation
      const rawProjectsQuery = `*[_type == "project" && featured == true] | order(featuredOrder asc)`
      const rawProjects = await fetchSanityQuery({
        query: rawProjectsQuery,
        params: {},
      })
      // console.log('Raw projects data (no validation):', rawProjects)

      // Log the raw project data structure to help with debugging
      if (Array.isArray(rawProjects) && rawProjects.length > 0) {
        // console.log('First raw project structure:', JSON.stringify(rawProjects[0], null, 2))
      }
    } catch (secondError: unknown) {
      console.error(
        'Even raw fetch failed:',
        secondError instanceof Error ? secondError.message : 'Unknown error',
      )
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
    // console.log('Fetching projects section', { query })

    // Try fetching with schema validation
    const projectsSection = await fetchSanityQuery({
      query,
      schema: projectsSectionSchema,
    })

    return projectsSection
  } catch (error) {
    console.error('Failed to fetch projects section:', error)
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
    // console.log('Fetching all projects', { query })

    // Try fetching with schema validation
    const projects = await fetchSanityQuery({
      query,
      schema: projectsSchema,
    })

    return projects
  } catch (error) {
    console.error('Failed to fetch all projects:', error)
    return null
  }
}
