// src/middleware.ts
import { defineMiddleware } from 'astro:middleware' // Rely on defineMiddleware for context/next types
import { useAstroI18n } from 'astro-i18n'

console.log('[Middleware] src/middleware.ts: Module loaded.')

const pathsToExclude = [
  '/favicon.svg', // Common static asset
  '/.well-known/', // For devtools and other services
  '/_image', // Astro's image service endpoint
  '/assets/', // Common prefix for static assets
  // Add any other specific paths or prefixes that should not be localized
  // e.g., '/api/' if you have API routes not handled by i18n
]

// Call useAstroI18n() ONCE to get the handler
const i18nHandler = useAstroI18n() // ESLint might perceive this as 'any'

// context and next are automatically typed by defineMiddleware
const i18nFilteringMiddleware = defineMiddleware(async (context, next): Promise<Response> => {
  const { pathname } = context.url
  console.log(`[i18nFilteringMiddleware] Request for: ${pathname}`)

  const isExcluded = pathsToExclude.some((pathToExclude) => {
    if (pathname === pathToExclude || pathname.startsWith(pathToExclude)) {
      console.log(
        `[i18nFilteringMiddleware] Path ${pathname} matches exclude rule: ${pathToExclude}. Bypassing i18n.`,
      )
      return true
    }
    return false
  })

  if (isExcluded) {
    console.log(`[i18nFilteringMiddleware] Bypassing astro-i18n for ${pathname}`)
    // next() returns Promise<Response>, so await it.
    return await next()
  }

  console.log(`[i18nFilteringMiddleware] Applying astro-i18n for ${pathname}`)
  // If not excluded, apply the astro-i18n middleware
  // Use the pre-initialized handler
  // The type assertion 'as Response' helps ESLint understand the type of the awaited result.
  const response = (await i18nHandler(context, next)) as Response
  return response
})

export const onRequest = i18nFilteringMiddleware

console.log('[Middleware] src/middleware.ts: onRequest handler set to i18nFilteringMiddleware.')
