import type { APIRoute } from 'astro'
import { fetchProjectsByLocale } from '@/lib/sanity/queries/projectQueries'

const SITE_URL = 'https://biombostudio.com'

// Static pages for Catalan (default language)
const STATIC_PAGES = ['/', '/projectes', '/serveis', '/nosaltres', '/contacte', '/avis-legal']

export const GET: APIRoute = async () => {
  const urls: string[] = []

  // Add static pages
  for (const page of STATIC_PAGES) {
    urls.push(`${SITE_URL}${page}`)
  }

  // Fetch all Catalan projects from Sanity
  try {
    const projects = await fetchProjectsByLocale('ca')
    if (projects && Array.isArray(projects)) {
      for (const project of projects) {
        if (project.slug?.current) {
          urls.push(`${SITE_URL}/projectes/${project.slug.current}`)
        }
      }
    }
  } catch (error) {
    console.error('Error fetching projects for sitemap:', error)
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  })
}
