// src/middleware.ts
import { defineMiddleware } from 'astro/middleware'

// Temporarily disable the astro-i18n middleware to isolate if it's causing the Invalid URL error
console.log('[Diagnostic Middleware] astro-i18n middleware DISABLED for debugging')

// Create a simple passthrough middleware that does nothing
export const onRequest = defineMiddleware((context, next) => {
  console.log('[Diagnostic Middleware] Using simple passthrough middleware')
  return next()
})
