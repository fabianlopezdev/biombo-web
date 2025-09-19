// src/middleware.ts
import { defineMiddleware } from 'astro:middleware' // Rely on defineMiddleware for context/next types
import { useAstroI18n } from 'astro-i18n'
import astroI18nConfig from '../astro-i18n.config' // Import config directly for serverless

const pathsToExclude = [
  '/favicon.ico', // Common static asset
  '/favicon.svg', // Common static asset
  '/.well-known/', // For devtools and other services
  '/_image', // Astro's image service endpoint
  '/assets/', // Common prefix for static assets
  '/projectes', // Catalan project pages (both index and detail)
  '/es/proyectos', // Spanish project pages
  '/en/projects', // English project pages
  // Add any other specific paths or prefixes that should not be localized
  // e.g., '/api/' if you have API routes not handled by i18n
]

// Pass config directly for serverless/SSR compatibility
const i18nHandler = useAstroI18n(astroI18nConfig) // Pass config to avoid filesystem access

// context and next are automatically typed by defineMiddleware
const i18nFilteringMiddleware = defineMiddleware(async (context, next): Promise<Response> => {
  const { pathname } = context.url

  console.log('Middleware checking pathname:', pathname)

  const isExcluded = pathsToExclude.some((pathToExclude) => {
    if (pathname === pathToExclude || pathname.startsWith(pathToExclude)) {
      console.log('Path excluded:', pathname, 'matched by:', pathToExclude)
      return true
    }
    return false
  })

  if (isExcluded) {
    // next() returns Promise<Response>, so await it.
    return await next()
  }

  console.log('Path not excluded, applying i18n:', pathname)

  // If not excluded, apply the astro-i18n middleware
  // Use the pre-initialized handler
  // The type assertion 'as Response' helps ESLint understand the type of the awaited result.
  const response = (await i18nHandler(context, next)) as Response
  return response
})

export const onRequest = i18nFilteringMiddleware
