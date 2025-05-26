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
    console.log(`Fetching project with slug "${slug}" in locale "${locale}"`, { query, params })

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
    // Query for projects marked as featured and sort by featuredOrder
    const query = `*[_type == "project" && featured == true] | order(featuredOrder asc)`
    console.log('Fetching featured projects', { query })

    // Try fetching with schema validation
    const projects = await fetchSanityQuery({
      query,
      schema: projectsSchema,
    })

    return projects
  } catch (error) {
    console.error('Failed to fetch featured projects:', error)
    return null
  }
}

/**
 * Fetches the projects section content from the homepage document
 * @returns The projects section data or null if not found
 */
export async function fetchProjectsSection(): Promise<ProjectsSection | null> {
  try {
    // Query for just the projects section of the homepage
    const query = `*[_type == "homePage"][0].projects`
    console.log('Fetching projects section', { query })

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
    console.log('Fetching all projects', { query })

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
